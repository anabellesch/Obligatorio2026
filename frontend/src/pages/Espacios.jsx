import { useState, useEffect, useCallback } from 'react'
import { getEspacios, createEspacio, updateEspacio, deleteEspacio } from '../api/espacios'
import Modal from '../components/Modal'
import Confirm from '../components/Confirm'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'

export default function Espacios() {
  const toast = useToast()
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null)
  const [form, setForm]       = useState({ nombre:'', ubicacion:'', capacidad:'' })
  const [editId, setEditId]   = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [saving, setSaving]   = useState(false)
  const { hasPermiso } = useAuth()
  const puedeModificar = hasPermiso('espacios', 'modificar')

  const load = useCallback(() => { setLoading(true); getEspacios().then(setData).finally(() => setLoading(false)) }, [])
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t) }, [load])

  const openCreate = () => { setForm({ nombre:'', ubicacion:'', capacidad:'' }); setEditId(null); setModal('open') }
  const openEdit   = (e)  => { setForm({ nombre:e.nombre, ubicacion:e.ubicacion||'', capacidad:e.capacidad||'' }); setEditId(e.id_espacio); setModal('open') }

  const handleSave = async () => {
    if (!form.nombre) return toast('El nombre es requerido', 'error')
    setSaving(true)
    try {
      if (!editId) await createEspacio(form)
      else await updateEspacio(editId, form)
      toast(editId ? 'Espacio actualizado' : 'Espacio creado')
      setModal(null); load()
    } catch(e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try { await deleteEspacio(confirm); toast('Espacio eliminado'); setConfirm(null); load() }
    catch(e) { toast(e.message, 'error') }
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Espacios deportivos</h1><p>{data.length} espacios</p></div>
        {puedeModificar && (
          <button className="btn btn-primary" onClick={openCreate}>+ Nuevo espacio</button>
        )}
      </div>
      <div className="card">
        {loading ? <div className="loading">Cargando...</div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Nombre</th><th>Ubicación</th><th>Capacidad</th><th>Acciones</th></tr></thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={4}><div className="empty"><div className="empty-icon">🏟️</div><p>No hay espacios</p></div></td></tr>
                ) : data.map(e => (
                  <tr key={e.id_espacio}>
                    <td><strong>{e.nombre}</strong></td>
                    <td>{e.ubicacion}</td>
                    <td>{e.capacidad ? `${e.capacidad} personas` : '—'}</td>
                    <td><div style={{display:'flex',gap:6}}>
                      {puedeModificar && (
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)}>Editar</button>
                      )}
                      {puedeModificar && (
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm(e.id_espacio)}>Eliminar</button>
                      )}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal && (
        <Modal title={editId ? 'Editar espacio' : 'Nuevo espacio'} onClose={() => setModal(null)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </>}>
          <div className="form-group"><label>Nombre</label><input value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))} /></div>
          <div className="form-group"><label>Ubicación</label><input value={form.ubicacion} onChange={e=>setForm(p=>({...p,ubicacion:e.target.value}))} /></div>
          <div className="form-group"><label>Capacidad</label><input type="number" value={form.capacidad} onChange={e=>setForm(p=>({...p,capacidad:e.target.value}))} /></div>
        </Modal>
      )}
      {confirm && <Confirm message="¿Eliminar este espacio?" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
    </div>
  )
}