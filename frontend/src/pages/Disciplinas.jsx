import { useState, useEffect, useCallback } from 'react'
import { getDisciplinas, createDisciplina, updateDisciplina, deleteDisciplina } from '../api/Disciplinas'
import Modal from '../components/Modal'
import Confirm from '../components/Confirm'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'

export default function Disciplinas() {
  const toast = useToast()
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null)
  const [form, setForm]       = useState({ nombre:'', descripcion:'' })
  const [editId, setEditId]   = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [saving, setSaving]   = useState(false)
  const { hasPermiso } = useAuth()
  const puedeModificar = hasPermiso('disciplinas', 'modificar')
  const load = useCallback(() => { setLoading(true); getDisciplinas().then(setData).finally(() => setLoading(false)) }, [])
   useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t) }, [load])
  const openCreate = () => { setForm({ nombre:'', descripcion:'' }); setEditId(null); setModal('open') }
  const openEdit   = (d)  => { setForm({ nombre:d.nombre, descripcion:d.descripcion||'' }); setEditId(d.id_disciplina); setModal('open') }

  const handleSave = async () => {
    if (!form.nombre) return toast('El nombre es requerido', 'error')
    setSaving(true)
    try {
      if (!editId) await createDisciplina(form)
      else await updateDisciplina(editId, form)
      toast(editId ? 'Disciplina actualizada' : 'Disciplina creada')
      setModal(null); load()
    } catch(e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try { await deleteDisciplina(confirm); toast('Disciplina eliminada'); setConfirm(null); load() }
    catch(e) { toast(e.message, 'error') }
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Disciplinas</h1><p>{data.length} disciplinas</p></div>
        {puedeModificar && (
          <button className="btn btn-primary" onClick={openCreate}>+ Nueva disciplina</button>
        )}
      </div>
      <div className="card">
        {loading ? <div className="loading">Cargando...</div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr></thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={4}><div className="empty"><div className="empty-icon">🏅</div><p>No hay disciplinas</p></div></td></tr>
                ) : data.map((d,i) => (
                  <tr key={d.id_disciplina}>
                    <td style={{color:'var(--gray-400)'}}>{i+1}</td>
                    <td><strong>{d.nombre}</strong></td>
                    <td>{d.descripcion}</td>
                    <td><div style={{display:'flex',gap:6}}>
                      {puedeModificar && (
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)}>Editar</button>
                      )}
                      {puedeModificar && (
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm(d.id_disciplina)}>Eliminar</button>
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
        <Modal title={editId ? 'Editar disciplina' : 'Nueva disciplina'} onClose={() => setModal(null)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </>}>
          <div className="form-group"><label>Nombre</label><input value={form.nombre} onChange={e => setForm(p=>({...p,nombre:e.target.value}))} /></div>
          <div className="form-group"><label>Descripción</label><input value={form.descripcion} onChange={e => setForm(p=>({...p,descripcion:e.target.value}))} /></div>
        </Modal>
      )}
      {confirm && <Confirm message="¿Eliminar esta disciplina?" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
    </div>
  )
}