import pytest
from unittest.mock import patch
from backend.database import update_task, Task
from datetime import date

@pytest.fixture
def task_factory():
    def _create_task(**kwargs):
        defaults = {
            "id": 1,
            "title": "Default Title",
            "description": "Default Description",
            "priority": "Medium",
            "due_date": "2024-07-01",
            "user_name": "default_user"
        }
        defaults.update(kwargs)
        return Task(**defaults)
    return _create_task

# Test Case 1: Update All Fields of Existing Task
def test_update_all_fields_of_existing_task(task_factory):
    tasks = [
        task_factory(
            id=1,
            description="Original Description",
            due_date="2024-07-01",
            priority="Low",
            title="Original Title",
            user_name="alice"
        )
    ]
    task_update = {
        "description": "Updated Description",
        "due_date": "2024-08-01",
        "priority": "High",
        "title": "Updated Title",
        "user_name": "bob"
    }
    with patch("backend.database.get_tasks", return_value=tasks), \
         patch("backend.database.save_tasks") as mock_save:
        updated = update_task(1, task_update)
        assert updated is not None
        assert updated.id == 1
        assert updated.description == "Updated Description"
        assert updated.due_date == "2024-08-01"
        assert updated.priority == "High"
        assert updated.title == "Updated Title"
        assert updated.user_name == "bob"
        # Other tasks unaffected
        assert len(tasks) == 1

# Test Case 2: Update Some Fields of Existing Task
def test_update_some_fields_of_existing_task(task_factory):
    tasks = [
        task_factory(
            id=2,
            description="Desc Two",
            due_date="2024-07-10",
            priority="Medium",
            title="Task Two",
            user_name="charlie"
        )
    ]
    task_update = {
        "priority": "Urgent",
        "user_name": "david"
    }
    with patch("backend.database.get_tasks", return_value=tasks), \
         patch("backend.database.save_tasks") as mock_save:
        updated = update_task(2, task_update)
        assert updated is not None
        assert updated.id == 2
        assert updated.priority == "Urgent"
        assert updated.user_name == "david"
        assert updated.title == "Task Two"
        assert updated.description == "Desc Two"
        assert updated.due_date == "2024-07-10"

# Test Case 3: Update with No Fields Provided
def test_update_with_no_fields_provided(task_factory):
    tasks = [
        task_factory(
            id=3,
            description="Desc Three",
            due_date="2024-07-20",
            priority="Low",
            title="Task Three",
            user_name="eve"
        )
    ]
    task_update = {}
    with patch("backend.database.get_tasks", return_value=tasks), \
         patch("backend.database.save_tasks") as mock_save:
        response = update_task(3, task_update)
        assert response["message"] == "No update performed. No fields provided."
        assert response["task_state"] == {
            "description": "Desc Three",
            "due_date": "2024-07-20",
            "id": 3,
            "priority": "Low",
            "title": "Task Three",
            "user_name": "eve"
        }

# Test Case 4: Update Non-Existent Task
def test_update_non_existent_task(task_factory):
    tasks = [
        task_factory(
            id=4,
            description="Desc Four",
            due_date="2024-07-25",
            priority="Medium",
            title="Task Four",
            user_name="frank"
        )
    ]
    task_update = {
        "title": "Should Not Update"
    }
    with patch("backend.database.get_tasks", return_value=tasks), \
         patch("backend.database.save_tasks") as mock_save:
        response = update_task(99, task_update)
        assert response["error"] == "Task with id 99 not found."

# Test Case 5: Update One Task Among Multiple
def test_update_one_task_among_multiple(task_factory):
    tasks = [
        task_factory(
            id=5,
            description="Desc Five",
            due_date="2024-07-30",
            priority="Low",
            title="Task Five",
            user_name="grace"
        ),
        task_factory(
            id=6,
            description="Desc Six",
            due_date="2024-08-05",
            priority="High",
            title="Task Six",
            user_name="helen"
        )
    ]
    task_update = {
        "description": "Updated Desc Six"
    }
    with patch("backend.database.get_tasks", return_value=tasks), \
         patch("backend.database.save_tasks") as mock_save:
        response = update_task(6, task_update)
        assert response["other_tasks_affected"] is False
        assert response["response"] == {
            "description": "Updated Desc Six",
            "due_date": "2024-08-05",
            "id": 6,
            "priority": "High",
            "title": "Task Six",
            "user_name": "helen"
        }
        assert response["tasks"] == [
            {
                "description": "Desc Five",
                "due_date": "2024-07-30",
                "id": 5,
                "priority": "Low",
                "title": "Task Five",
                "user_name": "grace"
            }
        ]

# Test Case 6: Update Task Title to Maximum Length
def test_update_task_title_to_maximum_length(task_factory):
    max_title = "T" * 255
    tasks = [
        task_factory(
            id=7,
            description="Desc Seven",
            due_date="2024-08-10",
            priority="Medium",
            title="Short Title",
            user_name="irene"
        )
    ]
    task_update = {
        "title": max_title
    }
    with patch("backend.database.get_tasks", return_value=tasks), \
         patch("backend.database.save_tasks") as mock_save:
        response = update_task(7, task_update)
        assert response["response"]["title"] == max_title
        assert len(response["response"]["title"]) == 255

# Test Case 7: Update Task with Invalid Field
def test_update_task_with_invalid_field(task_factory):
    tasks = [
        task_factory(
            id=8,
            description="Desc Eight",
            due_date="2024-08-15",
            priority="High",
            title="Task Eight",
            user_name="jane"
        )
    ]
    task_update = {
        "invalid_field": "should not be saved",
        "priority": "Low"
    }
    with patch("backend.database.get_tasks", return_value=tasks), \
         patch("backend.database.save_tasks") as mock_save:
        response = update_task(8, task_update)
        assert response["note"] == "invalid_field is ignored and not saved"
        assert response["response"] == {
            "description": "Desc Eight",
            "due_date": "2024-08-15",
            "id": 8,
            "priority": "Low",
            "title": "Task Eight",
            "user_name": "jane"
        }

# Test Case 8: Update Due Date to Empty String
def test_update_due_date_to_empty_string(task_factory):
    tasks = [
        task_factory(
            id=9,
            description="Desc Nine",
            due_date="2024-08-20",
            priority="Medium",
            title="Task Nine",
            user_name="karen"
        )
    ]
    task_update = {
        "due_date": ""
    }
    with patch("backend.database.get_tasks", return_value=tasks), \
         patch("backend.database.save_tasks") as mock_save:
        response = update_task(9, task_update)
        assert response["response"]["due_date"] == ""

# Test Case 9: Attempt to Update Task ID
def test_attempt_to_update_task_id(task_factory):
    tasks = [
        task_factory(
            id=10,
            description="Desc Ten",
            due_date="2024-08-25",
            priority="High",
            title="Task Ten",
            user_name="leo"
        )
    ]
    task_update = {
        "id": 99,
        "priority": "Low"
    }
    with patch("backend.database.get_tasks", return_value=tasks), \
         patch("backend.database.save_tasks") as mock_save:
        response = update_task(10, task_update)
        assert response["note"] == "ID field in update payload is ignored; task id remains unchanged"
        assert response["response"] == {
            "description": "Desc Ten",
            "due_date": "2024-08-25",
            "id": 10,
            "priority": "Low",
            "title": "Task Ten",
            "user_name": "leo"
        }