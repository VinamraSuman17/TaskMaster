from sqlalchemy import Column, String, DateTime
from datetime import datetime
from uuid import uuid4

from app.database import Base


class User(Base):
    __tablename__ = "users"

    # ✅ Auto UUID Primary Key
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))

    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)