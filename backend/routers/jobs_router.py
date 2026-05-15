import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, Job, User
from auth import get_current_user

router = APIRouter(prefix="/api")


@router.get("/jobs")
def list_jobs(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    jobs = db.query(Job).filter(Job.user_id == user.id).order_by(Job.created_at.desc()).all()
    return [
        {
            "id": j.id, "status": j.status, "created_at": j.created_at.isoformat(),
            "total_outputs": j.total_outputs, "emotion": j.emotion,
            "duration_seconds": j.duration_seconds,
        }
        for j in jobs
    ]


@router.get("/jobs/{job_id}")
def get_job(job_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == user.id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    return {
        "id": job.id,
        "status": job.status,
        "created_at": job.created_at.isoformat(),
        "error": job.error,
        "result_json": json.loads(job.result_json) if job.result_json else None,
    }
