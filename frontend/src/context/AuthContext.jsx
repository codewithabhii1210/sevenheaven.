import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api.js'
import { useToast } from './ToastContext.jsx'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('sh7_token') || null)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sh7_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  // Verify auth on mount if token exists
  useEffect(() => {
    if (!token) return undefined
    let stale = false // guards against resolving after logout
    api
      .getMe()
      .then((res) => {
        if (stale) return
        if (res?.user) {
          setUser(res.user)
          localStorage.setItem('sh7_user', JSON.stringify(res.user))
        }
      })
      .catch(() => {
        if (stale) return
        // Token invalid or expired
        setToken(null)
        setUser(null)
        localStorage.removeItem('sh7_token')
        localStorage.removeItem('sh7_user')
      })
    return () => {
      stale = true
    }
  }, [token])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await api.login(email, password)
      setToken(data.token)
      setUser(data.user)
      showToast(`Welcome back, ${data.user.name || 'Patron'}!`, 'gold')
      return data.user
    } catch (err) {
      showToast(err.message || 'Login failed', 'info')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    setLoading(true)
    try {
      const data = await api.register(userData)
      setToken(data.token)
      setUser(data.user)
      showToast(`Welcome to Seven Heaven VIP circle, ${data.user.name}!`, 'gold')
      return data.user
    } catch (err) {
      showToast(err.message || 'Registration failed', 'info')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    // Clear local session FIRST and synchronously — logout must never depend
    // on network. The server call below is best-effort (clears HttpOnly cookie).
    localStorage.removeItem('sh7_token')
    localStorage.removeItem('sh7_user')
    setToken(null)
    setUser(null)
    setLoading(false)
    showToast('Logged out successfully', 'info')
    try {
      await api.logout()
    } catch {
      // ignore — local session already cleared; stale cookie expires in 7 days
    }
  }

  const isAdmin = user?.role === 'admin'
  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
