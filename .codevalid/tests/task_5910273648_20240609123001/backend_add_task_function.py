import pytest
import os
import json
import uuid
from datetime import date
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from backend.database import add_task, get_tasks, save_tasks, get_task
from backend.models import Task, TaskCreate, Priority

DB_FILE = "tasks.json"

@pytest.fixture(autouse=True)
def clean_db():
    # Remove tasks.json before each test to ensure isolation
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
    yield
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)

def _get_task_dict(task):
    # Helper to convert Task object to dict for assertion
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "category": task.category,
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "completed": task.completed,
        "user_name": getattr(task, "user_name", None)
    }

# Test Case 1: test_add_task_with_all_required_fields
def test_add_task_with_all_required_fields():
    task_data = {
        "title": "Complete project report",
        "description": "Finish the final project report for submission",
        "priority": Priority.high,
        "due_date": date.fromisoformat("2024-07-01"),
        "user_name": "alice"
    }
    task_create = TaskCreate(**task_data)
    task = add_task(task_create)
    assert task.title == task_data["title"]
    assert task.description == task_data["description"]
    assert task.priority == task_data["priority"]
    assert task.due_date == task_data["due_date"]
    assert task.user_name == task_data["user_name"]
    assert isinstance(uuid.UUID(task.id), uuid.UUID)

# Test Case 2: test_add_task_missing_title
def test_add_task_missing_title():
    task_data = {
        "description": "Description present",
        "priority": Priority.low,
        "due_date": date.fromisoformat("2024-08-15"),
        "user_name": "bob"
    }
    with pytest.raises(TypeError):
        TaskCreate(**task_data)

# Test Case 3: test_add_task_missing_description
def test_add_task_missing_description():
    task_data = {
        "title": "New Task",
        "priority": Priority.medium,
        "due_date": date.fromisoformat("2024-08-10"),
        "user_name": "carol"
    }
    task_create = TaskCreate(**task_data)
    task = add_task(task_create)
    assert task.description is None

# Test Case 4: test_add_task_missing_priority
def test_add_task_missing_priority():
    task_data = {
        "title": "Another Task",
        "description": "Testing priority missing",
        "due_date": date.fromisoformat("2024-06-30"),
        "user_name": "dave"
    }
    task_create = TaskCreate(**task_data)
    task = add_task(task_create)
    assert task.priority == Priority.medium

# Test Case 5: test_add_task_missing_due_date
def test_add_task_missing_due_date():
    task_data = {
        "title": "Due Date Test",
        "description": "Due date is missing",
        "priority": Priority.high,
        "user_name": "eve"
    }
    task_create = TaskCreate(**task_data)
    task = add_task(task_create)
    assert task.due_date is None

# Test Case 6: test_add_task_missing_user_name
def test_add_task_missing_user_name():
    task_data = {
        "title": "User Name Test",
        "description": "User name is missing",
        "priority": Priority.low,
        "due_date": date.fromisoformat("2024-09-01")
    }
    task_create = TaskCreate(**task_data)
    task = add_task(task_create)
    assert not hasattr(task, "user_name") or task.user_name is None

# Test Case 7: test_add_task_with_empty_string_fields
def test_add_task_with_empty_string_fields():
    task_data = {
        "title": "",
        "description": "Valid description",
        "priority": Priority.medium,
        "due_date": date.fromisoformat("2024-10-10"),
        "user_name": "frank"
    }
    with pytest.raises(ValueError):
        TaskCreate(**task_data)

# Test Case 8: test_add_task_with_duplicate_titles
def test_add_task_with_duplicate_titles():
    task1_data = {
        "title": "Same Title",
        "description": "First task",
        "priority": Priority.low,
        "due_date": date.fromisoformat("2024-07-15"),
        "user_name": "george"
    }
    task2_data = {
        "title": "Same Title",
        "description": "Second task with same title",
        "priority": Priority.high,
        "due_date": date.fromisoformat("2024-07-16"),
        "user_name": "hannah"
    }
    task1 = add_task(TaskCreate(**task1_data))
    task2 = add_task(TaskCreate(**task2_data))
    assert task1.title == task2.title
    assert task1.id != task2.id

# Test Case 9: test_add_task_with_priority_boundary_values
def test_add_task_with_priority_boundary_values():
    low_data = {
        "title": "Low Priority Task",
        "description": "Testing lowest allowed priority",
        "priority": Priority.low,
        "due_date": date.fromisoformat("2024-10-01"),
        "user_name": "ian"
    }
    high_data = {
        "title": "High Priority Task",
        "description": "Testing highest allowed priority",
        "priority": Priority.high,
        "due_date": date.fromisoformat("2024-10-01"),
        "user_name": "jane"
    }
    low_task = add_task(TaskCreate(**low_data))
    high_task = add_task(TaskCreate(**high_data))
    assert low_task.priority == Priority.low
    assert high_task.priority == Priority.high

# Test Case 10: test_add_task_invalid_due_date_format
def test_add_task_invalid_due_date_format():
    task_data = {
        "title": "Bad Due Date",
        "description": "Invalid due date format",
        "priority": Priority.medium,
        "due_date": "31-12-2024",
        "user_name": "kate"
    }
    with pytest.raises(ValueError):
        TaskCreate(**task_data)

# Test Case 11: test_add_task_with_max_length_title_and_description
def test_add_task_with_max_length_title_and_description():
    long_title = "T" * 255
    long_description = "D" * 1000
    task_data = {
        "title": long_title,
        "description": long_description,
        "priority": Priority.medium,
        "due_date": date.fromisoformat("2024-12-31"),
        "user_name": "louis"
    }
    task = add_task(TaskCreate(**task_data))
    assert task.title == long_title
    assert task.description == long_description

# Test Case 12: test_add_task_with_non_string_fields
def test_add_task_with_non_string_fields():
    task_data = {
        "title": 12345,
        "description": ["Not", "a", "string"],
        "priority": Priority.high,
        "due_date": date.fromisoformat("2024-11-20"),
        "user_name": True
    }
    with pytest.raises(TypeError):
        TaskCreate(**task_data)

# Test Case 13: test_add_task_persistence
def test_add_task_persistence():
    task_data = {
        "title": "Persistence Test",
        "description": "Test that the task is persisted",
        "priority": Priority.medium,
        "due_date": date.fromisoformat("2024-07-20"),
        "user_name": "maria"
    }
    task = add_task(TaskCreate(**task_data))
    # Reload tasks from DB
    tasks = get_tasks()
    found = False
    for t in tasks:
        if t.id == task.id:
            found = True
            assert t.title == task_data["title"]
            assert t.description == task_data["description"]
            assert t.priority == task_data["priority"]
            assert t.due_date == task_data["due_date"]
            assert t.user_name == task_data["user_name"]
    assert found