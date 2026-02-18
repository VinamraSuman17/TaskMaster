# 🚀 Task Scheduler Service  
### FastAPI + Celery + Redis + PostgreSQL

A production-grade **distributed task scheduling backend system** that enables asynchronous background job execution with persistent task tracking.

This project demonstrates real-world backend engineering concepts such as:

- Task Queues  
- Worker Systems  
- Database-backed Task Monitoring  
- Fault-tolerant Background Processing  

---

---

## 📌 Project Overview

Modern applications often need to execute tasks in the background, such as:

- Sending emails  
- Processing payments  
- Generating reports  
- Running ML inference pipelines  
- Scheduling notifications  

Doing these inside normal API requests is inefficient and unreliable.

So companies use **task scheduling services** where:

- API schedules a task  
- Worker executes it asynchronously  
- Database stores task status  

This project replicates that production architecture.

---

---

## 🏗️ System Architecture

Client Request
|
v
FastAPI Server
|
|--> Store Task Metadata in PostgreSQL
|
v
Push Task ID into Redis Queue
|
v
Celery Worker consumes task
|
v
Executes job + updates status in PostgreSQL


---

---

## ✅ Features Implemented (Current Progress)

✔ REST API to schedule background tasks  
✔ Redis-backed message queue for task dispatching  
✔ Celery worker system for async execution  
✔ PostgreSQL persistence for task metadata  
✔ Task lifecycle tracking:

PENDING → RUNNING → SUCCESS


✔ API endpoint to check task status using Task ID  
✔ Production-style separation: API Server + Worker  

---

---

## 📂 Folder Structure

task_scheduler/
│
├── app/
│ ├── main.py # FastAPI endpoints
│ ├── celery_app.py # Celery configuration
│ ├── tasks.py # Background task execution logic
│ ├── database.py # PostgreSQL connection setup
│ ├── models.py # SQLAlchemy Task model
│
├── docker-compose.yml # Redis + PostgreSQL containers
├── requirements.txt # Dependencies
└── README.md


---

---

## ⚙️ Tech Stack

- **FastAPI** → REST API Layer  
- **Celery** → Background Worker Execution  
- **Redis** → Task Queue / Broker  
- **PostgreSQL** → Persistent Task Storage  
- **Docker Compose** → Service Management  

---

---

## 🚀 How to Run This Project (Step-by-Step)

---

### 1️⃣ Clone Repository

```bash
git clone <repo-link>
cd task_scheduler
2️⃣ Install Dependencies
pip install -r requirements.txt
3️⃣ Start Redis + PostgreSQL using Docker
Make sure Docker Desktop is running.

docker compose up -d
Check containers:

docker ps
4️⃣ Start FastAPI Server
Open Terminal 1:

uvicorn app.main:app --reload
Server will run at:

http://127.0.0.1:8000
Swagger Docs:

http://127.0.0.1:8000/docs
5️⃣ Start Celery Worker
Open Terminal 2:

celery -A app.celery_app.celery worker --loglevel=info --pool=solo
⚠️ --pool=solo is required for Windows.

✅ API Usage
Schedule a Background Task
Endpoint:

POST /run-task/
Response Example:

{
  "message": "Task scheduled successfully!",
  "task_id": "e8896d9a-28a8-401c-ba00-189c993add73"
}
Check Task Status
Endpoint:

GET /tasks/{task_id}
Example:

GET /tasks/e8896d9a-28a8-401c-ba00-189c993add73
Response:

{
  "task_id": "e8896d9a-28a8-401c-ba00-189c993add73",
  "status": "SUCCESS"
}
🗄 Database Verification
Open PostgreSQL shell:

docker exec -it task_scheduler-db-1 psql -U admin -d scheduler_db
Run:

SELECT * FROM tasks;
Example Output:

Task ID	Status	Created At
e8896d9a...	SUCCESS	timestamp
📌 Task Lifecycle
Status	Meaning
PENDING	Task created but not executed yet
RUNNING	Worker is executing the task
SUCCESS	Task completed successfully
FAILED	Task failed after retries (coming soon)
🚧 Remaining Work (Future Enhancements)
This project is functional but production upgrades are planned:

Retry + exponential backoff handling

Failure logging + error storage in DB

Scheduled tasks (run_at execution)

JWT Authentication + Rate Limiting

Monitoring Dashboard (Celery Flower / Custom UI)

Full Dockerization of API + Worker

Cloud Deployment (AWS/GCP)

🏆 Resume Bullet
Engineered a distributed task scheduling system using FastAPI, Celery, Redis, and PostgreSQL with asynchronous execution, persistent task tracking, and real-time status monitoring via REST APIs.

👨‍💻 Author
Built by Vinamra Suman
Backend + Distributed Systems Project


---
✅ JWT Auth  
✅ Full Docker Deployment  

बस bol:

**Next: Retry system add karo**
