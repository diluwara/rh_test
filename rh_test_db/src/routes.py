from flask import request, jsonify, Blueprint
from werkzeug.exceptions import BadRequest, NotFound
from src import db, app
from src.models import User, Task, handle_database_errors

user_routes = Blueprint('users', __name__, url_prefix='/users')
task_routes = Blueprint('tasks', __name__, url_prefix='/tasks')


@app.route('/users', methods=['GET'])
@handle_database_errors
def get_users():
    """Retrieve users with optional pagination."""
    limit = request.args.get('limit', type=int, default=10)
    offset = request.args.get('offset', type=int, default=0)

    users = User.query.limit(limit).offset(offset).all()
    return jsonify([user.to_dict() for user in users]), 200


@app.route('/users', methods=['POST'])
@handle_database_errors
@handle_database_errors
def create_user():
    """Add a new user."""
    data = request.get_json()
    try:
        User.validate_user_data(data.get('username'), data.get('email'))
        new_user = User.from_dict(data)
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.to_dict()), 201
    except BadRequest as e:
        return jsonify({'error': str(e)}), 400


@app.route('/users/<int:id>', methods=['GET'])
@handle_database_errors
def get_user(id):
    """Retrieve a user by id."""
    user = User.query.get_or_404(id)
    return jsonify(user.to_dict()), 200


@app.route('/users/<int:id>', methods=['PUT'])
@handle_database_errors
def update_user(id):
    """Update a user's information."""
    data = request.get_json()
    user = User.query.get(id)

    if not user:
        # If not found, return a 404 response with a JSON body
        return jsonify({'error': 'User not found'}), 404

    try:
        user.update_from_dict(data)
        db.session.commit()
        return jsonify(user.to_dict()), 200
    except BadRequest as e:
        return jsonify({'error': str(e)}), 400


@app.route('/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    """Delete a user by id."""
    # Query the user by ID
    user = User.query.get(id)

    # Check if the user exists
    if not user:
        # If not found, return a 404 response with a JSON body
        return jsonify({'error': 'User not found'}), 404

    # If user exists, delete the user
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully.'}), 200


@app.route('/tasks', methods=['GET'])
@handle_database_errors
def get_tasks():
    """Retrieve tasks with pagination."""
    limit = request.args.get('limit', type=int, default=10)  # Default limit
    offset = request.args.get('offset', type=int, default=0)  # Default offset

    tasks = Task.query.limit(limit).offset(offset).all()
    return jsonify([task.to_dict() for task in tasks]), 200


@app.route('/tasks', methods=['POST'])
@handle_database_errors
def create_task():
    """Add a new task."""
    data = request.get_json()
    try:
        Task.validate_task_data(data.get('title'), data.get('user_id'))
        new_task = Task.from_dict(data)
        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.to_dict()), 201
    except BadRequest as e:
        return jsonify({'error': str(e)}), 400


@app.route('/tasks/<int:id>', methods=['GET'])
@handle_database_errors
def get_task(id):
    """Retrieve a task by id."""
    task = Task.query.get_or_404(id)
    return jsonify(task.to_dict()), 200


@app.route('/tasks/<int:id>', methods=['PUT'])
@handle_database_errors
def update_task(id):
    """Update a task's information."""
    data = request.get_json()
    task = Task.query.get(id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    try:
        task.update_from_dict(data)
        db.session.commit()
        return jsonify(task.to_dict()), 200
    except BadRequest as e:
        return jsonify({'error': str(e)}), 400


@app.route('/tasks/<int:id>', methods=['DELETE'])
@handle_database_errors
def delete_task(id):
    """Delete a task by id."""
    task = Task.query.get(id)
    if not task:
        # If not found, return a 404 response with a JSON body
        return jsonify({'error': 'Task not found'}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted successfully.'}), 200
