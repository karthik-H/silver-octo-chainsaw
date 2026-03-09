import pytest
import os
import uuid
from datetime import date, datetime
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from backend.database import add_task, get_tasks
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
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "user_name": getattr(task, "user_name", None)
    }

# Test Case 1: test_create_task_with_all_valid_fields
def test_create_task_with_all_valid_fields():
    task_data = {
        "description": "Buy milk, eggs, and bread",
        "due_date": "2024-07-01",
        "priority": "high",
        "title": "Buy groceries",
        "user_name": "alice"
    }
    task_create = TaskCreate(**task_data)
    task = add_task(task_create)
    assert task.description == task_data["description"]
    assert task.due_date == date.fromisoformat(task_data["due_date"])
    assert task.priority == task_data["priority"]
    assert task.title == task_data["title"]
    assert task.user_name == task_data["user_name"]
    assert isinstance(uuid.UUID(task.id), uuid.UUID)

# Test Case 2: test_create_task_missing_title
def test_create_task_missing_title():
    task_data = {
        "description": "Finish report",
        "due_date": "2024-07-10",
        "priority": "medium",
        "user_name": "bob"
    }
    with pytest.raises(TypeError) as excinfo:
        TaskCreate(**task_data)
    assert "title" in str(excinfo.value)

# Test Case 3: test_create_task_missing_description
def test_create_task_missing_description():
    task_data = {
        "due_date": "2024-07-05",
        "priority": "low",
        "title": "Clean house",
        "user_name": "carol"
    }
    with pytest.raises(TypeError) as excinfo:
        TaskCreate(**task_data)
    assert "description" in str(excinfo.value)

# Test Case 4: test_create_task_missing_priority
def test_create_task_missing_priority():
    task_data = {
        "description": "Fix the leaking sink",
        "due_date": "2024-07-03",
        "title": "Call plumber",
        "user_name": "dave"
    }
    with pytest.raises(TypeError) as excinfo:
        TaskCreate(**task_data)
    assert "priority" in str(excinfo.value)

# Test Case 5: test_create_task_missing_due_date
def test_create_task_missing_due_date():
    task_data = {
        "description": "Finish reading '1984'",
        "priority": "medium",
        "title": "Read book",
        "user_name": "eve"
    }
    with pytest.raises(TypeError) as excinfo:
        TaskCreate(**task_data)
    assert "due_date" in str(excinfo.value)

# Test Case 6: test_create_task_missing_user_name
def test_create_task_missing_user_name():
    task_data = {
        "description": "Plan summer trip itinerary",
        "due_date": "2024-08-01",
        "priority": "high",
        "title": "Plan trip"
    }
    with pytest.raises(TypeError) as excinfo:
        TaskCreate(**task_data)
    assert "user_name" in str(excinfo.value)

# Test Case 7: test_create_task_with_empty_title
def test_create_task_with_empty_title():
    task_data = {
        "description": "Prepare slides for meeting",
        "due_date": "2024-07-12",
        "priority": "high",
        "title": "",
        "user_name": "frank"
    }
    with pytest.raises(ValueError) as excinfo:
        TaskCreate(**task_data)
    assert "title" in str(excinfo.value) or "cannot be empty" in str(excinfo.value)

# Test Case 8: test_create_task_with_empty_description
def test_create_task_with_empty_description():
    task_data = {
        "description": "",
        "due_date": "2024-07-15",
        "priority": "low",
        "title": "Attend seminar",
        "user_name": "gina"
    }
    with pytest.raises(ValueError) as excinfo:
        TaskCreate(**task_data)
    assert "description" in str(excinfo.value) or "cannot be empty" in str(excinfo.value)

# Test Case 9: test_create_task_with_invalid_priority
def test_create_task_with_invalid_priority():
    task_data = {
        "description": "Go to the gym",
        "due_date": "2024-07-20",
        "priority": "urgent",
        "title": "Workout",
        "user_name": "harry"
    }
    with pytest.raises(ValueError) as excinfo:
        TaskCreate(**task_data)
    assert "priority" in str(excinfo.value) or "invalid" in str(excinfo.value)

