import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register } from '../api/Auth'
import './Login.css'


function FormLogin({onSuccess}) {

  const { login } = useAuth()
  const navigate   = useNavigate()
 
  const [form, setForm]       = useState({ username: '', password: '' })
  const [errorMsg, setError]  = useState('')
  const [loading, setLoading] = useState(false)
 
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }
 
  async function handleSubmit(e) {

  e.preventDefault()
  if (!form.username || !form.password) {
    setError('Completa todos los campos')
    return
  }
  setLoading(true)
  try {
    await login(form)
    onSuccess()
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
  return (
 
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              autoFocus
              value={form.username}
              onChange={handleChange}
              placeholder="Ingresá tu usuario"
              disabled={loading}
            />
          </div>
 
          <div className="login-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Ingresá tu contraseña"
              disabled={loading}
            />
          </div>
 
          {errorMsg && (
            <div className="login-error" role="alert">
              {errorMsg}
            </div>
          )}
 
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
   
  )
}


function FormRegister({onSuccess}) {
  const [form, setForm]= useState({ username: '', password: '', confirmar: '', rol: 'estudiante', id_estudiante: '' })
  const [errorMsg, setError] = useState('')
  const [successMsg, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
    setSuccess('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.username || !form.password || !form.confirmar) {
      setError('Completa todos los campos')
      return
    }
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      const body = { username: form.username, password: form.password, rol: form.rol }
      if (form.rol === 'estudiante' && form.id_estudiante)
        body.id_estudiante=parseInt(form.id_estudiante)

      await register(body)
      setSuccess('Usuario registrado con éxito')
      setForm({ username: '', password: '', confirmar: '', rol: 'estudiante', id_estudiante: '' })
      onSuccess()
    } catch (err) {
      setError(err.message || 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="login-field">
        <label htmlFor="username">Usuario</label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoFocus
          value={form.username}
          onChange={handleChange}
          placeholder="Ingresa tu usuario"
          disabled={loading}
        />
      </div>
      <div className="login-field">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          placeholder="Ingresa tu contraseña"
          disabled={loading}
        />
      </div>
      <div className="login-field">
        <label htmlFor="confirmar">Confirmar Contraseña</label>
        <input
          id="confirmar"
          name="confirmar"
          type="password"
          autoComplete="current-password"
          value={form.confirmar}
          onChange={handleChange}
          placeholder="Confirma tu contraseña"
          disabled={loading}
        />
      </div>
      <div className="login-field">
        <label htmlFor="rol">Rol</label>
        <select id="rol" name="rol" value={form.rol} onChange={handleChange} disabled={loading}>
          <option value="estudiante">Estudiante</option>
          <option value="profesor">Profesor</option>
        </select>
      </div>
      {form.rol === 'estudiante' && (
        <div className="login-field">
          <label htmlFor="id_estudiante">id estudiante</label>
          <input
            id="id_estudiante"
            name="id_estudiante"
            type="number"
            value={form.id_estudiante}
            onChange={handleChange}
            placeholder="Ingresa tu id de estudiante para vincular tu cuenta"
            disabled={loading}
          />
        </div>
      )}
      {errorMsg && (
        <div className="login-error" role="alert">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="login-success" role="alert">
          {successMsg}
        </div>
      )}
      <button className="login-btn" type="submit" disabled={loading}>
        {loading ? 'Registrando…' : 'Registrar'}
      </button>
    </form>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')

  function goHome() {
    navigate('/', { replace: true })
  }
  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Gestión de Actividades Deportivas</h1>
          <p className="login-subtitle">Sistema de Actividades Universitarias</p>
        </div>
        <div className="login-tabs">
          <button className={'login-tab' + (tab === 'login' ? ' active' : '')} onClick={() => setTab('login')}>
            Iniciar sesión
          </button>
          <button className={'login-tab' + (tab === 'register' ? ' active' : '')} onClick={() => setTab('register')}>
            Registrarse
          </button>
        </div>
        <div className="login-content">
          {tab === 'login' ? <FormLogin onSuccess={goHome} /> : <FormRegister onSuccess={() => setTab('login')} />}
        </div>
      </div>
    </div>
  )
}