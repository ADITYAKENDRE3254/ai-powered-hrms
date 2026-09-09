import os
import sys

# Add backend directory to Python sys.path for Vercel Serverless Function execution
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Set VERCEL environment flag if not already set
os.environ.setdefault("VERCEL", "1")

from app.main import app
