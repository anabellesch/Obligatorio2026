import { useState, useEffect } from 'react'
import { getActividades, createActividad, updateActividad, deleteActividad, cambiarEstado } from '../api/actividades'
import { getDisciplinas } from '../api/Disciplinas'
import { getEspacios } from '../api/espacios'
import Modal from '../components/Modal'
import Confirm from '../components/Confirm'
import Badge from '../components/Badge'
import { useToast } from '../components/Toast'

const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
const ESTADOS = ['abierta','cerrada','finalizada','cancelada']
const EMPTY = { nombre:'', id_disciplina:'', id_espacio:'', cupo_maximo:'', dia:'Lunes', horario:'08:00', estado:'abierta' }

export default function Actividades() {
  const toast = useToast()
  const [data, setData]           = useState([])
  const [disciplinas, setDis]     = useState([])
  const [espacios, setEsp]        = useState([])
  const [loading, setLoading]     = useState(true)
  const [filtroEstado, setFiltro] = useState('')
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [editId, setEditId]       = useState(null)
  const [confirm, setConfirm]     = useState(null)
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
  
    const load = async () => {
      setLoading(true)
      try {
        const [acts, dis, esp] = await Promise.all([getActividades(filtroEstado), getDisciplinas(), getEspacios()])
        setData(acts); setDis(dis); setEsp(esp)
      } catch (e) {
        toast('Error al cargar', 'error')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [filtroEstado, toast])

  const load = async () => {
    setLoading(true)
    try {
      const [acts, dis, esp] = await Promise.all([getActividades(filtroEstado), getDisciplinas(), getEspacios()])
      setData(acts); setDis(dis); setEsp(esp)
    } catch (e) {
      toast('Error al cargar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filtered = data.filter(a => a.nombre.toLowerCase().includes(search.toLowerCase()))

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal('open') }
  const openEdit   = (a) => {
    setForm({ nombre:a.nombre, id_disciplina:a.id_disciplina, id_espacio:a.id_espacio,
      cupo_maximo:a.cupo_maximo, dia:a.dia, horario:a.horario?.slice(0,5), estado:a.estado })
    setEditId(a.id_actividad); setModal('open')
  }

  const handleSave = async () => {
    if (!form.nombre || !form.id_disciplina || !form.id_espacio || !form.cupo_maximo)
      return toast('Completá todos los campos obligatorios', 'error')
    setSaving(true)
    try {
      if (!editId) await createActividad(form)
      else await updateActividad(editId, form)
      toast(editId ? 'Actividad actualizada' : 'Actividad creada')
      setModal(null); load()
    } catch(e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleEstado = async (id, estado) => {
    try { await cambiarEstado(id, estado); toast(`Estado cambiado a ${estado}`); load() }
    catch(e) { toast(e.message, 'error') }
  }

  const handleDelete = async () => {
    try { await deleteActividad(confirm); toast('Actividad eliminada'); setConfirm(null); load() }
    catch(e) { toast(e.message, 'error') }
  }

  const f = (field) => ({ value: form[field], onChange: e => setForm(p=>({...p,[field]:e.target.value})) })

  return (
    <div>
      <div className="page-header">
        <div><h1>Actividades deportivas</h1><p>{data.length} actividades</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nueva actividad</button>
      </div>

      <div className="card">
        <div className="toolbar">
          <input className="search-input" placeholder="Buscar actividad..." value={search} onChange={e=>setSearch(e.target.value)} />
          <select style={{padding:'8px 12px',borderRadius:'var(--radius)',border:'1px solid var(--gray-200)',fontSize:14}} value={filtroEstado} onChange={e=>setFiltro(e.target.value)}>
            <option value="">Todos los estados</option>
            {ESTADOS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
        {loading ? <div className="loading">Cargando...</div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Nombre</th><th>Disciplina</th><th>Espacio</th><th>Día / Horario</th><th>Cupo</th><th>Estado</th><th>Acciones</th>
              </tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty"><div className="empty-icon">⚽</div><p>No hay actividades</p></div></td></tr>
                ) : filtered.map(a => (
                  <tr key={a.id_actividad}>
                    <td><strong>{a.nombre}</strong></td>
                    <td>{a.disciplina}</td>
                    <td>{a.espacio}</td>
                    <td>{a.dia} {a.horario?.slice(0,5)}</td>
                    <td>{a.cupo_maximo}</td>
                    <td><Badge value={a.estado} /></td>
                    <td>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}>Editar</button>
                        {a.estado === 'abierta' && <button className="btn btn-ghost btn-sm" onClick={() => handleEstado(a.id_actividad,'cerrada')}>Cerrar</button>}
                        {a.estado === 'cerrada' && <button className="btn btn-ghost btn-sm" onClick={() => handleEstado(a.id_actividad,'abierta')}>Abrir</button>}
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm(a.id_actividad)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={editId ? 'Editar actividad' : 'Nueva actividad'} onClose={() => setModal(null)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </>}>
          <div className="form-group"><label>Nombre *</label><input {...f('nombre')} /></div>
          <div className="form-row">
            <div className="form-group"><label>Disciplina *</label>
              <select {...f('id_disciplina')}>
                <option value="">Seleccionar...</option>
                {disciplinas.map(d => <option key={d.id_disciplina} value={d.id_disciplina}>{d.nombre}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Espacio *</label>
              <select {...f('id_espacio')}>
                <option value="">Seleccionar...</option>
                {espacios.map(e => <option key={e.id_espacio} value={e.id_espacio}>{e.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Día</label>
              <select {...f('dia')}>{DIAS.map(d => <option key={d}>{d}</option>)}</select>
            </div>
            <div className="form-group"><label>Horario</label><input type="time" {...f('horario')} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Cupo máximo *</label><input type="number" min="1" {...f('cupo_maximo')} /></div>
            <div className="form-group"><label>Estado</label>
              <select {...f('estado')}>{ESTADOS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</select>
            </div>
          </div>
        </Modal>
      )}

      {confirm && <Confirm message="¿Eliminar esta actividad?" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
    </div>
  )
}