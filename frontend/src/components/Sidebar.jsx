import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
const links = [
  { section: 'Gestión' },
  { to: '/estudiantes',  label: 'Estudiantes' },
  { to: '/actividades',    label: 'Actividades' },
  { to: '/inscripciones',  label: 'Inscripciones' },
  { to: '/asistencias',    label: 'Asistencias' },
  { section: 'Configuración' },
  { to: '/disciplinas',    label: 'Disciplinas' },
  { to: '/espacios',     label: 'Espacios' },
  { section: 'Análisis' },
  { to: '/reportes',   label: 'Reportes' },
]

function getVisibleLinks(links, hasPermiso) {
  const visible = links.filter(l => l.section || hasPermiso(l.seccion, 'ver'))
 
  return visible.filter((l, i) => {
    if (!l.section) return true
    const next = visible[i + 1]

    return next && !next.section
  }
  )
}
export default function Sidebar() {

  const { user, logout, hasPermiso } = useAuth()
  const navigate = useNavigate()
  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const visibleLinks = getVisibleLinks(links, hasPermiso)

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Actividades Deportivas</h2>
        <span>Panel de administración</span>
      </div>
      <nav className="sidebar-nav">
        {links.map((l, i) =>
          l.section ? (
            <div key={i} className="nav-section">{l.section}</div>
          ) : (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {l.label}
            </NavLink>
          )
        )}

        {user && (
        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user">
              <span className="sidebar-user-name">{user.username}</span>
              <span className="sidebar-user-rol">{user.rol}</span>
            </div>
          )}
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      )}
      </nav>
    </aside>
  )
}