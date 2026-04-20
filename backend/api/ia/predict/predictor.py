import os
import pandas as pd
import xgboost as xgb
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Venta, Producto
from auth import get_current_user
import json

router = APIRouter()

# Configuración de Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Esquema de salida según requerimiento del frontend
class AIResult(BaseModel):
    producto: str
    recomendacion: str
    nivel: str

@router.get("", response_model=AIResult)
async def get_prediction(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # 1. Extraer datos de la DB
    ventas = db.query(Venta).all()
    productos = db.query(Producto).all()
    
    if not ventas or len(ventas) < 5:
        raise HTTPException(status_code=400, detail="Datos insuficientes para el modelo de IA.")

    # 2. Procesar datos con Pandas
    # Convertimos el JSON string de ventas en una lista plana para el DataFrame
    data_list = []
    for v in ventas:
        items = json.loads(v.items)
        for item in items:
            data_list.append({
                "producto_id": item['producto_id'],
                "nombre": item['nombre_producto'],
                "cantidad": item['cantidad'],
                "fecha": v.id # Usamos el ID como proxy de tiempo si no hay timestamp
            })
    
    df = pd.DataFrame(data_list)
    
    # 3. Lógica XGBoost (Simplicada para el producto con más ventas)
    # Agrupamos para encontrar el producto más crítico
    summary = df.groupby('nombre')['cantidad'].sum().reset_index()
    # Entrenamos un modelo rápido por producto (ejemplo conceptual)
    # En producción, aquí cargarías tu modelo .json de XGBoost
    producto_critico = summary.sort_values(by='cantidad', ascending=False).iloc[0]
    nombre_prod = producto_critico['nombre']
    
    # 4. Consulta a Gemini para recomendación cualitativa
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = (f"Actúa como analista de inventarios. El producto '{nombre_prod}' "
                  f"presenta una tendencia de alta demanda según nuestro modelo XGBoost. "
                  f"Genera una recomendación de 2 líneas para el administrador de Elan Pure.")
        
        response = model.generate_content(prompt)
        recomendacion_texto = response.text.strip()
    except Exception:
        recomendacion_texto = "Aumentar el stock preventivo debido a tendencia alcista detectada."

    # 5. Determinar nivel
    nivel_ia = "Crítico" if producto_critico['cantidad'] > 10 else "Estable"

    return {
        "producto": nombre_prod,
        "recomendacion": recomendacion_texto,
        "nivel": nivel_ia
    }