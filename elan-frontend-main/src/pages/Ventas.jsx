import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { getProductos } from '../services/productoService'
import { registrarVenta } from '../services/ventaService'

function Ventas() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [selIndex, setSelIndex] = useState(0)
  const [cantidad, setCantidad] = useState(1)
  const [items, setItems] = useState([])
  const [alerta, setAlerta] = useState(false)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    cargarProductos()
  }, [])

  async function cargarProductos() {
    setCargando(true)
    const data = await getProductos()
    setProductos(data)
    setCargando(false)
  }

  const total = items.reduce((a, it) => a + it.precio * it.cantidad, 0)

  function agregarItem() {
    const p = productos[selIndex]
    if (cantidad > p.stock) { setAlerta(true); return }
    setAlerta(false)
    const existente = items.find(it => it.nombre === p.nombre)
    if (existente) {
      setItems(items.map(it => it.nombre === p.nombre ? { ...it, cantidad: it.cantidad + cantidad } : it))
    } else {
      setItems([...items, { nombre: p.nombre, precio: p.precio, cantidad }])
    }
  }

  function eliminarItem(i) {
    setItems(items.filter((_, idx) => idx !== i))
  }

  async function generarFactura() {
    if (items.length === 0) { alert('Agrega al menos un producto'); return }
    const res = await registrarVenta(items)
    if (res.ok) {
      setExito(true)
      setItems([])
      setTimeout(() => setExito(false), 3000)
    }
  }

  const inputStyle = {
    width: '100%', background: '#0d1117', border: '1px solid #30363d',
    color: '#e6edf3', borderRadius: '8px', padding: '10px 14px',
    fontSize: '0.9rem', outline: 'none', marginTop: '6px', boxSizing: 'border-box'
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar active="Ventas" />
      <div style={{ marginLeft: '200px', padding: '32px', flex: 1 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '28px' }}>
          Registro de Ventas
        </h1>

        {cargando ? (
          <div style={{ color: '#8b949e', textAlign: 'center', padding: '40px' }}>Cargando productos...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '28px' }}>

              {exito && (
                <div style={{ background: 'rgba(30,138,94,0.1)', border: '1px solid #1e8a5e', color: '#1e8a5e', borderRadius: '8px', padding: '10px 14px', fontSize: '0.88rem', marginBottom: '16px' }}>
                  ✅ Factura generada correctamente.
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#c9d1d9', fontSize: '0.88rem' }}>Producto</label>
                <select value={selIndex} onChange={e => setSelIndex(parseInt(e.target.value))} style={inputStyle}>
                  {productos.map((p, i) => (
                    <option key={p.id} value={i}>{p.nombre} — ${p.precio.toLocaleString('es-CO')}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#c9d1d9', fontSize: '0.88rem' }}>Cantidad</label>
                <input type="number" min="1" value={cantidad} onChange={e => setCantidad(parseInt(e.target.value))} style={inputStyle} />
              </div>

              <button onClick={agregarItem} style={{ background: '#1e8a5e', border: 'none', color: '#fff', borderRadius: '8px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>
                + Agregar producto
              </button>

              {alerta && (
                <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.4)', color: '#f85149', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', marginTop: '12px' }}>
                  Stock insuficiente para este producto.
                </div>
              )}

              <div style={{ marginTop: '20px' }}>
                {items.map((it, i) => (
                  <div key={i} style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '10px 14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{it.nombre}</div>
                      <div style={{ color: '#8b949e', fontSize: '0.85rem' }}>Cant: {it.cantidad} × ${it.precio.toLocaleString('es-CO')}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: '#1e8a5e', fontWeight: '600' }}>${(it.precio * it.cantidad).toLocaleString('es-CO')}</span>
                      <button onClick={() => eliminarItem(i)} style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer' }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '24px', height: 'fit-content' }}>
              <div style={{ color: '#8b949e', fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '16px' }}>Resumen</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b949e', fontSize: '0.9rem', marginBottom: '8px' }}>
                <span>Subtotal</span><span>${total.toLocaleString('es-CO')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1e8a5e', fontSize: '1.1rem', fontWeight: '700', borderTop: '1px solid #30363d', paddingTop: '12px' }}>
                <span>Total</span><span>${total.toLocaleString('es-CO')}</span>
              </div>
              <button onClick={generarFactura} style={{ background: '#1e8a5e', border: 'none', color: '#fff', borderRadius: '8px', padding: '12px', fontWeight: '600', width: '100%', marginTop: '16px', cursor: 'pointer' }}>
                Generar factura
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Ventas