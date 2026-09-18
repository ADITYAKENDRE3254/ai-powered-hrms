from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import QueuePool
from app.core.config import settings

# Normalize PostgreSQL URL if provided with legacy postgres:// prefix
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Configure database connection based on URL
connect_args = {}
pool_config = {}

if db_url.startswith("sqlite"):
    # SQLite: zero-config local development and testing
    connect_args = {"check_same_thread": False}
    engine = create_engine(
        db_url,
        connect_args=connect_args
    )
else:
    # PostgreSQL / Supabase: production-grade connection pooling
    try:
        connect_args = {"connect_timeout": 15}
        pool_config = {
            "poolclass": QueuePool,
            "pool_size": 10,
            "max_overflow": 20,
            "pool_recycle": 300,  # Recycle connections every 5 mins for serverless/Supabase poolers
            "pool_pre_ping": True,  # Verify live connection before executing queries
        }
        engine = create_engine(
            db_url,
            connect_args=connect_args,
            **pool_config
        )
    except Exception as e:
        print(f"[Database Warning] Could not initialize PostgreSQL ({e}). Falling back to SQLite.")
        engine = create_engine(
            "sqlite:///./hrms.db",
            connect_args={"check_same_thread": False}
        )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for obtaining a SQLAlchemy session per request"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
