import { useState, useEffect } from 'react'
import { getActividades } from '../api/actividades'
import { getInscripciones } from '../api/inscripciones'
import { getAsistencias, registrarAsistencias } from '../api/asistencias'
import { useToast } from '../components/Toast'

export default function Asistencias() {
  const toast = useToast()
  const [actividades, setActs]     = useState([])
  const [actividadId, setActId]    = useState('')
  const [fecha, setFecha]          = useState(new Date().toISOString().split('T')[0])
  const [inscriptos, setInscr]     = useState([])
  const [asistencias, setAsist]    = useState({})   // { id_inscripcion: bool }
  const [loading, setLoading]      = useState(false)
  const [saving, setSaving]        = useState(false)

  useEffect(() => { getActividades().then(setActs) }, [])

  const cargarClase = async () => {
    if (!actividadId || !fecha) return toast('Seleccioná actividad y fecha', 'error')
    setLoading(true)
    try {
      const [insc, asis] = await Promise.all([
        getInscripciones({ id_actividad: actividadId, estado: 'confirmada' }),
        getAsistencias({ id_actividad: actividadId, fecha })
      ])
      setInscr(insc)
   
      const map = {}
      insc.forEach(i => { map[i.id_inscripcion] = false })
      asis.forEach(a => { map[a.id_inscripcion] = a.presente === 1 })
      setAsist(map)
    } catch(e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }

  const toggleAll = (val) => {
    const next = {}
    inscriptos.forEach(i => { next[i.id_inscripcion] = val })
    setAsist(next)
  }

  const handleGuardar = async () => {
    setSaving(true)
    try {
      const registros = inscriptos.map(i => ({
        id_inscripcion: i.id_inscripcion,
        fecha,
        presente: asistencias[i.id_inscripcion] ? 1 : 0
      }))
      const res = await registrarAsistencias(registros)
      toast(`${res.data?.registrados?.length || 0} asistencias guardadas`)
    } catch(e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const presentes = Object.values(asistencias).filter(Boolean).length

  return (
    <div>
      <div className="page-header">
        <div><h1>Registro de asistencias</h1><p>Pasá lista por actividad y fecha</p></div>
      </div>

      <div className="card" style={{marginBottom:20}}>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
          <div className="form-group" style={{marginBottom:0,minWidth:280}}>
            <label>Actividad</label>
            <select value={actividadId} onChange={e=>setActId(e.target.value)}>
              <option value="">Seleccionar actividad...</option>
              {actividades.map(a => <option key={a.id_actividad} value={a.id_actividad}>{a.nombre} — {a.dia}</option>)}
            </select>
          </div>
          <div className="form-group" style={{marginBottom:0}}>
            <label>Fecha</label>
            <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={{padding:'9px 12px',border:'1px solid var(--gray-200)',borderRadius:'var(--radius)',fontSize:14}} />
          </div>
          <button className="btn btn-primary" onClick={cargarClase} disabled={loading}>
            {loading ? 'Cargando...' : 'Cargar clase'}
          </button>
        </div>
      </div>

      {inscriptos.length > 0 && (
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div>
              <strong>{inscriptos.length} estudiantes confirmados</strong>
              <span style={{color:'var(--gray-600)',marginLeft:12,fontSize:13}}>{presentes} presentes · {inscriptos.length - presentes} ausentes</span>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-ghost btn-sm" onClick={() => toggleAll(true)}>Marcar todos</button>
              <button className="btn btn-ghost btn-sm" onClick={() => toggleAll(false)}>Desmarcar todos</button>
              <button className="btn btn-primary btn-sm" onClick={handleGuardar} disabled={saving}>{saving ? 'Guardando...' : 'Guardar asistencias'}</button>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead><tr><th>Estudiante</th><th>Documento</th><th>Carrera</th><th style={{textAlign:'center'}}>Presente</th></tr></thead>
              <tbody>
                {inscriptos.map(i => (
                  <tr key={i.id_inscripcion} style={{background: asistencias[i.id_inscripcion] ? 'var(--green-light)' : undefined}}>
                    <td><strong>{i.estudiante_apellido}</strong>, {i.estudiante_nombre}</td>
                    <td>{i.documento}</td>
                    <td style={{fontSize:13,color:'var(--gray-600)'}}>{i.carrera || '—'}</td>
                    <td style={{textAlign:'center'}}>
                      <input type="checkbox" checked={!!asistencias[i.id_inscripcion]}
                        onChange={e => setAsist(p => ({...p, [i.id_inscripcion]: e.target.checked}))}
                        style={{width:18,height:18,cursor:'pointer',accentColor:'var(--green)'}} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && actividadId && inscriptos.length === 0 && (
        <div className="card"><div className="empty"><div className="empty-icon">✅</div><p>No hay inscriptos confirmados en esta actividad</p></div></div>
      )}
    </div>
  )
}