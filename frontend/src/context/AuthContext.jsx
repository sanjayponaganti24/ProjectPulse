import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/auth/me')
      .then(response => setUser(response.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(credentials) {
    const response = await api.post('/api/auth/login', credentials)
    setUser(response.data.user)
    return response.data.user
  }

  async function register(details) {
    const response = await api.post('/api/auth/register', details)
    if (response.data.user && response.data.user.role === 'ORGANISATION_ADMIN') {
      setUser(response.data.user)
    }
    return response.data
  }

  async function logout() {
    await api.post('/api/auth/logout')
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
