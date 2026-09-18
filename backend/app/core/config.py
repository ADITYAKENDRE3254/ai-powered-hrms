import os
import shutil
from typing import Optional, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings

IS_VERCEL = bool(os.environ.get("VERCEL"))

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered HRMS"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database - Supabase PostgreSQL Cloud Database (Permanent Production IPv4 Pooler)
    # Default connection string for Supabase project ukfohyrxgeebucgveawa (ap-south-1 pooler)
    DATABASE_URL: str = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres.ukfohyrxgeebucgveawa:AIHRMS%223254@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require"
    )

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

    # File Uploads (Uses /tmp on Vercel serverless to avoid read-only filesystem errors)
    UPLOAD_DIR: str = "/tmp/uploads" if IS_VERCEL else "./uploads"
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
    BACKEND_CORS_ORIGINS: Union[list[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            v_trimmed = v.strip()
            if v_trimmed.startswith("[") and v_trimmed.endswith("]"):
                import json
                try:
                    return json.loads(v_trimmed)
                except Exception:
                    pass
            return [i.strip() for i in v_trimmed.split(",") if i.strip()]
        elif isinstance(v, list):
            return [str(i).strip() for i in v if i]
        return v

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "allow"
    }

settings = Settings()

# On Vercel, copy pre-seeded hrms.db to /tmp/hrms.db on initial serverless invocation if present
if IS_VERCEL and settings.DATABASE_URL.startswith("sqlite"):
    tmp_db = "/tmp/hrms.db"
    if not os.path.exists(tmp_db) or os.path.getsize(tmp_db) == 0:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        candidates = [
            os.path.join(base_dir, "hrms.db"),
            os.path.join(base_dir, "..", "backend", "hrms.db"),
            os.path.join(base_dir, "..", "hrms.db"),
        ]
        for src in candidates:
            if os.path.isfile(src) and os.path.getsize(src) > 0:
                try:
                    shutil.copyfile(src, tmp_db)
                    break
                except Exception:
                    pass

# Ensure upload directories exist
os.makedirs(os.path.join(settings.UPLOAD_DIR, "resumes"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "documents"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "payslips"), exist_ok=True)
