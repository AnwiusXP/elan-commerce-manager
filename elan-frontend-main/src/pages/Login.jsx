import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService'

function Login() {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState(false)
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  async function iniciarSesion() {
    if (!usuario || !contrasena) { setError(true); return }
    setCargando(true)
    const res = await login(usuario, contrasena)
    setCargando(false)
    if (res.ok) {
      navigate('/dashboard')
    } else {
      setError(true)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0d1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#161b22', border: '1px solid #30363d',
        borderRadius: '16px', padding: '48px 40px', width: '100%', maxWidth: '420px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: '#e6edf3', fontSize: '1.4rem', fontWeight: '700' }}>
            Élan Pure
          </h1>
          <p style={{ color: '#8b949e', fontSize: '0.9rem', marginTop: '4px' }}>
            Elan Commerce Manager
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.4)',
            color: '#f85149', borderRadius: '8px', padding: '10px 14px',
            fontSize: '0.88rem', marginBottom: '16px'
          }}>
            Usuario o contraseña incorrectos.
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#c9d1d9', fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>
            Usuario
          </label>
          <input
            type="text"
            value={usuario}
            onChange={e => { setUsuario(e.target.value); setError(false) }}
            placeholder="Ingresa tu usuario"
            style={{
              width: '100%', background: '#0d1117', border: '1px solid #30363d',
              color: '#e6edf3', borderRadius: '8px', padding: '10px 14px',
              fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#c9d1d9', fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>
            Contraseña
          </label>
          <input
            type="password"
            value={contrasena}
            onChange={e => { setContrasena(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && iniciarSesion()}
            placeholder="Ingresa tu contraseña"
            style={{
              width: '100%', background: '#0d1117', border: '1px solid #30363d',
              color: '#e6edf3', borderRadius: '8px', padding: '10px 14px',
              fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={iniciarSesion}
          disabled={cargando}
          style={{
            width: '100%', background: cargando ? '#145c3f' : '#1e8a5e', border: 'none',
            color: '#fff', borderRadius: '8px', padding: '11px',
            fontSize: '0.95rem', fontWeight: '600', cursor: cargando ? 'not-allowed' : 'pointer',
            marginTop: '8px'
          }}
        >
          {cargando ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <a href="/" style={{ color: '#8b949e', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Ver tienda como comprador
          </a>
        </div>
      </div>
    </div>
  )
}

export default Login