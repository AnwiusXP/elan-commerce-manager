import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement } from 'chart.js'
import Sidebar from '../components/Sidebar'
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement)

function Reportes() {
  const navigate = useNavigate()
  const [productoIA, setProductoIA] = useState("Esperando análisis...");
  const [recomendacionIA, setRecomendacionIA] = useState("");
  const [nivelIA, setNivelIA] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    // La autenticación ya se verifica en PrivateRoute
  }, [])

  const ventasMensuales = [320000, 450000, 390000, 520000, 410000, 480000, 560000]
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul']

  const dataGrafico = {
    labels: meses,
    datasets: [{
      data: ventasMensuales,
      backgroundColor: '#1e8a5e',
      borderRadius: 6,
    }]
  }

  const obtenerPrediccion = async () => {
    setCargando(true)
    try {
      const token = localStorage.getItem('token'); // Recuperamos el JWT

      const response = await axios.get('http://localhost:8000/api/ia/predict', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data;

      // Objetivo: Confirmar qué estamos recibiendo
      console.log("Datos recibidos desde el microservicio IA:", data);

      // 2. MANEJO DE RESPUESTA Y DEGRADACIÓN ELEGANTE (US08)
      // Validamos si la respuesta trae los datos correctos del Pydantic Schema
      if (!data || !data.producto || data.producto === "Análisis Pendiente") {
        setProductoIA("Análisis Pendiente");
        setRecomendacionIA(data?.recomendacion || "Los datos actuales no son suficientes para generar una predicción precisa. Por favor, registre más ventas.");
        setNivelIA(data?.nivel || "Informativo");
      } else {
        // 3. Actualización de estados (solo si existen los datos del modelo)
        setProductoIA(data.producto);
        setRecomendacionIA(data.recomendacion);
        setNivelIA(data.nivel);
      }
    } catch (error) {
      console.error("Error en el microservicio de IA:", error);

      // Degradación Elegante: Mensaje amigable al usuario
      setProductoIA("Servicio no disponible");
      setRecomendacionIA("No pudimos conectar con el módulo de IA. Por favor, verifica que el servidor esté encendido o intenta más tarde.");
      setNivelIA("Desconocido");
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar active="Reportes" />
      <div style={{ marginLeft: '200px', padding: '32px', flex: 1 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '28px' }}>
          Reportes y Predicción IA
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '24px' }}>
            <div style={{ color: '#8b949e', fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '20px' }}>
              Ventas mensuales
            </div>
            <Bar data={dataGrafico} options={{
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } },
                y: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } }
              }
            }} />
          </div>

          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '24px', height: 'fit-content' }}>
            <div style={{ color: '#8b949e', fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '20px' }}>
              Predicción IA
            </div>

            <div style={{ opacity: cargando ? 0.3 : 1 }}>
              <div style={{ color: '#8b949e', fontSize: '0.8rem', marginBottom: '4px' }}>Producto con más demanda:</div>
              <div style={{ color: '#1e8a5e', fontWeight: '600', marginBottom: '16px' }}>{productoIA}</div>

              <div style={{ color: '#8b949e', fontSize: '0.8rem', marginBottom: '4px' }}>Recomendación:</div>
              <div style={{ color: '#1e8a5e', fontWeight: '600', marginBottom: '16px' }}>{recomendacionIA}</div>

              <div style={{ color: '#8b949e', fontSize: '0.8rem', marginBottom: '4px' }}>Nivel de demanda:</div>
              <div style={{ display: 'inline-block', background: 'rgba(30,138,94,0.15)', color: '#1e8a5e', border: '1px solid rgba(30,138,94,0.3)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.82rem' }}>
                {nivelIA}
              </div>
            </div>

            {cargando && (
              <div style={{ color: '#8b949e', fontSize: '0.88rem', textAlign: 'center', padding: '16px 0' }}>
                ⏳ Analizando datos...
              </div>
            )}

            {mensajeError && <div style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: '8px' }}>{mensajeError}</div>}

            <button onClick={obtenerPrediccion} style={{
              background: '#1e8a5e', border: 'none', color: '#fff',
              borderRadius: '8px', padding: '10px 20px', fontSize: '0.9rem',
              fontWeight: '600', cursor: 'pointer', width: '100%', marginTop: '16px'
            }}>
              🤖 Generar predicción
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reportes