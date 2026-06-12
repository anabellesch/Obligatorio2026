import client from './client'

export const getEspacios = () =>
  client.get('/espacios/').then(r => r.data.data)

export const getEspacio = (id) =>
  client.get(`/espacios/${id}`).then(r => r.data.data)

export const createEspacio = (data) =>
  client.post('/espacios/', data).then(r => r.data)

export const updateEspacio = (id, data) =>
  client.put(`/espacios/${id}`, data).then(r => r.data)

export const deleteEspacio = (id) =>
  client.delete(`/espacios/${id}`).then(r => r.data)