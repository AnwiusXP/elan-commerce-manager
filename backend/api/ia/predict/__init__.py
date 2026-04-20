# predict/__init__.py

# Importamos el router desde predictor.py
# Asumimos que dentro de predictor.py creaste una instancia llamada 'router'
from .predictor import router as predict_router

# Definimos qué se exporta cuando se importe el paquete
__all__ = ["predict_router"]