from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.database import SessionLocal
from app.models_user import User
from app.auth_utils import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


# ============================
# ✅ Register Schema
# ============================
class RegisterRequest(BaseModel):
    email: str
    password: str


# ============================
# ✅ Register (JSON Body)
# ============================
@router.post("/register")
def register(data: RegisterRequest):
    db = SessionLocal()

    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()

    return {"message": "User registered successfully"}


# ============================
# ✅ Login (Swagger Compatible)
# ============================
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = SessionLocal()

    user = db.query(User).filter(User.email == form_data.username).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.id})
    db.close()

    return {
        "access_token": token,
        "token_type": "bearer"
    }