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
db.init_app(app)
migrate = Migrate(app, db)

# Import routes after app and db are defined to avoid circular imports
from src.routes import user_routes, task_routes

app.register_blueprint(user_routes)
app.register_blueprint(task_routes)
