import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// 1. Registro obligatorio de los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Reportes = () => {
  // 2. Prevención de Vista Vacía: Estados iniciales seguros (Evita undefined en el primer render)
  const [productoIA, setProductoIA] = useState("Pendiente");
  const [recomendacionIA, setRecomendacionIA] = useState("Pendiente...");
  const [nivelIA, setNivelIA] = useState("Pendiente");

  // Estado para la gráfica. Se inicializa en null para validar antes de renderizar
  const [datosGrafica, setDatosGrafica] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 3. Unificación de Funciones (Solución al ReferenceError y Hoisting)
  const obtenerPrediccion = async () => {
    setIsLoading(true);

    try {
      // Recuperar token para la petición segura
      const token = localStorage.getItem('token') || '';

      const respuesta = await axios.get('http://localhost:8000/api/ia/predict', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const datos = respuesta.data;

      // 4. Lógica de Consumo y US08: Si viene "Se requiere más información", se pinta directamente
      setProductoIA(datos.producto || "N/A");
      setRecomendacionIA(datos.recomendacion || "Se requiere más información para un análisis preciso.");
      setNivelIA(datos.nivel || "Desconocido");

      // 5. Validación Segura de Chart.js: Solo preparamos la gráfica si hay datos en el array
      if (datos.tendencias && Array.isArray(datos.tendencias) && datos.tendencias.length > 0) {
        const labels = datos.tendencias.map((item, index) => item.fecha || `Día ${index + 1}`);
        const dataValues = datos.tendencias.map(item => item.prediccion || item.valor || 0);

        setDatosGrafica({
          labels: labels,
          datasets: [
            {
              label: 'Proyección de Demanda (XGBoost)',
              data: dataValues,
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              tension: 0.3, // Curva suave
              fill: true,
            }
          ]
        });
      } else {
        // Si no hay array de tendencias, nos aseguramos de que sea null para no quebrar el componente
        setDatosGrafica(null);
      }

    } catch (error) {
      console.error("Error al obtener datos de IA:", error);
      // Degradación Elegante: El backend falló, pero la UI se mantiene viva informando al usuario
      setProductoIA("No disponible");
      setNivelIA("Error de conexión");
      setRecomendacionIA("En este momento el motor de inteligencia artificial no está disponible. Sigue operando manualmente.");
      setDatosGrafica(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 6. JSX Seguro: Todo está envuelto en validaciones lógicas
  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Inteligencia de Negocios y Predicción (IA)</h2>

      {/* Botón enlazado al nombre exacto de la Arrow Function */}
      <button
        onClick={obtenerPrediccion}
        disabled={isLoading}
        style={{ padding: '10px 20px', cursor: 'pointer', marginBottom: '20px' }}
      >
        {isLoading ? 'Analizando con Gemini & XGBoost...' : 'Analizar Datos'}
      </button>

      {/* Tarjeta de Recomendaciones (Nunca se rompe porque sus estados siempre tienen un string) */}
      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
        <h3>Recomendación Estratégica (US08)</h3>
        <p><strong>Producto Objetivo:</strong> {productoIA}</p>
        <p><strong>Nivel de Demanda:</strong> {nivelIA}</p>
        <p><strong>Consejo Gemini:</strong> {recomendacionIA}</p>
      </div>

      {/* Renderizado Condicional del Gráfico (Evita errores de lectura de properties de null) */}
      <div style={{ height: '400px', border: '1px dashed #ccc', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {datosGrafica ? (
          <Line
            data={datosGrafica}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Proyección a 7 Días' }
              }
            }}
          />
        ) : (
          <p style={{ color: '#777' }}>No hay suficientes datos históricos para graficar proyecciones en este momento.</p>
        )}
      </div>
    </div>
  );
};

export default Reportes;