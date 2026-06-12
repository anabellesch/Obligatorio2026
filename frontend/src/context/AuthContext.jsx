import { createContext, useContext, useState } from 'react'
import client from '../api/client'
 
const AuthContext = createContext(null)
 
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

    async function login(credentials) {
    const res = await client.post('/auth/login', credentials)
    const { token, username, rol } = res.data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify({ username, rol }))
    setUser({ username, rol })
  }

   async function logout() {
    try {
      await client.post('/auth/logout')
    } catch {
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

    return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}
 
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
