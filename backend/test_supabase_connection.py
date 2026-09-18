"""
Supabase PostgreSQL Connection & Verification Script for AI-HRMS
Run this script to verify your Supabase database connection and initialize all tables.

Usage:
  python test_supabase_connection.py "postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"
  or configure DATABASE_URL in backend/.env
"""

import sys
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from sqlalchemy import create_engine, text
from app.core.config import settings
import app.models  # Register all models with Base
from app.core.database import Base

def test_connection(connection_url: str = None):
    url = connection_url or settings.DATABASE_URL
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    print("=" * 70)
    print("AI-HRMS -> SUPABASE POSTGRESQL VERIFICATION")
    print("=" * 70)
    print(f"Connecting to database...")

    connect_args = {"connect_timeout": 15} if not url.startswith("sqlite") else {"check_same_thread": False}
    try:
        engine = create_engine(url, connect_args=connect_args, pool_pre_ping=True)
        with engine.connect() as conn:
            if not url.startswith("sqlite"):
                result = conn.execute(text("SELECT version();")).fetchone()
                print("🟢 Connection Successful!")
                print(f"PostgreSQL Version: {result[0]}\n")
            else:
                print("🟢 Connection Successful (Local SQLite Mode)!\n")

        print("Creating all 16 relational database tables on Supabase...")
        Base.metadata.create_all(bind=engine)
        print("🟢 All tables created successfully!")

        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"\nDiscovered {len(tables)} tables in database:")
        for t in tables:
            print(f"  ✓ {t}")

        print("\n" + "=" * 70)
        print("🎉 SUCCESS: Database is fully connected & ready for AI-HRMS!")
        print("=" * 70)
        return True

    except Exception as e:
        print("\n🔴 Connection Failed:")
        print(f"Error: {e}")
        print("\nTroubleshooting Tips:")
        print("1. Double check your database password in the connection string.")
        print("2. Ensure your Supabase project is active (not paused).")
        print("3. Check if your connection string requires transaction mode (port 6543) or direct (port 5432).")
        return False

if __name__ == "__main__":
    db_arg = sys.argv[1] if len(sys.argv) > 1 else None
    test_connection(db_arg)
