import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "default-secret-key")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///:memory:")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class ProductionConfig(Config):
    '''live site accessed by final users'''
    ENV = "production"
    DEBUG = False
    DEVELOPMENT = False
    TESTING = False

class StagingConfig(Config):
    '''preproduction environment used for previews and testing'''
    DEBUG = True
    DEVELOPMENT = False
    TESTING = False

class DevelopmentConfig(Config):
    '''local environment'''
    ENV = "development"
    DEBUG = True
    DEVELOPMENT = True
    TESTING = False

class TestConfig(Config):
    '''testing environment'''
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

def load_config():
    mode = os.getenv("ENV")
    if mode == "development":
        return DevelopmentConfig
    elif mode == "staging":
        return StagingConfig
    elif mode == "production":
        return ProductionConfig
    elif mode == "testing":
        return TestConfig
    else:
        return Config
