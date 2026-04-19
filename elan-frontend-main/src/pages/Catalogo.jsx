import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Catalogo() {
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito] = useState([])

  useEffect(() => {
    const p = JSON.parse(localStorage.getItem('productos')) || [
      { nombre: 'Limpiavidrios', categoria: 'cuidado hogar', precio: 35000, stock: 48, stockMin: 10 },
      { nombre: 'Gel antibacterial', categoria: 'cuidado personal', precio: 52000, stock: 20, stockMin: 10 },
      { nombre: 'Lava loza', categoria: 'cuidado facial', precio: 28000, stock: 35, stockMin: 10 },
    ]
    setProductos(p)
    const c = JSON.parse(localStorage.getItem('carrito')) || []
    setCarrito(c)
  }, [])

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalCarrito = carrito.reduce((a, it) => a + it.cantidad, 0)

  function agregarAlCarrito(p) {
    const existe = carrito.find(it => it.nombre === p.nombre)
    let nuevo
    if (existe) {
      nuevo = carrito.map(it => it.nombre === p.nombre ? { ...it, cantidad: it.cantidad + 1 } : it)
    } else {
      nuevo = [...carrito, { nombre: p.nombre, precio: p.precio, cantidad: 1 }]
    }
    setCarrito(nuevo)
    localStorage.setItem('carrito', JSON.stringify(nuevo))
    alert(`✅ "${p.nombre}" agregado al carrito.`)
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* Navbar */}
      <div style={{
        background: '#0d1117', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '14px 32px',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ color: '#e6edf3', fontWeight: '700', fontSize: '1.1rem' }}>Élan Pure</div>
        <input
          type="text"
          placeholder="🔍 Buscar productos..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{
            background: '#161b22', border: '1px solid #30363d', color: '#e6edf3',
            borderRadius: '20px', padding: '7px 16px', fontSize: '0.9rem', width: '260px', outline: 'none'
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/carrito" style={{
            color: '#e6edf3', textDecoration: 'none', fontSize: '0.9rem',
            background: 'rgba(255,255,255,0.08)', borderRadius: '20px', padding: '7px 16px'
          }}>
            🛒 Carrito ({totalCarrito})
          </Link>
          <Link to="/login" style={{
            color: '#8b949e', textDecoration: 'none', fontSize: '0.85rem',
            border: '1px solid #30363d', borderRadius: '20px', padding: '7px 16px'
          }}>
            🔐 Admin
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: '#0d1117', color: '#e6edf3', textAlign: 'center', padding: '56px 32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>Bienvenido a Elan Pure</h2>
        <p style={{ color: '#8b949e', marginBottom: '24px' }}>Descubre nuestra línea de productos de skincare</p>
        <a href="#productos" style={{
          background: '#1e8a5e', color: '#fff', borderRadius: '8px',
          padding: '12px 28px', fontWeight: '600', textDecoration: 'none'
        }}>
          Ver productos
        </a>
      </div>

      {/* Productos */}
      <div style={{ padding: '40px 32px' }} id="productos">
        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0d1117', marginBottom: '28px' }}>
          Nuestros productos
        </h3>

        {filtrados.length === 0 ? (
          <div style={{ color: '#8b949e', textAlign: 'center', padding: '40px' }}>
            No se encontraron productos.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {filtrados.map((p, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid #e1e4e8', borderRadius: '12px',
                padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#0d1117', marginBottom: '4px' }}>{p.nombre}</div>
                  <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: '12px' }}>{p.categoria}</div>
                  <div style={{ color: '#1e8a5e', fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>
                    ${p.precio.toLocaleString('es-CO')}
                  </div>
                </div>
                <button onClick={() => agregarAlCarrito(p)} style={{
                  background: '#1e8a5e', color: '#fff', border: 'none',
                  borderRadius: '8px', padding: '9px 16px', fontWeight: '600', cursor: 'pointer'
                }}>
                  Agregar al carrito
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Catalogo