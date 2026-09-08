from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import QueuePool
from app.core.config import settings

# Configure database connection based on URL
connect_args = {}
pool_config = {}

if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite: zero-config local development and testing
    connect_args = {"check_same_thread": False}
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args=connect_args
    )
else:
    # PostgreSQL: production-grade connection pooling with fallback
    try:
        connect_args = {"connect_timeout": 10}
        pool_config = {
            "poolclass": QueuePool,
            "pool_size": 10,
            "max_overflow": 20,
            "pool_recycle": 3600,  # Recycle connections after 1 hour
            "pool_pre_ping": True,  # Verify connection before using
        }
        engine = create_engine(
            settings.DATABASE_URL,
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
