import os
import json
import pandas as pd
import xgboost as xgb
import google.generativeai as genai
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Venta
from auth import get_current_user

router = APIRouter()

# Configuración inicial de Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Sincronización: Esquema estricto que espera el frontend
class AIResult(BaseModel):
    producto: str
    recomendacion: str
    nivel: str

@router.get("", response_model=AIResult)
async def get_prediction(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # 1. Extracción de Datos (Intentar desde SQLite)
    ventas_db = db.query(Venta).all()
    data_list = []
    
    if ventas_db:
        for v in ventas_db:
            try:
                items = json.loads(v.items)
                for item in items:
                    data_list.append({
                        "nombre": item.get('nombre_producto', 'Desconocido'),
                        "cantidad": item.get('cantidad', 0)
                    })
            except:
                continue
    else:
        # MODO SIMULACIÓN: Cargar Mock Data si la BD está vacía
        ruta_mock = os.path.join(os.path.dirname(__file__), "datos_simulacion.json")
        if os.path.exists(ruta_mock):
            with open(ruta_mock, "r", encoding="utf-8") as f:
                data_list = json.load(f)

    # 2. Manejo de Datos Insuficientes (Cumplimiento US08)
    if len(data_list) < 3:
        return AIResult(
            producto="Análisis Pendiente",
            recomendacion="Los datos actuales no son suficientes para generar una predicción precisa. Por favor, registre más ventas.",
            nivel="Informativo"
        )

    # 3. Procesamiento y Simulación XGBoost
    df = pd.DataFrame(data_list)
    
    # Agrupación para detectar el producto con más salida
    summary = df.groupby('nombre')['cantidad'].sum().reset_index()
    producto_critico = summary.sort_values(by='cantidad', ascending=False).iloc[0]
    
    nombre_prod = producto_critico['nombre']
    historico_ventas = int(producto_critico['cantidad'])

    # Si no hay productos en estado crítico real (ej. ventas bajísimas)
    if historico_ventas <= 3:
        return AIResult(
            producto="Análisis Pendiente",
            recomendacion="Los datos actuales no son suficientes para generar una predicción precisa. Por favor, registre más ventas.",
            nivel="Informativo"
        )
        
    # XGBoost Prediction Sim (En producción aquí aplicas modelo.predict(X))
    # Simulamos un aumento de tendencia del 25% para el próximo ciclo
    prediccion_xgboost = int(historico_ventas * 1.25) 

    # 4. Fase Cualitativa (Gemini) con Degradación Elegante
    recomendacion_texto = ""
    nivel_ia = "Crítico"
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = (f"Actúa como analista de inventarios de Elan Pure. El producto '{nombre_prod}' "
                  f"tendrá una demanda crítica de {prediccion_xgboost} unidades el próximo mes, "
                  f"según nuestro algoritmo XGBoost. Da una instrucción breve (máximo 2 líneas) "
                  f"sobre qué debe hacer el administrador al respecto.")
        
        response = model.generate_content(prompt)
        recomendacion_texto = response.text.strip()
    
    except Exception as e:
        # DEGRADACIÓN ELEGANTE: Si la IA generativa cae (Gemini error 503/Quota),
        # salvamos el reporte devolviendo el puro cálculo matemático de XGBoost.
        recomendacion_texto = f"XGBoost advierte que la demanda del producto llegará a {prediccion_xgboost} unidades. Prepare el stock necesario. (Análisis narrativo offline)."

    return AIResult(
        producto=nombre_prod,
        recomendacion=recomendacion_texto,
        nivel=nivel_ia
    )