import pytest
import os
import sys
import uuid
from datetime import date
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from backend.database import add_task, get_tasks
from backend.models import Task

DB_FILE = "tasks.json"

@pytest.fixture(autouse=True)
def clean_db():
    # Remove tasks.json before each test to ensure isolation
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
    yield
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)

def _task_dict(task):
    return {
        "id": task["id"],
        "title": task["title"],
        "description": task["description"],
        "priority": task["priority"],
        "due_date": task["due_date"],
        "user_name": task["user_name"]
    }

# Test Case 1: Create Task with All Valid Fields
def test_create_task_with_all_valid_fields():
    task_data = {
        "description": "Complete the API docs for frontend team.",
        "due_date": "2024-07-10",
        "priority": "High",
        "title": "Finish documentation",
        "user_name": "alice"
    }
    result = add_task(task_data)
    assert "task" in result
    task = result["task"]
    assert task["description"] == task_data["description"]
    assert task["due_date"] == task_data["due_date"]
    assert task["priority"] == task_data["priority"]
    assert task["title"] == task_data["title"]
    assert task["user_name"] == task_data["user_name"]
    assert isinstance(uuid.UUID(task["id"]), uuid.UUID)

# Test Case 2: Create Task Missing Title
def test_create_task_missing_title():
    task_data = {
        "description": "Test without title",
        "due_date": "2024-07-15",
        "priority": "Low",
        "user_name": "bob"
    }
    result = add_task(task_data)
    assert result == {"error": "Missing required field: title"}

# Test Case 3: Create Task Missing Description
def test_create_task_missing_description():
    task_data = {
        "due_date": "2024-07-15",
        "priority": "Medium",
        "title": "Test task",
        "user_name": "eve"
    }
    result = add_task(task_data)
    assert result == {"error": "Missing required field: description"}

# Test Case 4: Create Task Missing Priority
def test_create_task_missing_priority():
    task_data = {
        "description": "No priority set",
        "due_date": "2024-07-20",
        "title": "Task with no priority",
        "user_name": "charlie"
    }
    result = add_task(task_data)
    assert result == {"error": "Missing required field: priority"}

# Test Case 5: Create Task Missing Due Date
def test_create_task_missing_due_date():
    task_data = {
        "description": "Description present",
        "priority": "High",
        "title": "Task without due date",
        "user_name": "dave"
    }
    result = add_task(task_data)
    assert result == {"error": "Missing required field: due_date"}

# Test Case 6: Create Task Missing User Name
def test_create_task_missing_user_name():
    task_data = {
        "description": "Task assigned to no one",
        "due_date": "2024-07-30",
        "priority": "Low",
        "title": "Task without user"
    }
    result = add_task(task_data)
    assert result == {"error": "Missing required field: user_name"}

# Test Case 7: Create Task with Empty Title
def test_create_task_with_empty_title():
    task_data = {
        "description": "Empty title",
        "due_date": "2024-08-01",
        "priority": "Medium",
        "title": "",
        "user_name": "frank"
    }
    result = add_task(task_data)
    assert result == {"error": "Missing required field: title"}

# Test Case 8: Create Task with Empty Description
def test_create_task_with_empty_description():
    task_data = {
        "description": "",
        "due_date": "2024-08-05",
        "priority": "Medium",
        "title": "Task with empty description",
        "user_name": "george"
    }
    result = add_task(task_data)
    assert result == {"error": "Missing required field: description"}

# Test Case 9: Create Task with Empty Priority
def test_create_task_with_empty_priority():
    task_data = {
        "description": "Priority not specified",
        "due_date": "2024-08-10",
        "priority": "",
        "title": "Task with empty priority",
        "user_name": "hannah"
    }
    result = add_task(task_data)
    assert result == {"error": "Missing required field: priority"}

# Test Case 10: Create Task with Empty Due Date
def test_create_task_with_empty_due_date():
    task_data = {
        "description": "Due date not given",
        "due_date": "",
        "priority": "Low",
        "title": "Task with empty due date",
        "user_name": "ian"
    }
    result = add_task(task_data)
    assert result == {"error": "Missing required field: due_date"}

# Test Case 11: Create Task with Empty User Name
def test_create_task_with_empty_user_name():
    task_data = {
        "description": "No user specified",
        "due_date": "2024-08-15",
        "priority": "High",
        "title": "Task with empty user",
        "user_name": ""
    }
    result = add_task(task_data)
    assert result == {"error": "Missing required field: user_name"}

# Test Case 12: Create Task with Minimum Length Field Values
def test_create_task_with_minimum_length_field_values():
    task_data = {
        "description": "B",
        "due_date": "2024-08-20",
        "priority": "L",
        "title": "A",
        "user_name": "c"
    }
    result = add_task(task_data)
    assert "task" in result
    task = result["task"]
    assert task["description"] == "B"
    assert task["due_date"] == "2024-08-20"
    assert task["priority"] == "L"
    assert task["title"] == "A"
    assert task["user_name"] == "c"
    assert isinstance(uuid.UUID(task["id"]), uuid.UUID)

