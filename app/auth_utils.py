from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

# Secret key (change in production)
SECRET_KEY = "SUPER_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ✅ Hash password
def hash_password(password: str):
    return pwd_context.hash(password)


# ✅ Verify password
def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)


# ✅ Create JWT Token
def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})

    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)