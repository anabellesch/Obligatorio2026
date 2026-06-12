import client from './client'

export const getInscripciones = (params = {}) => {
  const q = new URLSearchParams(params).toString()
  return client.get(`/inscripciones/${q ? '?' + q : ''}`).then(r => r.data.data)
}
export const inscribir = (id_estudiante, id_actividad) =>
  client.post('/inscripciones/', { id_estudiante, id_actividad }).then(r => r.data)
export const cancelarInscripcion = (id) => client.delete(`/inscripciones/${id}`).then(r => r.data)