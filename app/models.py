from sqlalchemy import Column, String, DateTime, Integer, Text
from datetime import datetime
from app.database import Base
from sqlalchemy.dialects.postgresql import JSONB


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True)

    status = Column(String)
    task_type = Column(String)

    payload = Column(JSONB)

    retries = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)

    run_at = Column(DateTime)

    celery_task_id = Column(String, nullable=True)

    # ✅ NEW: Execution Tracking
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # ✅ NEW: Logs Storage
    logs = Column(Text, default="")

    result = Column(Text)
    error_message = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)

    # ✅ MOST IMPORTANT: Task Owner
    user_id = Column(String, nullable=True)


class ArchivedTask(Base):
    __tablename__ = "archived_tasks"

    id = Column(String, primary_key=True)
    status = Column(String)
    task_type = Column(String)
    payload = Column(JSONB)
    retries = Column(Integer)
    max_retries = Column(Integer)
    run_at = Column(DateTime)
    celery_task_id = Column(String, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    logs = Column(Text)
    result = Column(Text)
    error_message = Column(Text)
    created_at = Column(DateTime)
    user_id = Column(String, nullable=True)
    
    # ✅ Extra field for when it was archived
    archived_at = Column(DateTime, default=datetime.utcnow)