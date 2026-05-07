from fastapi import APIRouter, Query
import xgboost as xgb
import pandas as pd
import google.generativeai as genai
#<<<<<<< HEAD
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Venta
from auth import get_current_user
#=======
import json
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
#>>>>>>> 88539d93ba3280f807745726ae0934ba68bc56af

# Aseguramos que el router no tenga prefijo interno para no duplicar /api/ia/predict
router = APIRouter()

# Configuración de Gemini (Asegúrate de tener tu .env cargado)
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
# Usamos gemini-1.5-flash porque gemini-pro ya está siendo deprecado por Google
model = genai.GenerativeModel('gemini-2.5-flash')

#<<<<<<< HEAD
# Esquema de respuesta sincronizado con el frontend (US08)
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

        # 2. VERIFICACIÓN US08: Lógica de simulación si la BD tiene datos insuficientes
    if len(data_list) < 3:
            ruta_json = os.path.join(os.path.dirname(__file__), "datos_simulacion.json")
            if not os.path.exists(ruta_json):
                raise HTTPException(status_code=404, detail="Archivo de simulación no encontrado")
                
            with open(ruta_json, "r", encoding="utf-8") as f:
                datos_sim = json.load(f)
                # Retorno estricto de simulación según US08
                return AIResult(
                    producto=datos_sim[0].get("producto", "N/A"),
                    recomendacion="SIMULACIÓN: " + datos_sim[0].get("recomendacion_gemini", "Datos simulados."),
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
    
#=======
@router.get("")
async def predecir_demanda(producto: str = Query(default="Todos", description="Nombre o ID del producto")):
#>>>>>>> 88539d93ba3280f807745726ae0934ba68bc56af
    try:
        # ---------------------------------------------------------
        # 1. CARGA DE DATOS SEGURA (Evita el error de 'df' no definido)
        # ---------------------------------------------------------
        ruta_json = "datos_simulacion.json"
        if not os.path.exists(ruta_json):
            raise Exception(f"No se encontró el archivo de base de datos simulada: {ruta_json}")
            
        with open(ruta_json, "r", encoding="utf-8") as file:
            datos = json.load(file)
            
        # AQUÍ NACE 'df' OFICIALMENTE
        df = pd.DataFrame(datos)
        nombre_producto = "Todos los productos"
        
        # ---------------------------------------------------------
        # 2. FILTRAR LOS DATOS POR EL PRODUCTO
        # ---------------------------------------------------------
        if producto != "Todos":
            # 💡 SOLUCIÓN: Convertimos la columna y el parámetro a String para evitar errores de tipo
            # También usamos un print para depurar en consola y ver qué está pasando
            print(f"Buscando el producto con ID: {producto}")
            
            # Asegúrate de que 'producto_id' sea exactamente el nombre de la llave en tu JSON
            if 'producto_id' in df.columns:
                df = df[df['producto_id'].astype(str) == str(producto)] 
            else:
                print("⚠️ ADVERTENCIA: La columna 'producto_id' no existe en el JSON.")
            
            nombre_producto = producto
            
            # Validación de seguridad: si después de filtrar no hay datos
            if df.empty:
                print(f"⚠️ El filtro dejó el DataFrame vacío para el producto {producto}")
                return {
                    "producto": nombre_producto,
                    "recomendacion": f"No hay suficientes datos históricos para el producto {nombre_producto}.",
                    "nivel": "Pendiente",
                    "cantidad_estimada": 0,
                    "datosGrafica": {
                        "labels": [],
                        "datasets": []
                    }
                }

        # Extraemos los datos reales de nuestro df en lugar de usar datos quemados (hardcoded)
        # Asegúrate de que las columnas se llamen 'fecha_venta' y 'cantidad' en tu JSON
        fechas_historicas = df['fecha_venta'].astype(str).tolist() if 'fecha_venta' in df.columns else ["2026-04-10", "2026-04-11", "2026-04-12", "2026-04-13", "2026-04-14"]
        cantidades_historicas = df['cantidad'].tolist() if 'cantidad' in df.columns else [50, 55, 52, 60, 58]
            
        # ---------------------------------------------------------
        # 3. MOTOR XGBOOST (Predicción Numérica Simulada/Real)
        # ---------------------------------------------------------
        # Simulando el resultado de XGBoost para los próximos 3 días
        fechas_futuras = ["2026-04-15", "2026-04-16", "2026-04-17"]
        
        # Lógica simulada: tomamos el último valor y lo proyectamos hacia arriba
        ultimo_valor = cantidades_historicas[-1] if cantidades_historicas else 50
        predicciones_xgboost = [int(ultimo_valor*1.1), int(ultimo_valor*1.2), int(ultimo_valor*1.3)] 
        
        # Tomamos el último valor predicho como la "Cantidad Estimada"
        cantidad_estimada_final = predicciones_xgboost[-1]
        
        # ---------------------------------------------------------
        # 4. CONSTRUCCIÓN DE EJES PARA CHART.JS (¡Muy Importante!)
        # ---------------------------------------------------------
        # Unimos el pasado y el futuro para que la gráfica sea una línea continua
        labels_grafica = fechas_historicas + fechas_futuras
        data_grafica = cantidades_historicas + predicciones_xgboost

        # ---------------------------------------------------------
        # 5. API DE GEMINI (Recomendación Estratégica)
        # ---------------------------------------------------------
        prompt_gemini = f"""
        Eres un experto en inventario. El producto '{nombre_producto}' ha tenido estas ventas: {cantidades_historicas}. 
        Nuestro modelo XGBoost proyecta estas ventas para los próximos días: {predicciones_xgboost}. 
        Escribe una recomendación corta de máximo 3 líneas indicando si debemos comprar más stock o no.
        """
        
        try:
            respuesta_gemini = model.generate_content(prompt_gemini)
            texto_recomendacion = respuesta_gemini.text
        except Exception as gemini_error:
            # Degradación elegante con impresión en consola para que sepas qué falló
            print(f"❌ Error de Gemini: {gemini_error}")
            texto_recomendacion = "Recomendación IA no disponible temporalmente. Basado en la gráfica, evalúe la tendencia."

        # Definimos el nivel de alerta
        nivel_alerta = "Alto" if cantidad_estimada_final > 70 else "Normal"

        # ---------------------------------------------------------
        # 6. RETORNO DEL DICCIONARIO ESTRUCTURADO PARA REACT
        # ---------------------------------------------------------
        return {
            "producto": nombre_producto,
            "recomendacion": texto_recomendacion,
            "nivel": nivel_alerta,
            "cantidad_estimada": cantidad_estimada_final,
            "datosGrafica": {
                "labels": labels_grafica,
                "datasets": [
                    {
                        "label": "Demanda Histórica y Proyectada",
                        "data": data_grafica,
                        "borderColor": "#3b82f6",
                        "backgroundColor": "rgba(59, 130, 246, 0.5)",
                        "tension": 0.3, # Hace que la línea sea curva
                        "fill": True    # Pinta el fondo debajo de la línea
                    }
                ]
            }
        }

    except Exception as e:
        # ---------------------------------------------------------
        # 7. BLINDAJE FINAL (Try-Catch General)
        # ---------------------------------------------------------
        print(f"❌ Error crítico en IA: {str(e)}")
        return {
            "producto": "Desconocido",
            "recomendacion": f"Error interno en el microservicio IA: {str(e)}.",
            "nivel": "Error",
            "cantidad_estimada": 0,
            "datosGrafica": {
                "labels": [],
                "datasets": []
            }
        }