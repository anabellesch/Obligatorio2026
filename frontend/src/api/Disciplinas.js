import client from './client'

export const getDisciplinas = () =>
  client.get('/disciplinas/').then(r => r.data.data)

export const getDisciplina = (id) =>
  client.get(`/disciplinas/${id}`).then(r => r.data.data)

export const createDisciplina = (data) =>
  client.post('/disciplinas/', data).then(r => r.data)

export const updateDisciplina = (id, data) =>
  client.put(`/disciplinas/${id}`, data).then(r => r.data)

export const deleteDisciplina = (id) =>
  client.delete(`/disciplinas/${id}`).then(r => r.data)