from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import json
from database import engine, Base
from models import Producto, Venta
from auth import (
    authenticate_user, create_access_token, get_current_user,
    get_password_hash, get_user, ACCESS_TOKEN_EXPIRE_MINUTES,
    get_db
)
from datetime import timedelta

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class LoginRequest(BaseModel):
    usuario: str
    contrasena: str

class ProductoBase(BaseModel):
    nombre: str
    categoria: str
    precio: float
    stock: int
    stockMin: int

class VentaRequest(BaseModel):
    items: List[dict]

# Routes
@app.post("/api/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, request.usuario, request.contrasena)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"token": access_token}

@app.post("/api/logout")
async def logout(current_user = Depends(get_current_user)):
    return {"message": "Saliste correctamente"}

@app.get("/api/productos")
async def get_productos(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    productos = db.query(Producto).all()
    return productos

@app.post("/api/productos")
async def create_producto(producto: ProductoBase, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_producto = Producto(**producto.dict())
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto

@app.put("/api/productos/{producto_id}")
async def update_producto(producto_id: int, producto: ProductoBase, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for key, value in producto.dict().items():
        setattr(db_producto, key, value)
    db.commit()
    db.refresh(db_producto)
    return db_producto

@app.delete("/api/productos/{producto_id}")
async def delete_producto(producto_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(db_producto)
    db.commit()
    return {"ok": True}

@app.get("/api/ventas")
async def get_ventas(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    ventas = db.query(Venta).all()
    return ventas

@app.post("/api/ventas")
async def create_venta(venta: VentaRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    total = sum(item['precio'] * item['cantidad'] for item in venta.items)
    db_venta = Venta(items=json.dumps(venta.items), total=total)
    db.add(db_venta)
    db.commit()
    db.refresh(db_venta)
    return db_venta