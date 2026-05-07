import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List
import json

# Importaciones locales de base de datos y modelos
from database import engine, Base
from models import Producto, Venta
from auth import (
    authenticate_user, create_access_token, get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES, get_db
)
from datetime import timedelta

# 1. Corrección de Importación: Asegúrate de que los __init__.py existan
try:
    from api.ia.predict.predictor import router as predict_router
except ImportError as e:
    print(f"Error crítico: No se pudo cargar el módulo de IA. Verifique los archivos __init__.py. Detalle: {e}")
    predict_router = None

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Elan Commerce Manager API",
    description="Sistema ECM - Módulo de Gestión e IA Predictiva",
    version="1.0.1"
)

# 2. Configuración de CORS Robusta (DEBE IR ANTES DE LOS ROUTERS)
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite GET, POST, OPTIONS, etc.
    allow_headers=["*"], # Permite Authorization y Content-Type
)

# 3. Registro del Router de IA (Arquitectura de 3 Capas)
if predict_router:
    app.include_router(
        predict_router,
        prefix="/api/ia/predict", # Sincronizado con Reportes.jsx
        tags=["IA"]
    )

# --- ESQUEMAS PYDANTIC ---

class LoginRequest(BaseModel):
    usuario: str # Este campo recibirá el email del administrador
    contrasena: str

class ProductoBase(BaseModel):
    nombre: str
    categoria: str
    precio: float
    stock: int
    stockMin: int

class VentaItem(BaseModel):
    producto_id: int
    nombre_producto: str
    cantidad: int
    precio: float

class VentaRequest(BaseModel):
    items: List[VentaItem]

# --- ENDPOINTS ---

@app.post("/api/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Sincronización: Pasamos 'request.usuario' al parámetro 'email' de auth.py
    user = authenticate_user(db, email=request.usuario, password=request.contrasena)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas. Verifique su correo y contraseña.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {"email": user.email, "role": "admin"}
    }

# --- GESTIÓN DE VENTAS (REQUISITO MÓDULO 2 - SRS) ---

@app.get("/api/ventas")
async def get_ventas(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Obtiene el historial para alimentar XGBoost"""
    return db.query(Venta).all()

@app.post("/api/ventas")
async def create_venta(venta: VentaRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Registra venta y prepara datos para el modelo predictivo"""
    try:
        total_venta = sum(item.precio * item.cantidad for item in venta.items)
        
        # Guardamos los items como JSON string para compatibilidad con la DB
        nueva_venta = Venta(
            items=json.dumps([item.dict() for item in venta.items]), 
            total=total_venta
        )
        
        db.add(nueva_venta)
        db.commit()
        db.refresh(nueva_venta)
        return {"status": "success", "venta_id": nueva_venta.id, "total": total_venta}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al registrar venta: {str(e)}")

# --- GESTIÓN DE PRODUCTOS ---

@app.get("/api/productos")
async def list_productos(db: Session = Depends(get_db)):
    return db.query(Producto).all()

# 4. Optimización de Arranque (Solución a SpawnProcess/Python 3.14)
# En Windows y versiones nuevas de Python, el arranque debe estar protegido
if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True, # reload=True puede causar SpawnErrors en 3.14, si falla, cámbialo a False
        workers=1    # Mantener 1 worker ayuda a la estabilidad en entornos virtuales
    )