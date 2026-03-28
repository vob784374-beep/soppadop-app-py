import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

    SQLALCHEMY_DATABASE_URI = (
        os.environ.get("DATABASE_URL") or "sqlite:///soppadop_dev.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False

    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
    LOG_FILE_MAX_BYTES = int(os.environ.get("LOG_FILE_MAX_BYTES", 10 * 1024 * 1024))
    LOG_FILE_BACKUP_COUNT = int(os.environ.get("LOG_FILE_BACKUP_COUNT", 10))
    LOG_DAILY_RETENTION_DAYS = int(os.environ.get("LOG_DAILY_RETENTION_DAYS", 30))

    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173")

    # Email / SMTP (Gmail)
    SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
    SMTP_USER = os.environ.get("SMTP_USER", "")
    SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
    SMTP_FROM = os.environ.get("SMTP_FROM", "")
    SMTP_USE_TLS = os.environ.get("SMTP_USE_TLS", "true").lower() == "true"

    # Backup
    BACKUP_DIR = os.environ.get("BACKUP_DIR", "/app/backups")
    BACKUP_RETENTION = int(os.environ.get("BACKUP_RETENTION", 30))
    BACKUP_AUTO_ENABLED = (
        os.environ.get("BACKUP_AUTO_ENABLED", "false").lower() == "true"
    )
    BACKUP_AUTO_INTERVAL_HOURS = int(os.environ.get("BACKUP_AUTO_INTERVAL_HOURS", 24))


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True
    LOG_LEVEL = "DEBUG"


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_ECHO = False

    def __init__(self):
        if not os.environ.get("SECRET_KEY"):
            raise ValueError(
                "SECRET_KEY environment variable is required in production"
            )
        if not os.environ.get("JWT_SECRET_KEY"):
            raise ValueError(
                "JWT_SECRET_KEY environment variable is required in production"
            )


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}