# Test Case 13: Create Task with Maximum Length Field Values
def test_create_task_with_maximum_length_field_values():
    task_data = {
        "description": "D" * 255,
        "due_date": "2024-08-25",
        "priority": "High",
        "title": "T" * 255,
        "user_name": "U" * 255
    }
    result = add_task(task_data)
    assert "task" in result
    task = result["task"]
    assert task["description"] == "D" * 255
    assert task["due_date"] == "2024-08-25"
    assert task["priority"] == "High"
    assert task["title"] == "T" * 255
    assert task["user_name"] == "U" * 255
    assert isinstance(uuid.UUID(task["id"]), uuid.UUID)

# Test Case 14: Create Task with Duplicate Title
def test_create_task_with_duplicate_title():
    task_data1 = {
        "description": "First instance",
        "due_date": "2024-09-01",
        "priority": "High",
        "title": "Duplicate Task",
        "user_name": "alice"
    }
    task_data2 = {
        "description": "Second instance",
        "due_date": "2024-09-02",
        "priority": "Low",
        "title": "Duplicate Task",
        "user_name": "bob"
    }
    result1 = add_task(task_data1)
    result2 = add_task(task_data2)
    assert "task" in result1 and "task" in result2
    assert result1["task"]["title"] == result2["task"]["title"]
    assert result1["task"]["id"] != result2["task"]["id"]

# Test Case 15: Create Task with Duplicate Title (Second Instance)
def test_create_task_with_duplicate_title_second_instance():
    task_data1 = {
        "description": "First instance",
        "due_date": "2024-09-01",
        "priority": "High",
        "title": "Duplicate Task",
        "user_name": "alice"
    }
    task_data2 = {
        "description": "Second instance",
        "due_date": "2024-09-02",
        "priority": "Low",
        "title": "Duplicate Task",
        "user_name": "bob"
    }
    result1 = add_task(task_data1)
    result2 = add_task(task_data2)
    assert "task" in result1 and "task" in result2
    assert result1["task"]["title"] == result2["task"]["title"]
    assert result1["task"]["id"] != result2["task"]["id"]
    assert result2["task"]["description"] == "Second instance"
    assert result2["task"]["due_date"] == "2024-09-02"
    assert result2["task"]["priority"] == "Low"
    assert result2["task"]["user_name"] == "bob"

# Test Case 16: Create Task with Invalid Due Date Format
def test_create_task_with_invalid_due_date_format():
    task_data = {
        "description": "Due date has invalid format",
        "due_date": "08/10/2024",
        "priority": "Medium",
        "title": "Task with bad date",
        "user_name": "linda"
    }
    result = add_task(task_data)
    assert result == {"error": "Invalid due_date format"}

# Test Case 17: Create Task with Future Due Date
def test_create_task_with_future_due_date():
    task_data = {
        "description": "This task is for the distant future.",
        "due_date": "2099-12-31",
        "priority": "Low",
        "title": "Task in 2099",
        "user_name": "futureuser"
    }
    result = add_task(task_data)
    assert "task" in result
    task = result["task"]
    assert task["due_date"] == "2099-12-31"
    assert task["title"] == "Task in 2099"
    assert task["user_name"] == "futureuser"

# Test Case 18: Create Task with Past Due Date
def test_create_task_with_past_due_date():
    task_data = {
        "description": "Was due last year",
        "due_date": "2023-06-01",
        "priority": "Medium",
        "title": "Past due task",
        "user_name": "archivist"
    }
    result = add_task(task_data)
    assert "task" in result
    task = result["task"]
    assert task["due_date"] == "2023-06-01"
    assert task["title"] == "Past due task"
    assert task["user_name"] == "archivist"

# Test Case 19: ID Uniqueness When Adding Multiple Tasks
def test_id_uniqueness_when_adding_multiple_tasks():
    task_data1 = {
        "description": "First task",
        "due_date": "2024-09-10",
        "priority": "High",
        "title": "Task 1",
        "user_name": "alice"
    }
    task_data2 = {
        "description": "Second task",
        "due_date": "2024-09-11",
        "priority": "Low",
        "title": "Task 2",
        "user_name": "bob"
    }
    result1 = add_task(task_data1)
    result2 = add_task(task_data2)
    assert "task" in result1 and "task" in result2
    assert result1["task"]["id"] != result2["task"]["id"]

# Test Case 20: Create Task with Non-String Field Values
def test_create_task_with_non_string_field_values():
    task_data = {
        "description": ["This should be a string"],
        "due_date": "2024-10-01",
        "priority": None,
        "title": 12345,
        "user_name": True
    }
    result = add_task(task_data)
    assert result == {"error": "Invalid type for one or more fields"}