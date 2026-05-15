# MIRROR Web

Production-ready webapp for the MIRROR AI content pipeline.

**Stack:** React + TypeScript + Tailwind (frontend) · FastAPI + SQLite + JWT (backend)

## Quick start

```bash
chmod +x start.sh && ./start.sh
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## Manual setup

```bash
# Backend
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## User journey

1. Land on `/` — marketing page
2. Register / sign in → `/dashboard`
3. Click "New generation" → `/generate` — upload voice memo
4. Pipeline runs → redirect to `/result/:jobId`
5. View videos, scripts, translations — download or share

## Environment

`backend/.env`:
```
SECRET_KEY=your-random-secret
MIRROR_PIPELINE_PATH=../mirror   # path to the mirror pipeline repo
```
