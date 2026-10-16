import os
import sys

# Ensure the backend directory is in Python path for root deployment
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import the FastAPI application
from app.main import app  # noqa: F401, E402
