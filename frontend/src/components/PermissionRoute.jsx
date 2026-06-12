import { useAuth } from '../context/AuthContext'

export default function PermissionRoute({ seccion, children }) {            // tengo entendido que envuelve la ruta y la bloquea si no tiene permiso
  const { hasPermiso } = useAuth()
 
  if (!hasPermiso(seccion, 'ver')) {
    return (
      <div className="card">
        <div className="empty">
          <p>No tenes permisos para acceder a esta sección</p>
        </div>
      </div>
    )
  }
 
  return children
}