# Test Case 10: test_create_task_with_invalid_due_date_format
def test_create_task_with_invalid_due_date_format():
    task_data = {
        "description": "Annual checkup",
        "due_date": "15/07/2024",
        "priority": "medium",
        "title": "Dentist appointment",
        "user_name": "ian"
    }
    with pytest.raises(ValueError) as excinfo:
        TaskCreate(**task_data)
    assert "due_date" in str(excinfo.value) or "invalid" in str(excinfo.value)

# Test Case 11: test_create_task_with_past_due_date
def test_create_task_with_past_due_date():
    task_data = {
        "description": "Pay electricity and water bills",
        "due_date": "2023-06-01",
        "priority": "high",
        "title": "Pay bills",
        "user_name": "jane"
    }
    task_create = TaskCreate(**task_data)
    with pytest.raises(ValueError) as excinfo:
        add_task(task_create)
    assert "past due date" in str(excinfo.value) or "due date" in str(excinfo.value) or "invalid" in str(excinfo.value)

# Test Case 12: test_create_task_with_very_long_title
def test_create_task_with_very_long_title():
    long_title = "T" * 255
    task_data = {
        "description": "Test task with maximum title length",
        "due_date": "2024-07-30",
        "priority": "medium",
        "title": long_title,
        "user_name": "kate"
    }
    try:
        task_create = TaskCreate(**task_data)
        task = add_task(task_create)
        assert task.title == long_title
    except ValueError as exc:
        assert "title" in str(exc) or "length" in str(exc)

# Test Case 13: test_create_task_with_very_long_description
def test_create_task_with_very_long_description():
    long_description = "D" * 1024
    task_data = {
        "description": long_description,
        "due_date": "2024-07-31",
        "priority": "low",
        "title": "Generate report",
        "user_name": "lucas"
    }
    try:
        task_create = TaskCreate(**task_data)
        task = add_task(task_create)
        assert task.description == long_description
    except ValueError as exc:
        assert "description" in str(exc) or "length" in str(exc)

# Test Case 14: test_create_duplicate_task
def test_create_duplicate_task():
    task_data = {
        "description": "Upload to portal",
        "due_date": "2024-07-22",
        "priority": "high",
        "title": "Submit assignment",
        "user_name": "mike"
    }
    task_create1 = TaskCreate(**task_data)
    task1 = add_task(task_create1)
    task_create2 = TaskCreate(**task_data)
    task2 = add_task(task_create2)
    assert task1.id != task2.id
    assert task1.title == task2.title
    assert task1.description == task2.description
    assert task1.priority == task2.priority
    assert task1.due_date == task2.due_date
    assert task1.user_name == task2.user_name

# Test Case 15: test_create_task_with_special_characters
def test_create_task_with_special_characters():
    task_data = {
        "description": "Check for bugs & merge if OK.",
        "due_date": "2024-07-25",
        "priority": "medium",
        "title": "Review PR #42!",
        "user_name": "nancy"
    }
    task_create = TaskCreate(**task_data)
    task = add_task(task_create)
    assert task.description == task_data["description"]
    assert task.due_date == date.fromisoformat(task_data["due_date"])
    assert task.priority == task_data["priority"]
    assert task.title == task_data["title"]
    assert task.user_name == task_data["user_name"]
    assert isinstance(uuid.UUID(task.id), uuid.UUID)

# Test Case 16: test_create_task_with_whitespace_in_fields
def test_create_task_with_whitespace_in_fields():
    task_data = {
        "description": "  Investigate crash   ",
        "due_date": "2024-07-28",
        "priority": "low",
        "title": "  Fix bug  ",
        "user_name": " oscar "
    }
    task_create = TaskCreate(**task_data)
    task = add_task(task_create)
    # Check if whitespace is preserved or trimmed as per requirements
    # Here, we check for preservation (update if implementation trims)
    assert task.description == task_data["description"]
    assert task.title == task_data["title"]
    assert task.user_name == task_data["user_name"]
    assert task.due_date == date.fromisoformat(task_data["due_date"])
    assert task.priority == task_data["priority"]
    assert isinstance(uuid.UUID(task.id), uuid.UUID)