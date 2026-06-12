import { NavLink } from 'react-router-dom'

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

export default function Sidebar() {
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

        {onLogout && (
        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user">
              <span className="sidebar-user-name">{user.username}</span>
              <span className="sidebar-user-rol">{user.rol}</span>
            </div>
          )}
          <button className="sidebar-logout-btn" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      )}
      </nav>
    </aside>
  )
}