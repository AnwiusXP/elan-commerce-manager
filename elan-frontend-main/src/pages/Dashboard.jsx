import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement } from 'chart.js'
import Sidebar from '../components/Sidebar'
import { getProductos } from '../services/productoService'

ChartJS.register(CategoryScale, LinearScale, BarElement)

function Dashboard() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarProductos()
  }, [])

  async function cargarProductos() {
    setCargando(true)
    const data = await getProductos()
    setProductos(data)
    setCargando(false)
  }

  const bajos = productos.filter(p => p.stock <= p.stockMin).length

  const ventas = [320000, 450000, 390000, 520000, 410000, 480000, 560000]
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul']

  const dataGrafico = {
    labels: meses,
    datasets: [{
      data: ventas,
      backgroundColor: '#1e8a5e',
      borderRadius: 6,
    }]
  }

  const statsStyle = {
    background: '#161b22', border: '1px solid #30363d',
    borderRadius: '12px', padding: '24px', flex: 1
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar active="Inicio" />
      <div style={{ marginLeft: '200px', padding: '32px', flex: 1 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '28px' }}>
          Dashboard
        </h1>

        {cargando ? (
          <div style={{ color: '#8b949e', textAlign: 'center', padding: '40px' }}>Cargando datos...</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={statsStyle}>
                <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: '8px' }}>Total Productos</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{productos.length}</div>
              </div>
              <div style={statsStyle}>
                <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: '8px' }}>Ventas del día</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e8a5e' }}>$450.000</div>
              </div>
              <div style={statsStyle}>
                <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: '8px' }}>Bajo inventario</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: bajos > 0 ? '#f85149' : '#1e8a5e' }}>
                  {bajos} productos
                </div>
              </div>
              <div style={statsStyle}>
                <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: '8px' }}>Predicción</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e8a5e' }}>Alta demanda</div>
              </div>
            </div>

            <div style={{
              background: '#161b22', border: '1px solid #30363d',
              borderRadius: '12px', padding: '24px'
            }}>
              <div style={{ color: '#8b949e', fontSize: '0.85rem', marginBottom: '16px' }}>
                Ventas del mes
              </div>
              <Bar data={dataGrafico} options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } },
                  y: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } }
                }
              }} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard