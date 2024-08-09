import pytest


def test_create_user(client):
    """Test creating a new user."""
    response = client.post('/users', json={
        'username': 'testuser',
        'email': 'testuser678@example.com',
        'password': 'password123'
    })
    data = response.get_json()

    assert response.status_code == 201
    assert data['username'] == 'testuser'
    assert data['email'] == 'testuser678@example.com'


def test_get_users(client):
    """Test retrieving users."""
    # First, add a user to the database
    client.post('/users', json={
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'password123'
    })

    response = client.get('/users')
    data = response.get_json()

    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]['username'] == 'testuser'


def test_update_user(client):
    """Test updating a user's information."""
    # First, add a user to the database
    client.post('/users', json={
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'password123'
    })

    response = client.put('/users/1', json={
        'username': 'updateduser'
    })
    data = response.get_json()

    assert response.status_code == 200
    assert data['username'] == 'updateduser'


def test_delete_user(client):
    """Test deleting a user."""
    # First, add a user to the database
    client.post('/users', json={
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'password123'
    })

    response = client.delete('/users/1')
    data = response.get_json()

    assert response.status_code == 200
    assert data['message'] == 'User deleted successfully.'


@pytest.mark.parametrize(
    "payload, expected_status, error_message",
    [
        # Missing username
        ({"email": "missingusername@example.com", "password": "password123"}, 400, "username is required"),
        # Invalid email format
        ({"username": "invalidemail", "email": "invalidemail", "password": "password123"}, 400, "Invalid email format"),
    ]
)
def test_create_user_invalid_input(client, payload, expected_status, error_message):
    """Test creating a user with invalid input."""
    response = client.post('/users', json=payload)
    data = response.get_json()

    assert response.status_code == expected_status
    assert error_message in data['error']


def test_create_user_duplicate(client):
    """Test creating a duplicate user."""
    client.post('/users', json={
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'password123'
    })

    response = client.post('/users', json={
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'password123'
    })

    data = response.get_json()

    assert response.status_code == 400
    assert data is not None, "Expected JSON response but got None"
    assert 'Database integrity error' in data['error']


def test_get_users_pagination(client):
    """Test retrieving users with pagination."""
    for i in range(10):
        client.post('/users', json={
            'username': f'testuser{i}',
            'email': f'testuser{i}@example.com',
            'password': 'password123'
        })

    response = client.get('/users?limit=5&offset=0')
    data = response.get_json()

    assert response.status_code == 200
    assert len(data) == 5


def test_update_non_existent_user(client):
    """Test updating a non-existent user."""
    response = client.put('/users/999', json={'username': 'nonexistent'})
    assert response.status_code == 404
    data = response.get_json()
    assert 'User not found' in data['error']


def test_delete_non_existent_user(client):
    """Test deleting a non-existent user."""
    response = client.delete('/users/999')
    assert response.status_code == 404
    assert 'User not found' in response.get_json()['error']


def test_create_task(client):
    """Test creating a new task."""
    # First, add a user to the database
    client.post('/users', json={
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'password123'
    })

    response = client.post('/tasks', json={
        'title': 'Test Task',
        'description': 'This is a test task.',
        'user_id': 1
    })
    data = response.get_json()

    assert response.status_code == 201
    assert data['title'] == 'Test Task'


def test_get_tasks(client):
    """Test retrieving tasks."""
    # First, add a user and a task to the database
    client.post('/users', json={
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'password123'
    })
    client.post('/tasks', json={
        'title': 'Test Task',
        'description': 'This is a test task.',
        'user_id': 1
    })

    response = client.get('/tasks')
    data = response.get_json()

    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]['title'] == 'Test Task'


def test_update_task(client):
    """Test updating a task."""
    # First, add a user and a task to the database
    client.post('/users', json={
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'password123'
    })
    client.post('/tasks', json={
        'title': 'Test Task',
        'description': 'This is a test task.',
        'user_id': 1
    })

    response = client.put('/tasks/1', json={
        'title': 'Updated Task'
    })
    data = response.get_json()

    assert response.status_code == 200
    assert data['title'] == 'Updated Task'


def test_delete_task(client):
    """Test deleting a task."""
    # First, add a user and a task to the database
    client.post('/users', json={
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'password123'
    })
    client.post('/tasks', json={
        'title': 'Test Task',
        'description': 'This is a test task.',
        'user_id': 1
    })

    response = client.delete('/tasks/1')
    data = response.get_json()

    assert response.status_code == 200
    assert data['message'] == 'Task deleted successfully.'


@pytest.mark.parametrize(
    "payload, expected_status, error_message",
    [
        # Missing title
        ({"description": "No title", "user_id": 1}, 400, "title is required"),
        # Non-existent user_id
        ({"title": "No user", "user_id": 999}, 404, "Resource not found"),  # Update here
    ]
)
def test_create_task_invalid_input(client, payload, expected_status, error_message):
    """Test creating a task with invalid input."""
    client.post('/users', json={
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'password123'
    })

    response = client.post('/tasks', json=payload)
    data = response.get_json()

    assert response.status_code == expected_status
    assert error_message in data['error']


def test_create_task_duplicate(client):
    """Test creating a duplicate task."""
    client.post('/users', json={
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'password123'
    })

    client.post('/tasks', json={
        'title': 'Test Task',
        'description': 'This is a test task.',
        'user_id': 1
    })

    response = client.post('/tasks', json={
        'title': 'Test Task',
        'description': 'This is a test task.',
        'user_id': 1
    })
    data = response.get_json()

    assert response.status_code == 400
    assert 'Database integrity error' in data['error']


def test_get_tasks_pagination(client):
    """Test retrieving tasks with pagination."""
    client.post('/users', json={
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'password123'
    })
    for i in range(10):
        client.post('/tasks', json={
            'title': f'Task {i}',
            'description': f'This is task {i}.',
            'user_id': 1
        })

    response = client.get('/tasks?limit=5&offset=0')
    data = response.get_json()

    assert response.status_code == 200
    assert len(data) == 5


def test_update_non_existent_task(client):
    """Test updating a non-existent task."""
    response = client.put('/tasks/999', json={'title': 'Nonexistent Task'})
    assert response.status_code == 404
    assert 'Task not found' in response.get_json()['error']


def test_delete_non_existent_task(client):
    """Test deleting a non-existent task."""
    response = client.delete('/tasks/999')
    assert response.status_code == 404
    assert 'Task not found' in response.get_json()['error']


def test_malformed_json(client):
    """Test handling of malformed JSON input."""
    response = client.post('/users', data="{'username': 'testuser'", content_type='application/json')
    assert response.status_code == 400
    assert 'Malformed JSON' in response.get_json()['error']
