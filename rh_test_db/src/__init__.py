from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import load_config
from flask_cors import CORS

# Create the Flask application
app = Flask(__name__)
CORS(app)

# Load configuration
app.config.from_object(load_config())

# Initialize the extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)

def create_app(testing=False):
    # Create the Flask application
    app = Flask(__name__)
    CORS(app)

    # Load configuration
    if testing:
        app.config.from_object('config.TestConfig')  # Assuming TestConfig is defined in your config module
    else:
        app.config.from_object(load_config())
        

# Import routes after app and db are defined to avoid circular imports
from src.routes import user_routes, task_routes

app.register_blueprint(user_routes)
app.register_blueprint(task_routes)
