const map = {
  abierta:   'badge-green',
  cerrada:   'badge-yellow',
  finalizada:'badge-gray',
  cancelada: 'badge-red',
  confirmada:'badge-green',
  en_espera: 'badge-yellow',
  cancelada2:'badge-red',
}

const labels = {
  abierta:   'Abierta',
  cerrada:   'Cerrada',
  finalizada:'Finalizada',
  cancelada: 'Cancelada',
  confirmada:'Confirmada',
  en_espera: 'En espera',
}

export default function Badge({ value }) {
  const cls = map[value] || 'badge-gray'
  return <span className={`badge ${cls}`}>{labels[value] || value}</span>
}