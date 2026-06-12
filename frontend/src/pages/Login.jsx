import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'
 
export default function Login() {
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
      setError('Completá usuario y contraseña.')
      return
    }
    setLoading(true)
    try {
      await login(form)
      navigate('/estudiantes', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Gestión de Actividades Deportivas</h1>
          <p className="login-subtitle">Sistema de Actividades Universitarias</p>
        </div>
 
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
      </div>
    </div>
  )
}