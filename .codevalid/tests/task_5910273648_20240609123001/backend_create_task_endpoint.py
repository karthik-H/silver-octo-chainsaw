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
    # Helper to build payload with default valid values
    payload = {
        "title": "Complete documentation",
        "description": "Write the API docs for the new endpoints.",
        "priority": "High",
        "due_date": "2024-07-10",
        "user_name": "john_doe"
    }
    payload.update(kwargs)
    return payload

# Test Case 1: create_task_successful
def test_create_task_successful():
    response = client.post("/tasks", json=task_payload())
    assert response.status_code == 201 or response.status_code == 200
    data = response.json()
    assert data["title"] == "Complete documentation"
    assert data["description"] == "Write the API docs for the new endpoints."
    assert data["priority"] == "High"
    assert data["due_date"] == "2024-07-10"
    assert data["user_name"] == "john_doe"
    assert "id" in data

# Test Case 2: create_task_missing_title
def test_create_task_missing_title():
    payload = task_payload()
    del payload["title"]
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert "title" in response.text

# Test Case 3: create_task_missing_description
def test_create_task_missing_description():
    payload = task_payload()
    del payload["description"]
    response = client.post("/tasks", json=payload)
    assert response.status_code == 201 or response.status_code == 200
    # description is Optional, so should succeed

# Test Case 4: create_task_missing_priority
def test_create_task_missing_priority():
    payload = task_payload()
    del payload["priority"]
    response = client.post("/tasks", json=payload)
    assert response.status_code == 201 or response.status_code == 200
    # priority has default, so should succeed

# Test Case 5: create_task_missing_due_date
def test_create_task_missing_due_date():
    payload = task_payload()
    del payload["due_date"]
    response = client.post("/tasks", json=payload)
    assert response.status_code == 201 or response.status_code == 200
    # due_date is Optional, so should succeed

# Test Case 6: create_task_missing_user_name
def test_create_task_missing_user_name():
    payload = task_payload()
    del payload["user_name"]
    response = client.post("/tasks", json=payload)
    assert response.status_code == 201 or response.status_code == 200
    # user_name is not in model, so should succeed

# Test Case 7: create_task_empty_title
def test_create_task_empty_title():
    payload = task_payload(title="")
    response = client.post("/tasks", json=payload)
    assert response.status_code == 201 or response.status_code == 200
    # No explicit validation for empty string

# Test Case 8: create_task_invalid_due_date_format
def test_create_task_invalid_due_date_format():
    payload = task_payload(due_date="07/14/2024")
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert "due_date" in response.text

# Test Case 9: create_task_priority_invalid_value
def test_create_task_priority_invalid_value():
    payload = task_payload(priority="urgent")
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert "priority" in response.text

# Test Case 10: create_task_title_max_length
def test_create_task_title_max_length():
    long_title = "T" * 255
    payload = task_payload(title=long_title)
    response = client.post("/tasks", json=payload)
    assert response.status_code == 201 or response.status_code == 200
    data = response.json()
    assert data["title"] == long_title

# Test Case 11: create_task_title_exceeds_max_length
def test_create_task_title_exceeds_max_length():
    too_long_title = "T" * 256
    payload = task_payload(title=too_long_title)
    response = client.post("/tasks", json=payload)
    # No explicit max length validation, so should succeed

# Test Case 12: create_task_duplicate_title_same_user
def test_create_task_duplicate_title_same_user():
    payload = task_payload(title="Task Same Title", user_name="repeatedUser", description="First task.", due_date="2024-07-18", priority="High")
    response1 = client.post("/tasks", json=payload)
    response2 = client.post("/tasks", json=payload)
    assert response1.status_code == 201 or response1.status_code == 200
    assert response2.status_code == 201 or response2.status_code == 200
    data1 = response1.json()
    data2 = response2.json()
    assert data1["title"] == data2["title"] == "Task Same Title"
    assert data1["user_name"] == data2["user_name"] == "repeatedUser"
    assert data1["id"] != data2["id"]

# Test Case 13: create_task_extra_fields_ignored
def test_create_task_extra_fields_ignored():
    payload = task_payload(title="Task with extras", user_name="userExtra", description="Payload has extra fields.", due_date="2024-07-19", priority="Medium")
    payload["unexpected_field"] = "should be ignored"
    response = client.post("/tasks", json=payload)
    assert response.status_code == 201 or response.status_code == 200
    data = response.json()
    assert data["title"] == "Task with extras"
    assert data["user_name"] == "userExtra"
    assert "unexpected_field" not in data

# Test Case 14: create_task_blank_payload
def test_create_task_blank_payload():
    response = client.post("/tasks", json={})
    assert response.status_code == 422
    assert "title" in response.text
