# from celery import Celery

# celery = Celery(
#     "task_scheduler",
#     broker="redis://localhost:6379/0",
#     backend="redis://localhost:6379/0",
#     include=[
#         "app.tasks",
#         "app.scheduler",   # ✅ IMPORTANT
#     ]
# )

# celery.conf.timezone = "Asia/Kolkata"
# celery.conf.enable_utc = False


# # ✅ Beat schedule
# celery.conf.beat_schedule = {
#     "check-db-every-5-seconds": {
#         "task": "app.scheduler.check_scheduled_tasks",
#         "schedule": 5.0,
#     }
# }


from celery import Celery
from kombu import Queue

celery = Celery(
    "task_scheduler",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=[
        "app.tasks",
        "app.scheduler",
    ]
)

# -----------------------------
# Timezone Config
# -----------------------------
celery.conf.timezone = "Asia/Kolkata"
celery.conf.enable_utc = False

# -----------------------------
# ✅ Priority Queues Setup
# -----------------------------
celery.conf.task_queues = (
    Queue("urgent"),   # Emails / OTP
    Queue("normal"),   # Messages
    Queue("batch"),    # Reports / Heavy jobs
)

# Default routing
celery.conf.task_routes = {
    "app.tasks.execute_task": {"queue": "normal"},
}

# -----------------------------
# ✅ Beat Schedule
# -----------------------------
celery.conf.beat_schedule = {
    "check-db-every-5-seconds": {
        "task": "app.scheduler.check_scheduled_tasks",
        "schedule": 5.0,
    }
}