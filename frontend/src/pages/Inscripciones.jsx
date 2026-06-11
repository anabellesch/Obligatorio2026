import { useState, useEffect, useCallback } from 'react'
import { getInscripciones, inscribir, cancelarInscripcion } from '../api/inscripciones'
import { getEstudiantes } from '../api/estudiantes'
import { getActividades } from '../api/actividades'
import Modal from '../components/Modal'
import Confirm from '../components/Confirm'
import Badge from '../components/Badge'
import { useToast } from '../components/Toast'

export default function Inscripciones() {
  const toast = useToast()
  const [data, setData]         = useState([])
  const [estudiantes, setEsts]  = useState([])
  const [actividades, setActs]  = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState({ id_estudiante:'', id_actividad:'' })
  const [confirm, setConfirm]   = useState(null)
  const [saving, setSaving]     = useState(false)
  const [filtroEst, setFiltroEst] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([getInscripciones(), getEstudiantes(), getActividades('abierta')])
      .then(([ins, ests, acts]) => { setData(ins); setEsts(ests); setActs(acts) })
      .catch(() => toast('Error al cargar', 'error'))
      .finally(() => setLoading(false))
  }, [toast])
 useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t) }, [load])

  const filtered = data.filter(i =>
    !filtroEst || `${i.estudiante_nombre} ${i.estudiante_apellido}`.toLowerCase().includes(filtroEst.toLowerCase())
  )

  const handleInscribir = async () => {
    if (!form.id_estudiante || !form.id_actividad) return toast('Seleccioná estudiante y actividad', 'error')
    setSaving(true)
    try {
      const res = await inscribir(Number(form.id_estudiante), Number(form.id_actividad))
      toast(res.message)
      setModal(false); setForm({ id_estudiante:'', id_actividad:'' }); load()
    } catch(e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleCancelar = async () => {
    try { await cancelarInscripcion(confirm); toast('Inscripción cancelada'); setConfirm(null); load() }
    catch(e) { toast(e.message, 'error') }
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Inscripciones</h1><p>{data.length} registradas</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Nueva inscripción</button>
      </div>

      <div className="card">
        <div className="toolbar">
          <input className="search-input" placeholder="Buscar estudiante..." value={filtroEst} onChange={e=>setFiltroEst(e.target.value)} />
        </div>
        {loading ? <div className="loading">Cargando...</div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Estudiante</th><th>Actividad</th><th>Disciplina</th><th>Día / Horario</th><th>Estado</th><th>Fecha inscripción</th><th>Acciones</th>
              </tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty"><div className="empty-icon">📋</div><p>No hay inscripciones</p></div></td></tr>
                ) : filtered.map(i => (
                  <tr key={i.id_inscripcion}>
                    <td><strong>{i.estudiante_apellido}</strong>, {i.estudiante_nombre}<br/><small style={{color:'var(--gray-400)'}}>{i.documento}</small></td>
                    <td>{i.actividad_nombre}</td>
                    <td>{i.disciplina}</td>
                    <td>{i.dia} {i.horario?.slice(0,5)}</td>
                    <td><Badge value={i.estado} />{i.orden_espera && <small style={{color:'var(--gray-400)',marginLeft:4}}>#{i.orden_espera}</small>}</td>
                    <td>{new Date(i.fecha_inscripcion).toLocaleDateString('es-UY')}</td>
                    <td>
                      {i.estado !== 'cancelada' && (
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm(i.id_inscripcion)}>Cancelar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal title="Nueva inscripción" onClose={() => setModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleInscribir} disabled={saving}>{saving ? 'Inscribiendo...' : 'Inscribir'}</button>
          </>}>
          <div className="form-group"><label>Estudiante</label>
            <select value={form.id_estudiante} onChange={e=>setForm(p=>({...p,id_estudiante:e.target.value}))}>
              <option value="">Seleccionar estudiante...</option>
              {estudiantes.map(e => <option key={e.id_estudiante} value={e.id_estudiante}>{e.apellido}, {e.nombre} — {e.documento}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Actividad (solo abiertas)</label>
            <select value={form.id_actividad} onChange={e=>setForm(p=>({...p,id_actividad:e.target.value}))}>
              <option value="">Seleccionar actividad...</option>
              {actividades.map(a => <option key={a.id_actividad} value={a.id_actividad}>{a.nombre} — {a.dia} {a.horario?.slice(0,5)}</option>)}
            </select>
          </div>
          <p style={{fontSize:13,color:'var(--gray-600)',marginTop:8}}>
            Si la actividad no tiene cupo disponible, la inscripción quedará en lista de espera automáticamente.
          </p>
        </Modal>
      )}

      {confirm && <Confirm message="¿Cancelar esta inscripción?" onConfirm={handleCancelar} onCancel={() => setConfirm(null)} />}
    </div>
  )
}