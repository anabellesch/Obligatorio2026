import { createContext, useContext, useState } from 'react'
import client from '../api/client'
 
const AuthContext = createContext(null)
 


function loadFromStorage() {
  try {
    const user = localStorage.getItem('user')
    const permisos = localStorage.getItem('permisos')
    return {
      user: user ? JSON.parse(user) : null,
      permisos: permisos ? JSON.parse(permisos) : {},
    }
  }
  catch {
    return { user: null, permisos: {} }
  }

}


export function AuthProvider({ children }) {
  const stored = loadFromStorage()
  const [user, setUser] = useState(stored.user)
  const [permisos, setPermisos] = useState(stored.permisos)

  
    async function login(credentials) {
      const res = await client.post('/auth/login', credentials)
      const data = res.data.data
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({ username: data.username, rol: data.rol, id_estudiante: data.id_estudiante }))
      localStorage.setItem('permisos', JSON.stringify(data.permisos))
      setPermisos(data.permisos)
      setUser({ username: data.username, rol: data.rol, id_estudiante: data.id_estudiante })
    }

   async function logout() {
    try {
      await client.post('/auth/logout')
    } catch {
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('permisos')
      setUser(null)
      setPermisos({})
    }
  }

    

    function hasPermiso(seccion, tipo = 'ver') 
    {
      return !!permisos?.[seccion]?.[tipo]
    }

    return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, hasPermiso }}>
      {children}
    </AuthContext.Provider>
    )
}
 
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
