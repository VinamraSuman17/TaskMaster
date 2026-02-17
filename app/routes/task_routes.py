from fastapi import APIRouter, HTTPException, Depends
from uuid import uuid4
from datetime import datetime
import os
import csv
import io
from fastapi.responses import FileResponse, StreamingResponse

from app.database import SessionLocal
from app.models import Task
from app.schemas import TaskCreate

from app.auth_dependency import get_current_user

router = APIRouter()


# =========================================================
# ✅ 1. Schedule New Task (User Protected)
# =========================================================
@router.post("/schedule-task/")
def schedule_task(
    data: TaskCreate,
    current_user=Depends(get_current_user)
):
    db = SessionLocal()

    run_time = datetime.strptime(data.run_at, "%Y-%m-%d %H:%M")

    new_task = Task(
        id=str(uuid4()),
        status="SCHEDULED",
        task_type=data.task_type,
        payload=data.payload,
        retries=0,
        run_at=run_time,

        # ✅ THIS IS IMPORTANT
        user_id=current_user.id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {"message": "Task scheduled successfully!", "task_id": new_task.id}

# =========================================================
# ✅ 2. List Tasks (Only Current User)
# =========================================================
@router.get("/tasks/")
def list_tasks(current_user=Depends(get_current_user)):
    db = SessionLocal()

    tasks = db.query(Task).filter(
        Task.user_id == current_user.id
    ).order_by(Task.created_at.desc()).all()

    db.close()

    return {
        "count": len(tasks),
        "tasks": [
            {
                "id": t.id,
                "status": t.status,
                "task_type": t.task_type,
                "payload": t.payload,
                "retries": t.retries,
                "result": t.result,
                "error_message": t.error_message,
                "run_at": t.run_at,
                "created_at": t.created_at,
                "completed_at": t.completed_at,
                "logs": t.logs
            }
            for t in tasks
        ]
    }


# =========================================================
# ✅ 3. Cancel Task (Only Owner Allowed)
# =========================================================
@router.post("/tasks/{task_id}/cancel")
def cancel_task(
    task_id: str,
    current_user=Depends(get_current_user)
):
    db = SessionLocal()

    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # ✅ Ownership Check
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    if task.status not in ["SCHEDULED", "PENDING"]:
        raise HTTPException(
            status_code=400,
            detail=f"Task already {task.status}, cannot cancel"
        )

    task.status = "CANCELLED"
    db.commit()
    db.close()

    return {"message": "Task cancelled successfully"}


# =========================================================
# ✅ 4. Download Report (Protected)
# =========================================================
@router.get("/download-report/{task_id}")
def download_report(
    task_id: str,
    current_user=Depends(get_current_user)
):
    db = SessionLocal()

    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    report_path = f"reports/report_{task_id}.pdf"

    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="Report not found")

    return FileResponse(report_path, filename=f"report_{task_id}.pdf")

# =========================================================
# ✅ 5. Export Tasks as CSV (Protected)
# =========================================================
@router.get("/tasks/export_csv")
def export_tasks_csv(
    current_user=Depends(get_current_user)
):
    db = SessionLocal()
    
    tasks = db.query(Task).filter(
        Task.user_id == current_user.id
    ).order_by(Task.created_at.desc()).all()
    
    # Create CSV in memory string
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow(["ID", "Task Type", "Status", "Created At", "Run At", "Completed At", "Result", "Error"])
    
    # Data
    for t in tasks:
        writer.writerow([
            t.id,
            t.task_type,
            t.status,
            t.created_at,
            t.run_at,
            t.completed_at or "",
            t.result or "",
            t.error_message or ""
        ])
        
    db.close()
    
    # Convert to bytes for StreamingResponse
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=tasks_export.csv"}
    )