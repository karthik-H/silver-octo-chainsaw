import pytest
#from pytest.importorskip("httpx")
from fastapi.testclient import TestClient
from backend.main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def setup_tasks(monkeypatch):
    # Mock database for tasks
    tasks = {
        "12345": {
            "task_id": "12345",
            "title": "Original Task Title",
            "description": "Original Task Description",
            "due_date": "2024-06-30",
            "priority": "Medium",
            "user_name": "OriginalUser"
        },
        "54321": {
            "task_id": "54321",
            "title": "Another Task Title",
            "description": "Another Task Description",
            "due_date": "2024-06-30",
            "priority": "Low",
            "user_name": "AnotherUser"
        }
    }

    class MockDB:
        def update_task(self, task_id, task_data):
            if task_id not in tasks:
                return None
            if not task_data:
                return "no_fields"
            # Validation
            if "priority" in task_data and task_data["priority"] not in ["Low", "Medium", "High"]:
                return "invalid_priority"
            if "due_date" in task_data:
                import re
                if not re.match(r"\d{4}-\d{2}-\d{2}$", task_data["due_date"]):
                    return "invalid_due_date"
            if "title" in task_data and isinstance(task_data["title"], str) and len(task_data["title"]) > 255:
                return "title_too_long"
            # Update fields
            for k, v in task_data.items():
                tasks[task_id][k] = v
            return tasks[task_id]

        def get_task(self, task_id):
            return tasks.get(task_id)

        def get_all_tasks(self):
            return tasks.copy()

    monkeypatch.setattr("backend.main.database", MockDB())
    return tasks

def test_update_task_with_all_fields(client, setup_tasks):
    response = client.put(
        "/tasks/12345",
        json={
            "description": "Updated Task Description",
            "due_date": "2024-07-01",
            "priority": "High",
            "title": "Updated Task Title",
            "user_name": "alice"
        }
    )
    assert response.status_code == 200
    assert response.json() == {
        "description": "Updated Task Description",
        "due_date": "2024-07-01",
        "priority": "High",
        "task_id": "12345",
        "title": "Updated Task Title",
        "user_name": "alice"
    }

def test_update_task_with_partial_fields(client, setup_tasks):
    response = client.put(
        "/tasks/12345",
        json={
            "due_date": "2024-08-15",
            "priority": "Low"
        }
    )
    assert response.status_code == 200
    assert response.json() == {
        "description": "Original Task Description",
        "due_date": "2024-08-15",
        "priority": "Low",
        "task_id": "12345",
        "title": "Original Task Title",
        "user_name": "OriginalUser"
    }

def test_update_task_with_no_fields_provided(client, setup_tasks):
    response = client.put(
        "/tasks/12345",
        json={}
    )
    assert response.status_code == 400
    assert response.json() == {
        "message": "No fields provided for update. No changes performed."
    }

def test_update_non_existent_task(client, setup_tasks):
    response = client.put(
        "/tasks/99999",
        json={"title": "Some Title"}
    )
    assert response.status_code == 404
    assert response.json() == {
        "error": "Task not found"
    }

def test_update_task_with_invalid_priority_value(client, setup_tasks):
    response = client.put(
        "/tasks/12345",
        json={"priority": "Extreme"}
    )
    assert response.status_code == 400
    assert response.json() == {
        "error": "Invalid priority value"
    }

def test_update_task_with_invalid_due_date_format(client, setup_tasks):
    response = client.put(
        "/tasks/12345",
        json={"due_date": "01-July-2024"}
    )
    assert response.status_code == 400
    assert response.json() == {
        "error": "Invalid due_date format. Use YYYY-MM-DD."
    }

def test_editing_task_does_not_affect_unrelated_tasks(client, setup_tasks):
    # Update task 12345
    response = client.put(
        "/tasks/12345",
        json={"title": "Changed Title"}
    )
    assert response.status_code == 200
    assert response.json() == {
        "description": "Original Task Description",
        "due_date": "2024-06-30",
        "priority": "Medium",
        "task_id": "12345",
        "title": "Changed Title",
        "user_name": "OriginalUser"
    }
    # Check task 54321 remains unchanged
    db = getattr(client.app, "database", None)
    if db is not None:
        task_54321 = db.get_task("54321")
        assert task_54321 == {
            "task_id": "54321",
            "title": "Another Task Title",
            "description": "Another Task Description",
            "due_date": "2024-06-30",
            "priority": "Low",
            "user_name": "AnotherUser"
        }

def test_update_task_with_empty_string_fields(client, setup_tasks):
    response = client.put(
        "/tasks/12345",
        json={"description": "", "title": ""}
    )
    assert response.status_code == 200
    assert response.json() == {
        "description": "",
        "due_date": "2024-06-30",
        "priority": "Medium",
        "task_id": "12345",
        "title": "",
        "user_name": "OriginalUser"
    }

def test_update_task_with_maximum_length_title(client, setup_tasks):
    max_title = "T" * 255
    response = client.put(
        "/tasks/12345",
        json={"title": max_title}
    )
    assert response.status_code == 200
    assert response.json() == {
        "description": "Original Task Description",
        "due_date": "2024-06-30",
        "priority": "Medium",
        "task_id": "12345",
        "title": max_title,
        "user_name": "OriginalUser"
    }

def test_update_task_without_content_type_header(client, setup_tasks):
    response = client.put(
        "/tasks/12345",
        data='{"title": "New Title"}'
    )
    assert response.status_code == 415
    assert response.json() == {
        "error": "Content-Type header missing or invalid"
    }