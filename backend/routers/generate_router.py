import json
import sys
import uuid
import traceback
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from database import get_db, Job, User
from auth import get_current_user
from config import MIRROR_PIPELINE_PATH

router = APIRouter(prefix="/api")

UPLOAD_DIR = Path("/tmp/mirror_web_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

AUDIO_EXTS = {".mp3", ".wav", ".m4a", ".ogg", ".webm"}
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def _text_to_audio(text: str, out_path: str, pipeline_path: str):
    """Convert text to MP3 using ElevenLabs TTS with a default voice."""
    if pipeline_path not in sys.path:
        sys.path.insert(0, pipeline_path)
    from clients.elevenlabs import _client  # type: ignore
    audio = _client.text_to_speech.convert(
        text=text[:5000],
        voice_id="JBFqnCBsd6RMkjVDRZzb",  # ElevenLabs default "George" voice
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128",
    )
    with open(out_path, "wb") as f:
        for chunk in audio:
            f.write(chunk)


def _run_pipeline(job_id: str, audio_path: str, image_path: Optional[str],
                  user_id: int, text_input: Optional[str] = None):
    db = next(get_db())
    try:
        base = Path(__file__).parent.parent
        mirror_path = str((base / MIRROR_PIPELINE_PATH).resolve())
        if mirror_path not in sys.path:
            sys.path.insert(0, mirror_path)

        # Text mode: generate audio from text first
        if text_input:
            _text_to_audio(text_input, audio_path, mirror_path)

        from core.orchestrator import run_pipeline  # type: ignore
        result = run_pipeline(audio_path, user_id=str(user_id), image_path=image_path)

        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            job.status = "complete"
            job.result_json = json.dumps(result, default=str)
            job.total_outputs = result.get("total_outputs", 0)
            job.emotion = result.get("emotion", "")
            job.duration_seconds = result.get("duration_seconds", 0)
            db.commit()
    except Exception:
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            job.status = "error"
            job.error = traceback.format_exc()
            db.commit()
    finally:
        db.close()


@router.post("/generate")
async def generate(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    image: Optional[UploadFile] = File(None),
    text_input: Optional[str] = Form(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job_id = str(uuid.uuid4())
    is_text_mode = bool(text_input and text_input.strip())

    if is_text_mode:
        if len(text_input.strip()) < 50:
            raise HTTPException(400, "Text must be at least 50 characters.")
        audio_path = str(UPLOAD_DIR / f"{job_id}.mp3")
        image_path = None
    else:
        suffix = Path(file.filename or "").suffix.lower()
        if suffix not in AUDIO_EXTS:
            raise HTTPException(400, f"Unsupported audio type. Use: {', '.join(AUDIO_EXTS)}")
        content = await file.read()
        if len(content) > 32 * 1024 * 1024:
            raise HTTPException(400, "File too large. Max 32 MB.")
        audio_path = str(UPLOAD_DIR / f"{job_id}{suffix}")
        Path(audio_path).write_bytes(content)
        image_path = None

    if image and image.filename:
        img_suffix = Path(image.filename).suffix.lower()
        if img_suffix in IMAGE_EXTS:
            img_content = await image.read()
            image_path = str(UPLOAD_DIR / f"{job_id}_img{img_suffix}")
            Path(image_path).write_bytes(img_content)

    job = Job(id=job_id, user_id=user.id, audio_path=audio_path)
    db.add(job); db.commit()

    background_tasks.add_task(
        _run_pipeline, job_id, audio_path, image_path, user.id,
        text_input.strip() if is_text_mode else None
    )
    return {"job_id": job_id, "status": "running"}
