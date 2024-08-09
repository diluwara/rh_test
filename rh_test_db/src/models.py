from flask import jsonify

from src import db
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import BadRequest, NotFound
from typing import Dict, Any
import functools


class BaseModel(db.Model):
    __abstract__ = True

    def to_dict(self) -> Dict[str, Any]:
        """Convert model instance to a dictionary."""
        return {col.name: getattr(self, col.name) for col in self.__table__.columns}

    @classmethod
    def from_dict(cls, data: Dict[str, Any]):
        """Create a model instance from a dictionary."""
        return cls(**data)

    def update_from_dict(self, data: Dict[str, Any]):
        """Update the model instance from a dictionary."""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)

    @staticmethod
    def validate_data(**kwargs):
        """Validate data for required fields."""
        for key, value in kwargs.items():
            if value is None or value == '':
                raise BadRequest(f'{key} is required.')
            if key == 'email' and '@' not in value:
                raise BadRequest('Invalid email format.')
            if key == 'username' and len(value) < 3:
                raise BadRequest('Username must be at least 3 characters long.')
            if key == 'title' and len(value) < 5:
                raise BadRequest('Title must be at least 5 characters long.')


class User(BaseModel):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150))
    tasks = db.relationship('Task', backref='owner', lazy=True)

    def __repr__(self):
        return (f'<User(id={self.id}, username={self.username}, '
                f'email={self.email}, password={self.password})>')

    @staticmethod
    def validate_user_data(username: str, email: str):
        """Custom validation logic for user data."""
        BaseModel.validate_data(username=username, email=email)

    def update_from_dict(self, data: Dict[str, Any]):
        """Update the model instance from a dictionary."""
        if 'username' in data:
            User.validate_user_data(username=data.get('username'), email=self.email)
        super().update_from_dict(data)


class Task(BaseModel):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    completed = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def __repr__(self):
        return (f'<Task(id={self.id}, title={self.title}, '
                f'description={self.description}, completed={self.completed}, '
                f'user_id={self.user_id})>')

    @staticmethod
    def validate_task_data(title: str, user_id: int):
        """Custom validation logic for task data."""
        BaseModel.validate_data(title=title)
        user = User.query.get(user_id)
        if user is None:
            raise NotFound('User ID does not exist.')


# Error handling during database operations
def handle_database_errors(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except IntegrityError as e:
            db.session.rollback()
            return jsonify({'error': 'Database integrity error'}), 400
        except BadRequest as e:
            return jsonify({'error': 'Malformed JSON'}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'An error occurred: {str(e)}'}), 400

    return wrapper
