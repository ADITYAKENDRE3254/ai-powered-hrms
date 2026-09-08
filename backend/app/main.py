import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.core.database import engine, Base
import app.models  # Import all models to register with Base
from app.api import (
    auth,
    employees,
    departments,
    teams,
    attendance,
    leaves,
    recruitment,
    resumes,
    payroll,
    payslips,
    ai,
    notifications,
    reports,
    audit,
    settings as settings_api,
    workforce_intelligence,
    training,
    compensation
)
from app.tasks.scheduler import start_scheduler, stop_scheduler

def ensure_schema_compatibility():
    """Adds missing columns to SQLite database tables if they do not exist"""
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            # Check candidates table columns
            result = conn.execute(text("PRAGMA table_info(candidates)"))
            cols = [row[1] for row in result.fetchall()]
            if cols:
                if "original_resume_filename" not in cols:
                    conn.execute(text("ALTER TABLE candidates ADD COLUMN original_resume_filename VARCHAR(255)"))
                if "original_resume_storage_path" not in cols:
                    conn.execute(text("ALTER TABLE candidates ADD COLUMN original_resume_storage_path VARCHAR(500)"))
                if "original_resume_mime_type" not in cols:
                    conn.execute(text("ALTER TABLE candidates ADD COLUMN original_resume_mime_type VARCHAR(100)"))
                if "original_resume_size" not in cols:
                    conn.execute(text("ALTER TABLE candidates ADD COLUMN original_resume_size INTEGER"))
                if "uploaded_at" not in cols:
                    conn.execute(text("ALTER TABLE candidates ADD COLUMN uploaded_at DATETIME"))
                conn.commit()
    except Exception as e:
        print(f"[Schema Migration Warning] {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables if not exist
    Base.metadata.create_all(bind=engine)
    ensure_schema_compatibility()
    # Start automated background payroll scheduler
    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-stack AI-Powered Human Resource Management System with Dual-Layer RBAC, GPS Geofencing, Auto Leave Approval, Resume Parsing, and AI Workforce Intelligence.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
origins = [str(origin).strip() for origin in settings.BACKEND_CORS_ORIGINS if origin]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip Response Compression Middleware (Compresses responses >= 1KB)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Explicit Health Check Endpoint (Returns HTTP 200 without leaking secrets)
@app.get("/health", status_code=200)
async def health_check():
    """Lightweight production health probe for uptime monitors and container orchestrators"""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected"
    }

# Mount static uploads directory for resumes and documents
os.makedirs("./uploads/resumes", exist_ok=True)
os.makedirs("./uploads/documents", exist_ok=True)
os.makedirs("./uploads/payslips", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="./uploads"), name="uploads")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(employees.router, prefix=settings.API_V1_STR)
app.include_router(departments.router, prefix=settings.API_V1_STR)
app.include_router(teams.router, prefix=settings.API_V1_STR)
app.include_router(attendance.router, prefix=settings.API_V1_STR)
app.include_router(leaves.router, prefix=settings.API_V1_STR)
app.include_router(recruitment.router, prefix=settings.API_V1_STR)
app.include_router(resumes.router, prefix=settings.API_V1_STR)
app.include_router(payroll.router, prefix=settings.API_V1_STR)
app.include_router(payslips.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(workforce_intelligence.router, prefix=settings.API_V1_STR)
app.include_router(training.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(settings_api.router, prefix=settings.API_V1_STR)
app.include_router(compensation.router, prefix=settings.API_V1_STR)

# =========================================================================
# Single-Link SPA Frontend Serving Setup
# =========================================================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIST = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "dist"))
ASSETS_DIR = os.path.join(FRONTEND_DIST, "assets")

if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="frontend_assets")

@app.get("/{full_path:path}")
async def serve_spa_frontend(full_path: str):
    # Bypass API, docs, redoc, openapi, and uploads
    if (
        full_path.startswith("api/") or
        full_path == "api" or
        full_path.startswith("docs") or
        full_path.startswith("redoc") or
        full_path.startswith("uploads")
    ):
        raise HTTPException(status_code=404, detail="Not Found")

    # Check for direct file in dist (e.g., vite.svg, favicon.ico)
    candidate_file = os.path.join(FRONTEND_DIST, full_path)
    if full_path and os.path.isfile(candidate_file):
        return FileResponse(candidate_file)

    # Fallback to SPA index.html for React Router client routes
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)

    return {
        "message": "AI-Powered HRMS API is live.",
        "version": settings.VERSION,
        "docs": "/docs",
        "demo_mode": settings.AI_DEMO_MODE,
        "note": "Frontend dist not built. Run 'npm run build' inside frontend directory."
    }
