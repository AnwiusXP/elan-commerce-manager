# backend/api/ia/predict/__init__.py
from .predictor import router as predict_router

__all__ = ["predict_router"]