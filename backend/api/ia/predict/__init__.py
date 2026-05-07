#<<<<<<< HEAD
# predict/__init__.py

# Importamos el router desde predictor.py
#=======
# backend/api/ia/predict/__init__.py
#>>>>>>> 88539d93ba3280f807745726ae0934ba68bc56af
from .predictor import router as predict_router

__all__ = ["predict_router"]