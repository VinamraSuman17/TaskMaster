from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

from app.database import SessionLocal
from app.models_user import User
from app.auth_utils import SECRET_KEY, ALGORITHM

# Swagger will use this login URL
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# ======================================================
# ✅ Get Current Logged In User
# ======================================================
def get_current_user(token: str = Depends(oauth2_scheme)):

    try:
        # Decode JWT Token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Fetch User from DB
        db = SessionLocal()
        user = db.query(User).filter(User.id == user_id).first()
        db.close()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Token verification failed")