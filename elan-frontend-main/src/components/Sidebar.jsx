import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../services/authService'

function Sidebar({ active }) {
  const navigate = useNavigate()

  async function cerrarSesion() {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{
      width: '200px', minHeight: '100vh', background: '#161b22',
      borderRight: '1px solid #30363d', position: 'fixed',
      display: 'flex', flexDirection: 'column', padding: '24px 0'
    }}>
      <div style={{
        color: '#e6edf3', fontWeight: '700', fontSize: '1.1rem',
        padding: '0 24px 24px', borderBottom: '1px solid #30363d'
      }}>
        ECM
      </div>

      <nav style={{ flex: 1, paddingTop: '16px' }}>
        {[
          { path: '/dashboard', label: 'Inicio' },
          { path: '/productos', label: 'Productos' },
          { path: '/ventas', label: 'Ventas' },
          { path: '/inventario', label: 'Inventario' },
          { path: '/reportes', label: 'Reportes' },
        ].map(item => (
          <Link key={item.path} to={item.path} style={{
            display: 'block', textDecoration: 'none',
            padding: '10px 24px', fontSize: '0.92rem',
            color: active === item.label ? '#1e8a5e' : '#8b949e',
            background: active === item.label ? 'rgba(30,138,94,0.08)' : 'transparent',
            borderLeft: active === item.label ? '3px solid #1e8a5e' : '3px solid transparent',
          }}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div style={{ padding: '16px 24px', borderTop: '1px solid #30363d' }}>
        <button onClick={cerrarSesion} style={{
          background: 'none', border: 'none', color: '#f85149',
          fontSize: '0.88rem', cursor: 'pointer'
        }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default Sidebar