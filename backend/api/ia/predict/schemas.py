from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# Representa una sola venta histórica
class VentaBase(BaseModel):
    producto_id: str
    nombre_producto: str
    cantidad: int
    precio_unitario: float
    fecha_venta: datetime

# Representa el estado actual del inventario (para predecir quiebres)
class ProductoStock(BaseModel):
    producto_id: str
    nombre_producto: str
    stock_actual: int
    visitas_hoy: int

# El "Contrato" principal: Lo que Laravel enviará al endpoint de IA
class AnalisisRequest(BaseModel):
    historial_ventas: List[VentaBase]
    inventario_actual: List[ProductoStock]
    dias_a_predecir: Optional[int] = 7  # Por defecto predice la próxima semana