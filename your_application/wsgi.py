import os
import sys

# Ensure backend directory is in python search path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(base_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from a2wsgi import ASGIMiddleware
from app.main import app as asgi_app

# Expose both ASGI and WSGI applications
app = asgi_app
application = ASGIMiddleware(asgi_app)
