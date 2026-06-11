import { useState, useEffect, useCallback } from 'react'
import { getEstudiantes, createEstudiante, updateEstudiante, deleteEstudiante } from '../api/estudiantes'
import Modal from '../components/Modal'
import Confirm from '../components/Confirm'
import { useToast } from '../components/Toast'

const EMPTY = { documento:'', nombre:'', apellido:'', email:'', carrera:'', facultad:'' }

export default function Estudiantes() {
  const toast = useToast()
  const [data, setData]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [modal, setModal]       = useState(null)   
  const [form, setForm]         = useState(EMPTY)
  const [editId, setEditId]     = useState(null)
  const [confirm, setConfirm]   = useState(null)
  const [saving, setSaving]     = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    getEstudiantes().then(setData).catch(() => toast('Error al cargar estudiantes', 'error')).finally(() => setLoading(false))
  }, [toast])
 
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t) }, [load])

  const filtered = data.filter(e =>
    `${e.nombre} ${e.apellido} ${e.documento} ${e.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal('create') }
  const openEdit   = (e)  => { setForm({ documento:e.documento, nombre:e.nombre, apellido:e.apellido, email:e.email, carrera:e.carrera, facultad:e.facultad }); setEditId(e.id_estudiante); setModal('edit') }

  const handleSave = async () => {
    if (!form.documento || !form.nombre || !form.apellido || !form.email || !form.carrera || !form.facultad)
      return toast('Completá todos los campos', 'error')
    setSaving(true)
    try {
      if (modal === 'create') await createEstudiante(form)
      else await updateEstudiante(editId, form)
      toast(modal === 'create' ? 'Estudiante creado' : 'Estudiante actualizado')
      setModal(null); load()
    } catch(e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await deleteEstudiante(confirm)
      toast('Estudiante eliminado')
      setConfirm(null); load()
    } catch(e) { toast(e.message, 'error') }
  }

  const f = (field) => ({ value: form[field], onChange: e => setForm(p => ({...p, [field]: e.target.value})) })

  return (
    <div>
      <div className="page-header">
        <div><h1>Estudiantes</h1><p>{data.length} registrados</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nuevo estudiante</button>
      </div>

      <div className="card">
        <div className="toolbar">
          <input className="search-input" placeholder="Buscar por nombre, documento o email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? <div className="loading">Cargando...</div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Documento</th><th>Nombre</th><th>Email</th><th>Carrera</th><th>Facultad</th><th>Acciones</th>
              </tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty"><div className="empty-icon">👤</div><p>No hay estudiantes</p></div></td></tr>
                ) : filtered.map(e => (
                  <tr key={e.id_estudiante}>
                    <td>{e.documento}</td>
                    <td><strong>{e.apellido}</strong>, {e.nombre}</td>
                    <td>{e.email}</td>
                    <td>{e.carrera}</td>
                    <td>{e.facultad}</td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm(e.id_estudiante)}>Eliminar</button>
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
        <Modal title={modal === 'create' ? 'Nuevo estudiante' : 'Editar estudiante'} onClose={() => setModal(null)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </>}>
          <div className="form-row">
            <div className="form-group"><label>Documento</label><input {...f('documento')} /></div>
            <div className="form-group"><label>Email</label><input type="email" {...f('email')} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Nombre</label><input {...f('nombre')} /></div>
            <div className="form-group"><label>Apellido</label><input {...f('apellido')} /></div>
          </div>
          <div className="form-group"><label>Carrera</label><input {...f('carrera')} /></div>
          <div className="form-group"><label>Facultad</label><input {...f('facultad')} /></div>
        </Modal>
      )}

      {confirm && <Confirm message="¿Eliminar este estudiante? Esta acción no se puede deshacer." onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
    </div>
  )
}