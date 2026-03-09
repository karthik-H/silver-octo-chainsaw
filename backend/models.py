from pydantic import BaseModel
from typing import Optional
from datetime import date
from enum import Enum

class Priority(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"

class Category(str, Enum):
    work = "Work"
    personal = "Personal"
    study = "Study"

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Priority = Priority.medium
    category: Optional[Category] = None
    due_date: Optional[date] = None
    completed: bool = False
    user_name: str

    @classmethod
    def validate_non_empty(cls, value, field):
        if isinstance(value, str) and value.strip() == "":
            raise ValueError(f"{field} cannot be empty")
        return value

    @classmethod
    def __get_validators__(cls):
        yield cls._validate_fields

    @classmethod
    def _validate_fields(cls, values):
        for field in ["title", "user_name"]:
            if field in values:
                cls.validate_non_empty(values[field], field)
        return values

    class Config:
        extra = "ignore"

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: str
