import json
import sys
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from database import get_db, Job, User
from auth import get_current_user
from config import MIRROR_PIPELINE_PATH

router = APIRouter(prefix="/api")

UPLOAD_DIR = Path("/tmp/mirror_web_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def _run_pipeline(job_id: str, audio_path: str, user_id: int):
    """Run mirror pipeline in background and update job in DB."""
    db = next(get_db())
    try:
        # Resolve pipeline path relative to this file's location (backend/)
        base = Path(__file__).parent.parent  # mirror-web root
        mirror_path = str((base / MIRROR_PIPELINE_PATH).resolve())
        if mirror_path not in sys.path:
            sys.path.insert(0, mirror_path)

        from core.orchestrator import run_pipeline  # type: ignore
        result = run_pipeline(audio_path, user_id=str(user_id))

        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            job.status = "complete"
            job.result_json = json.dumps(result, default=str)
            job.total_outputs = result.get("total_outputs", 0)
            job.emotion = result.get("emotion", "")
            job.duration_seconds = result.get("duration_seconds", 0)
            db.commit()
    except Exception as e:
        import traceback
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
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename or not any(file.filename.endswith(ext) for ext in [".mp3", ".wav", ".m4a", ".ogg", ".webm"]):
        raise HTTPException(400, "Unsupported file type. Use MP3, WAV, M4A, OGG, or WebM.")

    job_id = str(uuid.uuid4())
    audio_path = str(UPLOAD_DIR / f"{job_id}_{file.filename}")

    content = await file.read()
    if len(content) > 32 * 1024 * 1024:
        raise HTTPException(400, "File too large. Max 32 MB.")
    Path(audio_path).write_bytes(content)

    job = Job(id=job_id, user_id=user.id, audio_path=audio_path)
    db.add(job); db.commit()

    background_tasks.add_task(_run_pipeline, job_id, audio_path, user.id)
    return {"job_id": job_id, "status": "running"}
