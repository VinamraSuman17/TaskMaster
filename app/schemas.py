from pydantic import BaseModel
from typing import Any, Optional


class TaskCreate(BaseModel):
    run_at: str
    task_type: str
    payload: Any   # ✅ payload अब string भी हो सकता है, dict भी


class TaskResponse(BaseModel):
    id: str
    status: str
    task_type: str
    payload: Any
    result: Optional[str] = None
    error_message: Optional[str] = None