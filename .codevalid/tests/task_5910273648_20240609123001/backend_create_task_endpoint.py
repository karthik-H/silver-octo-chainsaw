import os
import pytest
from fastapi.testclient import TestClient
from backend.main import app
import backend.database as db

# Setup: Use a temporary DB file for tests
TEST_DB_FILE = "test_tasks.json"

@pytest.fixture(autouse=True)
def setup_and_teardown_db(monkeypatch):
    # Patch DB_FILE to use test file
    monkeypatch.setattr(db, "DB_FILE", TEST_DB_FILE)
    # Ensure test DB file starts empty
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)
    yield
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)

client = TestClient(app)

def task_payload(**kwargs):
    payload = {
        "title": "Grocery Shopping",
        "description": "Buy milk, eggs, and bread.",
        "priority": 2,
        "due_date": "2024-07-10",
        "user_name": "john_doe"
    }
    payload.update(kwargs)
    return payload

# Test Case 1: Create Task - Success
def test_create_task_success():
    response = client.post("/tasks", json=task_payload())
    assert response.status_code == 200
    data = response.json()
    assert data == {
        "title": "Grocery Shopping",
        "description": "Buy milk, eggs, and bread.",
        "priority": 2,
        "due_date": "2024-07-10",
        "user_name": "john_doe",
        "id": data["id"]  # id is generated, just check it exists
    }
    assert isinstance(data["id"], str)

# Test Case 2: Create Task - Missing Title
def test_create_task_missing_title():
    payload = task_payload()
    del payload["title"]
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {"detail": "Field 'title' is required."}

# Test Case 3: Create Task - Missing Description
def test_create_task_missing_description():
    payload = task_payload()
    del payload["description"]
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {"detail": "Field 'description' is required."}

# Test Case 4: Create Task - Missing Priority
def test_create_task_missing_priority():
    payload = task_payload()
    del payload["priority"]
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {"detail": "Field 'priority' is required."}

# Test Case 5: Create Task - Missing Due Date
def test_create_task_missing_due_date():
    payload = task_payload()
    del payload["due_date"]
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {"detail": "Field 'due_date' is required."}

# Test Case 6: Create Task - Missing User Name
def test_create_task_missing_user_name():
    payload = task_payload()
    del payload["user_name"]
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {"detail": "Field 'user_name' is required."}

# Test Case 7: Create Task - All Fields Missing
def test_create_task_all_fields_missing():
    response = client.post("/tasks", json={})
    assert response.status_code == 422
    assert response.json() == {"detail": "Fields 'title', 'description', 'priority', 'due_date', and 'user_name' are required."}

# Test Case 8: Create Task - Title Max Length
def test_create_task_title_max_length():
    max_title = "T" * 255
    payload = task_payload(title=max_title, description="Edge case test for maximum title length.", priority=1)
    response = client.post("/tasks", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data == {
        "title": max_title,
        "description": "Edge case test for maximum title length.",
        "priority": 1,
        "due_date": "2024-07-10",
        "user_name": "john_doe",
        "id": data["id"]
    }
    assert isinstance(data["id"], str)

# Test Case 9: Create Task - Title Exceeds Max Length
def test_create_task_title_exceeds_max_length():
    too_long_title = "T" * 256
    payload = task_payload(title=too_long_title, description="Edge case test for exceeding maximum title length.", priority=1)
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {"detail": "Field 'title' exceeds maximum allowed length."}

# Test Case 10: Create Task - Priority Minimum Value
def test_create_task_priority_minimum_value():
    payload = task_payload(priority=1, description="Test for minimum priority value.", title="Low Priority Task")
    response = client.post("/tasks", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data == {
        "title": "Low Priority Task",
        "description": "Test for minimum priority value.",
        "priority": 1,
        "due_date": "2024-07-10",
        "user_name": "john_doe",
        "id": data["id"]
    }
    assert isinstance(data["id"], str)

# Test Case 11: Create Task - Priority Maximum Value
def test_create_task_priority_maximum_value():
    payload = task_payload(priority=5, description="Test for maximum priority value.", title="High Priority Task")
    response = client.post("/tasks", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data == {
        "title": "High Priority Task",
        "description": "Test for maximum priority value.",
        "priority": 5,
        "due_date": "2024-07-10",
        "user_name": "john_doe",
        "id": data["id"]
    }
    assert isinstance(data["id"], str)

# Test Case 12: Create Task - Priority Below Minimum
def test_create_task_priority_below_minimum():
    payload = task_payload(priority=0, description="Test for priority below minimum.", title="Invalid Priority Task")
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {"detail": "Field 'priority' is below minimum allowed value."}

# Test Case 13: Create Task - Priority Above Maximum
def test_create_task_priority_above_maximum():
    payload = task_payload(priority=6, description="Test for priority above maximum.", title="Invalid Priority Task")
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {"detail": "Field 'priority' is above maximum allowed value."}

# Test Case 14: Create Task - Due Date Invalid Format
def test_create_task_due_date_invalid_format():
    payload = task_payload(due_date="10-07-2024", description="Test for invalid due date format.", title="Invalid Due Date Task")
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {"detail": "Field 'due_date' must be in 'YYYY-MM-DD' format."}

# Test Case 15: Create Task - Due Date in the Past
def test_create_task_due_date_in_past():
    payload = task_payload(due_date="2022-01-01", description="Test for due date in the past.", title="Past Due Date Task")
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {"detail": "Field 'due_date' cannot be in the past."}

# Test Case 16: Create Task - Empty Strings for Required Fields
def test_create_task_empty_strings_for_required_fields():
    payload = {
        "title": "",
        "description": "",
        "priority": 2,
        "due_date": "2024-07-10",
        "user_name": ""
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {"detail": "Fields 'title', 'description', and 'user_name' cannot be empty."}
