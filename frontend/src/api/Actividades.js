import client from './client'

export const getActividades = (estado) => {
  const params = estado ? `?estado=${estado}` : ''
  return client.get(`/actividades/${params}`).then(r => r.data.data)
}
export const getActividad = (id) => client.get(`/actividades/${id}`).then(r => r.data.data)
export const createActividad = (data) => client.post('/actividades/', data).then(r => r.data)
export const updateActividad = (id, data) => client.put(`/actividades/${id}`, data).then(r => r.data)
export const cambiarEstado = (id, estado) => client.patch(`/actividades/${id}/estado`, { estado }).then(r => r.data)
export const deleteActividad = (id) => client.delete(`/actividades/${id}`).then(r => r.data)