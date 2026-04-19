import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { getProductos } from '../services/productoService'

function Inventario() {
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // La autenticación ya se verifica en PrivateRoute
    cargarProductos()
  }, [])

  async function cargarProductos() {
    try {
      const data = await getProductos()
      setProductos(data)
    } catch (error) {
      console.error('Error cargando productos:', error)
      // Fallback a datos mock si hay error
      setProductos([
        { nombre: 'Desengrasante', categoria: 'cuidado hogar', precio: 35000, stock: 12, stockMin: 10 },
        { nombre: 'Detergente ropa', categoria: 'cuidado hogar', precio: 52000, stock: 48, stockMin: 10 },
        { nombre: 'Varsol', categoria: 'cuidado hogar', precio: 28000, stock: 35, stockMin: 10 },
      ])
    }
    setCargando(false)
  }

  const bajos = productos.filter(p => p.stock <= p.stockMin).length

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar active="Inventario" />
      <div style={{ marginLeft: '200px', padding: '32px', flex: 1 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>
          Inventario
        </h1>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>
            Cargando inventario...
          </div>
        ) : (
          <>
            {bajos > 0 && (
              <div style={{
                background: 'rgba(210,153,34,0.1)', border: '1px solid rgba(210,153,34,0.4)',
                color: '#d29922', borderRadius: '10px', padding: '12px 20px',
                marginBottom: '24px', fontSize: '0.9rem'
              }}>
                ⚠ {bajos} producto(s) con bajo inventario
              </div>
            )}

            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#21262d' }}>
                  <tr>
                    {['Producto', 'Categoría', 'Stock actual', 'Stock mínimo', 'Estado'].map(h => (
                      <th key={h} style={{ color: '#8b949e', fontSize: '0.82rem', padding: '12px 20px', textAlign: 'left', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p, i) => {
                    const bajo = p.stock <= p.stockMin
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #21262d' }}>
                        <td style={{ padding: '14px 20px' }}>{p.nombre}</td>
                        <td style={{ padding: '14px 20px', color: '#8b949e' }}>{p.categoria}</td>
                        <td style={{ padding: '14px 20px' }}>{p.stock}</td>
                        <td style={{ padding: '14px 20px' }}>{p.stockMin}</td>
                        <td style={{ padding: '14px 20px' }}>
                          {bajo
                            ? <span style={{ background: 'rgba(248,81,73,0.1)', color: '#f85149', borderRadius: '20px', padding: '3px 12px', fontSize: '0.8rem' }}>⚠ Bajo</span>
                            : <span style={{ background: 'rgba(30,138,94,0.15)', color: '#1e8a5e', borderRadius: '20px', padding: '3px 12px', fontSize: '0.8rem' }}>✅ Normal</span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Inventario