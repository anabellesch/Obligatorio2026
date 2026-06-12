import client from './client'

export const getEstudiantes = () => client.get('/estudiantes/').then(r => r.data.data)
export const getEstudiante = (id) => client.get(`/estudiantes/${id}`).then(r => r.data.data)
export const createEstudiante = (data) => client.post('/estudiantes/', data).then(r => r.data)
export const updateEstudiante = (id, data) => client.put(`/estudiantes/${id}`, data).then(r => r.data)
export const deleteEstudiante = (id) => client.delete(`/estudiantes/${id}`).then(r => r.data)
export const getInscripcionesEstudiante = (id) => client.get(`/estudiantes/${id}/inscripciones`).then(r => r.data.data)