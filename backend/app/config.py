import os
from datetime import timedelta
from pathlib import Path


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # SAML Configuration
    SAML_CONFIG = os.getenv(
        "SAML_CONFIG",
        str(Path(__file__).resolve().parent.parent / "config" / "saml")
    )
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # JWT Configuration
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-dev-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_CSRF_CHECK_FORM = True
    JWT_COOKIE_SECURE = False  # Set to True in production with HTTPS
    JWT_COOKIE_SAMESITE = "Lax"
    JWT_ACCESS_COOKIE_NAME = "access_token"
    JWT_REFRESH_COOKIE_NAME = "refresh_token"


class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = True  # Enables test login bypass


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    JWT_COOKIE_SECURE = True
    JWT_COOKIE_SAMESITE = "Strict"


class TestingConfig(Config):
    DEBUG = True
    TESTING = True
    JWT_COOKIE_SECURE = False


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}
