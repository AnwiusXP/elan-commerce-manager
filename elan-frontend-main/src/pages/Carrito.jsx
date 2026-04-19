import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Carrito() {
  const [carrito, setCarrito] = useState([])

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem('carrito')) || []
    setCarrito(c)
  }, [])

  const total = carrito.reduce((a, it) => a + it.precio * it.cantidad, 0)

  function eliminar(i) {
    const nuevo = carrito.filter((_, idx) => idx !== i)
    setCarrito(nuevo)
    localStorage.setItem('carrito', JSON.stringify(nuevo))
  }

  function finalizar() {
    if (carrito.length === 0) return
    alert('✅ ¡Compra finalizada! Gracias por tu pedido.')
    setCarrito([])
    localStorage.setItem('carrito', JSON.stringify([]))
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>

      {/* Navbar */}
      <div style={{ background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px' }}>
        <Link to="/" style={{ color: '#e6edf3', fontWeight: '700', fontSize: '1.1rem', textDecoration: 'none' }}>
          ← Élan Pure
        </Link>
      </div>

      <div style={{ padding: '40px 32px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0d1117', marginBottom: '28px' }}>
          Mi carrito
        </h1>

        {carrito.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#8b949e' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🛒</div>
            <div>Tu carrito está vacío.</div>
            <Link to="/" style={{ color: '#1e8a5e', textDecoration: 'none', marginTop: '12px', display: 'inline-block' }}>
              ← Ver productos
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
            <div>
              {carrito.map((it, i) => (
                <div key={i} style={{
                  background: '#fff', border: '1px solid #e1e4e8', borderRadius: '10px',
                  padding: '16px 20px', marginBottom: '12px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0d1117', marginBottom: '4px' }}>{it.nombre}</div>
                    <div style={{ color: '#8b949e', fontSize: '0.85rem' }}>Cantidad: {it.cantidad}</div>
                    <div style={{ color: '#1e8a5e', fontWeight: '700' }}>${it.precio.toLocaleString('es-CO')}</div>
                  </div>
                  <button onClick={() => eliminar(i)} style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: '1.1rem' }}>
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', border: '1px solid #e1e4e8', borderRadius: '12px', padding: '24px', height: 'fit-content' }}>
              <h6 style={{ fontWeight: '700', color: '#0d1117', marginBottom: '16px' }}>Resumen</h6>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '0.9rem', marginBottom: '8px' }}>
                <span>Subtotal</span><span>${total.toLocaleString('es-CO')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1e8a5e', fontSize: '1.1rem', fontWeight: '700', borderTop: '1px solid #e1e4e8', paddingTop: '12px' }}>
                <span>Total</span><span>${total.toLocaleString('es-CO')}</span>
              </div>
              <button onClick={finalizar} style={{
                background: '#1e8a5e', border: 'none', color: '#fff',
                borderRadius: '8px', padding: '12px', fontWeight: '600',
                width: '100%', marginTop: '16px', cursor: 'pointer', fontSize: '0.95rem'
              }}>
                Finalizar compra
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Carrito