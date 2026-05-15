#!/bin/bash
# Start backend
cd backend
cp .env.example .env 2>/dev/null || true
pip install -r requirements.txt -q
uvicorn main:app --reload --port 8000 &

# Start frontend
cd ../frontend
npm install -q
npm run dev
