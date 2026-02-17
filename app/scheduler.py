from datetime import datetime
from app.database import SessionLocal
from app.models import Task
from app.tasks import execute_task
from app.celery_app import celery


@celery.task
def check_scheduled_tasks():
    db = SessionLocal()
    now = datetime.now()

    # ✅ Only scheduled tasks that are due
    tasks = db.query(Task).filter(
        Task.status == "SCHEDULED",
        Task.run_at <= now
    ).all()

    for task in tasks:
        print("🚀 Dispatching scheduled task:", task.id)

        # ✅ Mark Pending
        task.status = "PENDING"
        db.commit()

        # -----------------------------
        # ✅ Always Send to General Queue
        # -----------------------------
        queue_name = "celery"

        print(f"📌 Sending task to queue: {queue_name}")

        # ✅ Send to Celery General Worker
        res = execute_task.apply_async(
            args=[task.id],
            queue=queue_name
        )

        # ✅ Save celery task id
        task.celery_task_id = res.id
        db.commit()

        print("✅ Celery Task ID Saved:", res.id)

    db.close()