import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered HRMS"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database - Default to SQLite (dev/zero-config), override with PostgreSQL via DATABASE_URL in .env (production)
    # For PostgreSQL: postgresql://user:password@localhost:5432/ai_hrms_db
    # For SQLite: sqlite:///./hrms.db
    DATABASE_URL: str = "sqlite:///./hrms.db"

    # JWT
    JWT_SECRET_KEY: str = "super_secret_jwt_key_ai_hrms_2026_production_grade_token_signature_99182"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # AI Configuration
    AI_API_KEY: Optional[str] = None
    AI_DEMO_MODE: bool = True

    # Office GPS & Geofence (Bangalore Tech Park default)
    OFFICE_NAME: str = "Bangalore Innovation Hub"
    OFFICE_LATITUDE: float = 12.9715987
    OFFICE_LONGITUDE: float = 77.5945627
    GEOFENCE_RADIUS: float = 100.0  # Meters

    # File Uploads
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 10

    # SMTP / Email Notifications
    SMTP_ENABLED: bool = False
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_TLS: bool = True
    EMAILS_FROM_EMAIL: str = "recruitment@ai-hrms.com"
    EMAILS_FROM_NAME: str = "AI-HRMS Talent Acquisition"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "allow"

settings = Settings()

# Ensure upload directories exist
os.makedirs(os.path.join(settings.UPLOAD_DIR, "resumes"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "documents"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "payslips"), exist_ok=True)
