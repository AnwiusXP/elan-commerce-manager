import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import Sidebar from '../components/Sidebar'; // <-- Importamos tu Sidebar

// Registramos Filler para evitar el warning de la consola
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function Reportes() {
  const [productos, setProductos] = useState([]);
  const [productoId, setProductoId] = useState("");
  const [prediccion, setPrediccion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Simulamos la carga de productos para el select (Ajusta esto a tu endpoint real de productos si es necesario)
  useEffect(() => {
    // Aquí deberías llamar a tu getProductos() real. Usamos un mock basado en tu contexto previo.
    setProductos([
      { id: "1", nombre: "Ambientador" },
      { id: "2", nombre: "Límpido" },
      { id: "3", nombre: "Desengrasante" },
      { id: "4", nombre: "Detergente ropa" }
    ]);
  }, []);

  const ejecutarAnalisis = async () => {
    if (!productoId) {
      alert("Por favor, selecciona un producto primero");
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:8000/api/ia/predict?producto=${productoId}`);
      setPrediccion(response.data);
    } catch (err) {
      setError('Error en la conexión con el motor de IA.');
    } finally {
      setCargando(false);
    }
  };

  // --- ESTILOS COMPARTIDOS (Heredados de tu Dashboard) ---
  const statsStyle = {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '12px',
    padding: '24px',
    flex: 1
  };

  const inputStyle = {
    background: '#0d1117',
    color: '#c9d1d9',
    border: '1px solid #30363d',
    padding: '10px 16px',
    borderRadius: '6px',
    outline: 'none',
    marginRight: '12px'
  };

  const buttonStyle = {
    background: '#1e8a5e',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.2s'
  };

  return (
    // Se asume que el body o un contenedor padre tiene background oscuro (#0d1117) y color de texto claro (#c9d1d9)
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0d1117', color: '#c9d1d9' }}>

      {/* 1. SIDEBAR INTEGRADO */}
      <Sidebar active="Reportes" />

      <div style={{ marginLeft: '200px', padding: '32px', flex: 1 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '28px' }}>
          Inteligencia de Negocios (IA)
        </h1>

        {/* CONTROLES DE ANÁLISIS */}
        <div style={{ ...statsStyle, marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
          <select
            style={inputStyle}
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
          >
            <option value="">-- Seleccione un producto --</option>
            <option value="Todos">Todos los productos</option>
            {productos.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
          <button
            style={buttonStyle}
            onClick={ejecutarAnalisis}
            disabled={cargando}
          >
            {cargando ? 'Analizando...' : 'Analizar Datos'}
          </button>
        </div>

        {error && (
          <div style={{ background: '#f8514920', color: '#f85149', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #f8514950' }}>
            {error}
          </div>
        )}

        {/* RESULTADOS DE LA PREDICCIÓN */}
        {prediccion && (
          <>
            {/* Tarjetas de Estadísticas (Mismo diseño que el Dashboard) */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>

              <div style={statsStyle}>
                <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: '8px' }}>Producto Analizado</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {prediccion.producto !== "Todos" ? `ID: ${prediccion.producto}` : "Global"}
                </div>
              </div>

              <div style={statsStyle}>
                <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: '8px' }}>Demanda Proyectada (Próx. Día)</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e8a5e' }}>
                  {prediccion.cantidad_estimada} <span style={{ fontSize: '1rem', color: '#8b949e' }}>unidades</span>
                </div>
              </div>

              <div style={statsStyle}>
                <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: '8px' }}>Nivel de Alerta</div>
                <div style={{
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  color: prediccion.nivel === 'Alto' ? '#f85149' : (prediccion.nivel === 'Normal' ? '#1e8a5e' : '#e3b341')
                }}>
                  {prediccion.nivel}
                </div>
              </div>

            </div>

            {/* Tarjeta de Recomendación Gemini (Destacada) */}
            <div style={{ ...statsStyle, marginBottom: '24px', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ color: '#8b949e', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✨</span> Sugerencia Estratégica (IA)
              </div>
              <div style={{ fontSize: '1rem', lineHeight: '1.5' }}>
                {prediccion.recomendacion}
              </div>
            </div>

            {/* Gráfico de Tendencias adaptado al Dark Mode */}
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '24px' }}>
              <div style={{ color: '#8b949e', fontSize: '0.85rem', marginBottom: '16px' }}>
                Proyección de Ventas (Histórico + XGBoost)
              </div>

              {prediccion.datosGrafica && prediccion.datosGrafica.labels.length > 0 ? (
                <Line
                  data={prediccion.datosGrafica}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        labels: { color: '#c9d1d9' }
                      }
                    },
                    scales: {
                      x: {
                        ticks: { color: '#8b949e' },
                        grid: { color: '#21262d' }
                      },
                      y: {
                        ticks: { color: '#8b949e' },
                        grid: { color: '#21262d' }
                      }
                    }
                  }}
                />
              ) : (
                <div style={{ color: '#8b949e', textAlign: 'center', padding: '40px' }}>
                  No hay suficientes datos para graficar.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Reportes;