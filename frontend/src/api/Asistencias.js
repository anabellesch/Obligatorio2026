import client from './client'

export const getAsistencias = (params = {}) => {
  const q = new URLSearchParams(params).toString()
  return client.get(`/asistencias/${q ? '?' + q : ''}`).then(r => r.data.data)
}
export const registrarAsistencias = (registros) =>
  client.post('/asistencias/', { registros }).then(r => r.data)
export const actualizarAsistencia = (id, presente) =>
  client.put(`/asistencias/${id}`, { presente }).then(r => r.data)