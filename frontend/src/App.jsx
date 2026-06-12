import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider }   from './components/Toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute      from './components/ProtectedRoute'
import Sidebar             from './components/Sidebar'
import Login               from './pages/Login'
import Estudiantes         from './pages/Estudiantes'
import Disciplinas         from './pages/Disciplinas'
import Espacios            from './pages/Espacios'
import Actividades         from './pages/Actividades'
import Inscripciones       from './pages/Inscripciones'
import Asistencias         from './pages/Asistencias'
import Reportes            from './pages/Reportes'
import './styles/global.css'
import PermissionRoute  from './components/PermissionRoute'

const SECTIONS_ORDER = [
  'estudiantes', 'actividades', 'inscripciones', 'asistencias',
  'disciplinas', 'espacios', 'reportes',
]
 
function getDefaultRoute(hasPermiso) {
  const found = SECTIONS_ORDER.find(s => hasPermiso(s, 'ver'))
  return found ? `/${found}` : '/sin-acceso'
}


function AppLayout() {
  const { logout, user, hasPermiso } = useAuth()
  return (
    <div className="layout">
      <Sidebar onLogout={logout} user={user} />
      <main className="main-content">
        <Routes>
          <Route index element={<Navigate to={getDefaultRoute(hasPermiso)} replace />} />
 
          <Route path="/estudiantes"   element={<PermissionRoute seccion="estudiantes"><Estudiantes /></PermissionRoute>} />
          <Route path="/disciplinas"   element={<PermissionRoute seccion="disciplinas"><Disciplinas /></PermissionRoute>} />
          <Route path="/espacios"      element={<PermissionRoute seccion="espacios"><Espacios /></PermissionRoute>} />
          <Route path="/actividades"   element={<PermissionRoute seccion="actividades"><Actividades /></PermissionRoute>} />
          <Route path="/inscripciones" element={<PermissionRoute seccion="inscripciones"><Inscripciones /></PermissionRoute>} />
          <Route path="/asistencias"   element={<PermissionRoute seccion="asistencias"><Asistencias /></PermissionRoute>} />
          <Route path="/reportes"      element={<PermissionRoute seccion="reportes"><Reportes /></PermissionRoute>} />

          <Route path="/sin-acceso" element={
            <div className="card">
              <div className="empty">
                <p>No tenés acceso a ninguna sección. Contactá al administrador.</p>
              </div>
            </div>
          } />
        </Routes>
      </main>
    </div>
  )
}
 
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>

            <Routes>
              <Route path="/login" element={<Login />} />

                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                    <AppLayout />
                    </ProtectedRoute>
                  }
                />

                  <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}