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

def repeat_char(char, count):
    return char * count

# Test Case 1: Create Task with All Valid Fields
def test_create_task_with_all_valid_fields():
    payload = {
        'description': 'Need to buy milk, eggs, and bread',
        'due_date': '2024-07-01',
        'priority': 2,
        'title': 'Buy groceries',
        'user_name': 'alice'
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data['description'] == payload['description']
    assert data['due_date'] == payload['due_date']
    assert data['priority'] == payload['priority']
    assert data['title'] == payload['title']
    assert data['user_name'] == payload['user_name']
    assert 'id' in data

# Test Case 2: Create Task Missing Title
def test_create_task_missing_title():
    payload = {
        'description': 'Prepare meeting agenda',
        'due_date': '2024-07-10',
        'priority': 1,
        'user_name': 'bob'
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        'detail': [
            {'loc': ['body', 'title'], 'msg': 'field required', 'type': 'value_error.missing'}
        ]
    }

# Test Case 3: Create Task Missing Description
def test_create_task_missing_description():
    payload = {
        'due_date': '2024-07-10',
        'priority': 1,
        'title': 'Schedule call',
        'user_name': 'carol'
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        'detail': [
            {'loc': ['body', 'description'], 'msg': 'field required', 'type': 'value_error.missing'}
        ]
    }

# Test Case 4: Create Task Missing Priority
def test_create_task_missing_priority():
    payload = {
        'description': 'Take the dog to the park.',
        'due_date': '2024-07-11',
        'title': 'Walk dog',
        'user_name': 'david'
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        'detail': [
            {'loc': ['body', 'priority'], 'msg': 'field required', 'type': 'value_error.missing'}
        ]
    }

# Test Case 5: Create Task Missing Due Date
def test_create_task_missing_due_date():
    payload = {
        'description': 'Finish reading the assigned book.',
        'priority': 3,
        'title': 'Read book',
        'user_name': 'emma'
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        'detail': [
            {'loc': ['body', 'due_date'], 'msg': 'field required', 'type': 'value_error.missing'}
        ]
    }

# Test Case 6: Create Task Missing User Name
def test_create_task_missing_user_name():
    payload = {
        'description': 'Submit the quarterly report.',
        'due_date': '2024-07-15',
        'priority': 4,
        'title': 'Submit report'
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        'detail': [
            {'loc': ['body', 'user_name'], 'msg': 'field required', 'type': 'value_error.missing'}
        ]
    }

# Test Case 7: Create Task with All Fields as Empty Strings
def test_create_task_with_all_fields_as_empty_strings():
    payload = {
        'description': '',
        'due_date': '',
        'priority': 1,
        'title': '',
        'user_name': ''
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        'detail': [
            {'loc': ['body', 'title'], 'msg': 'ensure this value has at least 1 characters', 'type': 'value_error.any_str.min_length'},
            {'loc': ['body', 'description'], 'msg': 'ensure this value has at least 1 characters', 'type': 'value_error.any_str.min_length'},
            {'loc': ['body', 'due_date'], 'msg': 'invalid date format', 'type': 'type_error.date'},
            {'loc': ['body', 'user_name'], 'msg': 'ensure this value has at least 1 characters', 'type': 'value_error.any_str.min_length'}
        ]
    }

# Test Case 8: Create Task with Priority as String
def test_create_task_with_priority_as_string():
    payload = {
        'description': 'Testing priority type',
        'due_date': '2024-07-12',
        'priority': 'high',
        'title': 'Test task',
        'user_name': 'frank'
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        'detail': [
            {'loc': ['body', 'priority'], 'msg': 'value is not a valid integer', 'type': 'type_error.integer'}
        ]
    }

# Test Case 9: Create Task with Invalid Due Date Format
def test_create_task_with_invalid_due_date_format():
    payload = {
        'description': 'Testing date format',
        'due_date': '07-13-2024',
        'priority': 2,
        'title': 'Test task',
        'user_name': 'grace'
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        'detail': [
            {'loc': ['body', 'due_date'], 'msg': 'invalid date format', 'type': 'type_error.date'}
        ]
    }

# Test Case 10: Create Task with Title at Maximum Allowed Length
def test_create_task_with_title_at_maximum_allowed_length():
    max_title = repeat_char('T', 255)
    payload = {
        'description': 'Edge case for title length',
        'due_date': '2024-07-14',
        'priority': 1,
        'title': max_title,
        'user_name': 'helen'
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data['description'] == payload['description']
    assert data['due_date'] == payload['due_date']
    assert data['priority'] == payload['priority']
    assert data['title'] == payload['title']
    assert data['user_name'] == payload['user_name']
    assert 'id' in data

# Test Case 11: Create Task with Title Exceeding Maximum Length
def test_create_task_with_title_exceeding_maximum_length():
    too_long_title = repeat_char('T', 256)
    payload = {
        'description': 'Exceed max title length',
        'due_date': '2024-07-16',
        'priority': 2,
        'title': too_long_title,
        'user_name': 'irene'
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        'detail': [
            {'loc': ['body', 'title'], 'msg': 'ensure this value has at most 255 characters', 'type': 'value_error.any_str.max_length'}
        ]
    }

# Test Case 12: Create Task with Priority Zero
def test_create_task_with_priority_zero():
    payload = {
        'description': 'Testing priority edge case',
        'due_date': '2024-07-17',
        'priority': 0,
        'title': 'Zero priority task',
        'user_name': 'james'
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data['description'] == payload['description']
    assert data['due_date'] == payload['due_date']
    assert data['priority'] == payload['priority']
    assert data['title'] == payload['title']
    assert data['user_name'] == payload['user_name']
    assert 'id' in data

# Test Case 13: Create Task with Negative Priority
def test_create_task_with_negative_priority():
    payload = {
        'description': 'Testing negative priority',
        'due_date': '2024-07-18',
        'priority': -1,
        'title': 'Negative priority task',
        'user_name': 'karen'
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        'detail': [
            {'loc': ['body', 'priority'], 'msg': 'ensure this value is greater than or equal to 0', 'type': 'value_error.number.not_ge'}
        ]
    }

# Test Case 14: Create Task with Unexpected Field
def test_create_task_with_unexpected_field():
    payload = {
        'description': 'Testing extra field handling',
        'due_date': '2024-07-20',
        'priority': 1,
        'title': 'Unexpected field',
        'unexpected_field': 'unexpected_value',
        'user_name': 'linda'
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        'detail': [
            {'loc': ['body', 'unexpected_field'], 'msg': 'extra fields not permitted', 'type': 'value_error.extra'}
        ]
    }

# Test Case 15: Create Task with Priority as Float
def test_create_task_with_priority_as_float():
    payload = {
        'description': 'Priority as float',
        'due_date': '2024-07-21',
        'priority': 1.5,
        'title': 'Float priority',
        'user_name': 'mark'
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        'detail': [
            {'loc': ['body', 'priority'], 'msg': 'value is not a valid integer', 'type': 'type_error.integer'}
        ]
    }

# Test Case 16: Create Task with Past Due Date
def test_create_task_with_past_due_date():
    payload = {
        'description': 'Due date in the past',
        'due_date': '2020-01-01',
        'priority': 1,
        'title': 'Past due date',
        'user_name': 'nina'
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data['description'] == payload['description']
    assert data['due_date'] == payload['due_date']
    assert data['priority'] == payload['priority']
    assert data['title'] == payload['title']
    assert data['user_name'] == payload['user_name']
    assert 'id' in data
