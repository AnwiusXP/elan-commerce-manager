import api from './api'

export const getVentas = async () => {
  const res = await api.get('/ventas')
  return res.data
}

export const registrarVenta = async (items) => {
  const res = await api.post('/ventas', { items })
  return { ok: true, venta: res.data }
}
