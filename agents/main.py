"""
VoyageAI Agent Service Entrypoint Alias
Allows running both:
  - uvicorn main:app --reload --port 8000
  - uvicorn app.main:app --reload --port 8000
"""
from app.main import app

__all__ = ["app"]
