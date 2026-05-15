from fastapi import APIRouter, Depends, HTTPException, Response, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from database import get_db, User
from auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/api/auth")


class Credentials(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register(body: Credentials, response: Response, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email already registered")
    if len(body.password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")
    user = User(email=body.email, password_hash=hash_password(body.password))
    db.add(user); db.commit(); db.refresh(user)
    token = create_token(user.id)
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=2592000)
    return {"id": user.id, "email": user.email, "credits": user.credits}


@router.post("/login")
def login(body: Credentials, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    token = create_token(user.id)
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=2592000)
    return {"id": user.id, "email": user.email, "credits": user.credits}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"ok": True}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "credits": user.credits}
