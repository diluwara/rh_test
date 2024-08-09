import pytest
from src import db , create_app
from src.models import User, Task


@pytest.fixture
def client():
    app = create_app(testing=True)
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client

        # Clean up / reset resources after each test
        with app.app_context():
            db.drop_all()


@pytest.fixture
def sample_user():
    return User(username='testuser', email='testuser@example.com', password='password')


@pytest.fixture
def sample_task(sample_user):
    return Task(title='Sample Task', user_id=sample_user.id)

