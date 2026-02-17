from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

import os

from dotenv import load_dotenv

from app.database import engine
from app.models import Base, Task
from app.models_user import User

# Routers
from app.routes.task_routes import router as task_router
from app.routes.auth_routes import router as auth_router
from fastapi.security import HTTPBearer

load_dotenv()

# -----------------------------
# FastAPI App
# -----------------------------
app = FastAPI(title="⚡ Task Scheduler SaaS")


bearer_scheme = HTTPBearer()
# -----------------------------
# CORS Middleware (Frontend Support)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Create Tables (Task + User)
# -----------------------------
Base.metadata.create_all(bind=engine)

# -----------------------------
# Include Routers
# -----------------------------
app.include_router(task_router)
app.include_router(auth_router)


# =========================================================
# ✅ Download PDF Report Endpoint
# =========================================================
@app.get("/download-report/{task_id}")
def download_report(task_id: str):
    filepath = f"reports/report_{task_id}.pdf"

    if not os.path.exists(filepath):
        return {"error": "Report not found"}

    return FileResponse(
        filepath,
        media_type="application/pdf",
        filename=f"report_{task_id}.pdf"
    )


# =========================================================
# ✅ Root Health Check
# =========================================================
@app.get("/")
def root():
    return {"message": "🚀 Task Scheduler Backend Running Successfully!"}