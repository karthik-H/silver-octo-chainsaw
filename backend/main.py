from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from models import Task, TaskCreate
import database

app = FastAPI(title="Personal To-Do Manager API")

origins = [
    "http://localhost:5173", # Vite default
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={"error": "Validation error", "details": exc.errors()},
    )

@app.get("/tasks", response_model=List[Task])
async def read_tasks():
    return database.get_tasks()

@app.post("/tasks", response_model=Task)
async def create_task(task: TaskCreate):
    return database.add_task(task)

@app.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, task: TaskCreate, request: Request):
    if request.headers.get("content-type") is None:
        raise HTTPException(status_code=415, error="Missing Content-Type header")
    updated_task = database.update_task(task_id, task)
    if updated_task is None:
        raise HTTPException(status_code=404, error="Task not found")
    return updated_task

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    success = database.delete_task(task_id)
    if not success:
        raise HTTPException(status_code=404, error="Task not found")
    return {"message": "Task deleted successfully"}
