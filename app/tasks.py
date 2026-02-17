from app.celery_app import celery
from app.database import SessionLocal
from app.models import Task, ArchivedTask

from datetime import datetime, timedelta
import time
import os
import traceback
import smtplib
from email.message import EmailMessage

from reportlab.pdfgen import canvas
from dotenv import load_dotenv

# =====================================================
# ✅ Load ENV Properly
# =====================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, "..", ".env")
load_dotenv(ENV_PATH)

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

# =====================================================
# ✅ Reports Folder Setup
# =====================================================
REPORT_DIR = os.path.join(BASE_DIR, "..", "reports")
os.makedirs(REPORT_DIR, exist_ok=True)


# =====================================================
# ✅ Log Helper Function
# =====================================================
def add_log(task_row, db, message):
    timestamp = datetime.utcnow().strftime("%H:%M:%S")

    if not task_row.logs:
        task_row.logs = ""

    task_row.logs += f"[{timestamp}] {message}\n"
    db.commit()


# =====================================================
# ✅ Email Sender Helper
# =====================================================
def send_email(to_email, subject, body):

    if not EMAIL_USER or not EMAIL_PASS:
        raise Exception("❌ EMAIL_USER or EMAIL_PASS missing in .env")

    msg = EmailMessage()
    msg["From"] = EMAIL_USER
    msg["To"] = to_email
    msg["Subject"] = subject

    # ✅ FIX: Use Actual Body from Payload
    msg.set_content(body)

    # ✅ Gmail SMTP SSL
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(EMAIL_USER, EMAIL_PASS)
        smtp.send_message(msg)


# =====================================================
# ✅ PDF Generator Helper
# =====================================================
def generate_pdf_report(title, content, task_id):

    filename = f"report_{task_id}.pdf"
    filepath = os.path.join(REPORT_DIR, filename)

    c = canvas.Canvas(filepath)

    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, 800, title)

    c.setFont("Helvetica", 12)
    c.drawString(100, 760, content)

    c.save()

    return filepath


# =====================================================
# ✅ Main Task Executor
# =====================================================
@celery.task(bind=True)
def execute_task(self, task_id):

    db = SessionLocal()
    task_row = db.query(Task).filter(Task.id == task_id).first()

    try:
        # -------------------------------
        # Task Not Found
        # -------------------------------
        if not task_row:
            return {"error": "Task not found"}

        # -------------------------------
        # Cancelled Task Skip
        # -------------------------------
        if task_row.status == "CANCELLED":
            return {"status": "CANCELLED"}

        # -------------------------------
        # Mark Running
        # -------------------------------
        task_row.status = "RUNNING"
        # Only set started_at if it's the first run (or if you want to track latest run)
        if not task_row.started_at: 
             task_row.started_at = datetime.utcnow()
        
        db.commit()

        add_log(task_row, db, f"🚀 Task Started (type={task_row.task_type}) [Try {task_row.retries + 1}/{task_row.max_retries + 1}]")

        payload = task_row.payload

        # =====================================================
        # ✅ SEND MESSAGE TASK
        # =====================================================
        if task_row.task_type == "send_message":
            add_log(task_row, db, "📩 Sending Message...")

            task_row.result = f"Message sent: {payload}"

            add_log(task_row, db, "✅ Message Delivered Successfully")

        # =====================================================
        # ✅ SEND EMAIL TASK (REAL FIXED)
        # =====================================================
        elif task_row.task_type == "send_email":

            add_log(task_row, db, "📧 Email Task Triggered")

            # ✅ Extract Payload Values
            to_email = payload.get("to")
            subject = payload.get("subject", "Task Scheduler Email")

            # ✅ FIX: Body should come from "body" or "content"
            body = payload.get("content") or payload.get("body", "Hello from Task Scheduler!")
            if not to_email:
                raise Exception("❌ Recipient email missing in payload")

            add_log(task_row, db, f"📨 Sending Email To: {to_email}")
            add_log(task_row, db, f"📝 Subject: {subject}")
            add_log(task_row, db, f"📄 Body: {body}")

            # ✅ Send Actual Email
            send_email(to_email, subject, body)

            task_row.result = f"✅ Email sent successfully to {to_email}"
            add_log(task_row, db, "✅ Email Sent Successfully")

        # =====================================================
        # ✅ GENERATE PDF REPORT TASK
        # =====================================================
        elif task_row.task_type == "generate_report":

            add_log(task_row, db, "📄 Generating PDF Report...")

            title = payload.get("title", "Task Report")
            content = payload.get("content", "No content provided")

            filepath = generate_pdf_report(title, content, task_id)

            task_row.result = f"PDF Report Generated: {filepath}"
            add_log(task_row, db, f"✅ Report Saved at {filepath}")

        # =====================================================
        # ❌ UNKNOWN TASK
        # =====================================================
        else:
            add_log(task_row, db, "⚠️ Unknown Task Type Received")
            task_row.result = "Unknown task type"

        # Simulate Processing Delay
        time.sleep(2)

        # -------------------------------
        # Mark Success
        # -------------------------------
        task_row.status = "SUCCESS"
        task_row.completed_at = datetime.utcnow()
        db.commit()

        add_log(task_row, db, "🎉 Task Finished Successfully")

        return {"status": "DONE"}

    except Exception as exc:
        
        # -------------------------------
        # 🔄 RETRY LOGIC
        # -------------------------------
        # Check if we should retry
        if task_row.retries < task_row.max_retries:
            task_row.retries += 1
            task_row.status = "RETRYING"
            task_row.error_message = str(exc)
            
            # Log the retry
            add_log(task_row, db, f"⚠️ Task Failed: {str(exc)}")
            add_log(task_row, db, f"🔄 Retrying... (Attempt {task_row.retries}/{task_row.max_retries})")
            db.commit()

            # Retry Delay (Exponential Backoff could be used here, simple 5s for now)
            # We use self.retry which raises a Retry exception, breaking flow
            try:
                # Close DB before retry raises exception
                db.close() 
                raise self.retry(exc=exc, countdown=5)
            except Exception as retry_exc:
                # If retry check failed specifically (e.g. MaxRetriesExceededError from celery itself, 
                # though we checked manually above)
                # Just re-raise to let the outer block handle final failure if needed
                # But self.retry actually raises a special exception that Celery catches.
                raise retry_exc

        # -------------------------------
        # ❌ FINAL FAILURE
        # -------------------------------
        task_row.status = "FAILED"
        task_row.error_message = str(exc)
        db.commit()

        tb = traceback.format_exc()
        add_log(task_row, db, f"❌ Task Failed Permanently:\n{tb}")

        return {"status": "FAILED", "error": str(exc)}

    finally:
        db.close()