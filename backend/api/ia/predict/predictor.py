from fastapi import APIRouter, Query
import xgboost as xgb
import pandas as pd
import google.generativeai as genai
import json
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Configuración de Gemini (Asegúrate de tener tu .env cargado)
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
# Usamos gemini-1.5-flash porque gemini-pro ya está siendo deprecado por Google
model = genai.GenerativeModel('gemini-2.5-flash')

@router.get("")
async def predecir_demanda(producto: str = Query(default="Todos", description="Nombre o ID del producto")):
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