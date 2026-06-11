import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import Sidebar from './components/Sidebar'
import Estudiantes   from './pages/Estudiantes'
import Disciplinas   from './pages/Disciplinas'
import Espacios      from './pages/Espacios'
import Actividades   from './pages/Actividades'
import Inscripciones from './pages/Inscripciones'
import Asistencias   from './pages/Asistencias'
import Reportes      from './pages/Reportes'
import './styles/global.css'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/"               element={<Navigate to="/estudiantes" replace />} />
              <Route path="/estudiantes"    element={<Estudiantes />} />
              <Route path="/disciplinas"    element={<Disciplinas />} />
              <Route path="/espacios"       element={<Espacios />} />
              <Route path="/actividades"    element={<Actividades />} />
              <Route path="/inscripciones"  element={<Inscripciones />} />
              <Route path="/asistencias"    element={<Asistencias />} />
              <Route path="/reportes"       element={<Reportes />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}