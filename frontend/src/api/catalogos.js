import client from './client'

export async function getCarreras() {
  const res = await client.get('/catalogos/carreras')
  return res.data.data
}

export async function getFacultades() {
  const res = await client.get('/catalogos/facultades')
  return res.data.data
}