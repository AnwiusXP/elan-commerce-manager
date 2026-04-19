import api from './api'

export const getProductos = async () => {
  const res = await api.get('/productos')
  return res.data
}

export const crearProducto = async (producto) => {
  const res = await api.post('/productos', producto)
  return res.data
}

export const editarProducto = async (id, producto) => {
  const res = await api.put(`/productos/${id}`, producto)
  return res.data
}

export const eliminarProducto = async (id) => {
  await api.delete(`/productos/${id}`)
  return { ok: true }
}
