import { NavLink } from 'react-router-dom'

const links = [
  { section: 'Gestión' },
  { to: '/estudiantes',   icon: '👤', label: 'Estudiantes' },
  { to: '/actividades',   icon: '⚽', label: 'Actividades' },
  { to: '/inscripciones', icon: '📋', label: 'Inscripciones' },
  { to: '/asistencias',   icon: '✅', label: 'Asistencias' },
  { section: 'Configuración' },
  { to: '/disciplinas',   icon: '🏅', label: 'Disciplinas' },
  { to: '/espacios',      icon: '🏟️', label: 'Espacios' },
  { section: 'Análisis' },
  { to: '/reportes',      icon: '📊', label: 'Reportes' },
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
              <span className="icon">{l.icon}</span>
              {l.label}
            </NavLink>
          )
        )}
      </nav>
    </aside>
  )
}