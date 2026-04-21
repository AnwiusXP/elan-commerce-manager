from fastapi import APIRouter
from fastapi.responses import JSONResponse # <- IMPORTANTE: Esta es la solución principal
import pandas as pd
import xgboost as xgb
import sqlite3
import json
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

# Configuración Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

@router.get("")
async def generar_prediccion():
    try:
        # --- US08: EXTRACCIÓN Y FALLBACK ---
        df = None
        try:
            conn = sqlite3.connect('elan.db')
            df_db = pd.read_sql_query("SELECT * FROM ventas", conn)
            conn.close()
            if len(df_db) < 3:
                raise ValueError("Insuficientes datos en BD")
            df = df_db
        except Exception:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            json_path = os.path.join(base_dir, 'datos_simulacion.json')
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            df = pd.DataFrame(data)

        # --- MOTOR XGBOOST ---
        df['fecha_venta'] = pd.to_datetime(df['fecha_venta'])
        df['dia'] = df['fecha_venta'].dt.day
        X = df[['producto_id', 'dia']]
        y = df['cantidad']
        
        modelo_xgb = xgb.XGBRegressor(objective='reg:squarederror')
        modelo_xgb.fit(X, y)
        
        # FIX NUMPY DEFINITIVO: Doble casteo para forzar el tipo nativo int de Python puro
        prediccion_cruda = modelo_xgb.predict(pd.DataFrame({'producto_id': [2], 'dia': [25]}))[0]
        prediccion_demanda = int(float(prediccion_cruda)) 

        # --- MOTOR GEMINI (Degradación Elegante) ---
        recomendacion_final = ""
        try:
            modelo_gemini = genai.GenerativeModel('gemini-pro')
            prompt = f"Actúa como consultor de ventas. Se proyecta que el Límpido venderá {prediccion_demanda} unidades. Dame una recomendación corta para el inventario."
            respuesta = modelo_gemini.generate_content(prompt)
            recomendacion_final = respuesta.text
        except Exception as e:
            recomendacion_final = f"Modo Offline activo. Sugerimos asegurar stock para {prediccion_demanda} unidades."

        # LIMPIEZA ABSOLUTA DEL DATAFRAME
        # Convertimos todo a un string de texto y luego lo cargamos como diccionario puro de Python
        datos_grafica_seguros = json.loads(df.to_json(orient='records', date_format='iso'))

        # Armamos el diccionario nativo
        respuesta_dict = {
            "producto": "Límpido (IA Analizado)",
            "recomendacion": recomendacion_final,
            "nivel": "Normal" if prediccion_demanda < 25 else "Alto",
            "grafica": datos_grafica_seguros
        }

        # --- RETORNO BLINDADO ---
        # En lugar de retornar el diccionario suelto, obligamos a FastAPI a usar JSONResponse
        # Esto salta el archivo `encoders.py` que estaba causando el Error 500
        return JSONResponse(content=respuesta_dict)

    except Exception as e:
        # RETORNO DE EMERGENCIA SEGURO
        # Si algo falla, devolvemos Status 200 (Éxito de conexión) pero con los datos de error
        # Así React NUNCA lanzará error de CORS y mostrará el mensaje amigablemente.
        return JSONResponse(
            status_code=200, 
            content={
                "producto": "No Disponible",
                "recomendacion": f"Fallo interno controlado: {str(e)}",
                "nivel": "Crítico",
                "grafica": []
            }
        )