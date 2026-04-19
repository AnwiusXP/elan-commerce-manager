import api from './api'

export const login = async (usuario, contrasena) => {
  try {
    const res = await api.post('/login', { usuario, contrasena })
    localStorage.setItem('token', res.data.token)
    return { ok: true }
  } catch (error) {
    return { ok: false, mensaje: error?.response?.data?.message || 'Usuario o contraseña incorrectos.' }
  }
}

export const logout = async () => {
  try {
    await api.post('/logout')
  } catch (error) {
    // Ignorar error de logout, pero eliminar el token local.
  }
  localStorage.removeItem('token')
}

export const estaAutenticado = () => {
  return !!localStorage.getItem('token')
}
