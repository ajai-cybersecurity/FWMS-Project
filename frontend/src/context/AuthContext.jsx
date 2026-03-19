import { createContext, useContext, useState, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fwms_user')) || null }
    catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('fwms_token') || null)
  const [loading, setLoading] = useState(false)

  // Set default auth header whenever token changes
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

  const login = useCallback(async (credentials, role) => {
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', { ...credentials, role })
      const { token: t, user: u } = res.data
      setToken(t)
      setUser(u)
      localStorage.setItem('fwms_token', t)
      localStorage.setItem('fwms_user', JSON.stringify(u))
      axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
      toast.success(`Welcome back, ${u.fullName}!`)
      return { success: true, user: u }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.'
      toast.error(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (formData, role) => {
    setLoading(true)
    try {
      const res = await axios.post(`/api/auth/register/${role.toLowerCase()}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success(`Registration successful! Your ${role} ID: ${res.data.userId}`)
      return { success: true, data: res.data }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.'
      toast.error(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('fwms_token')
    localStorage.removeItem('fwms_user')
    delete axios.defaults.headers.common['Authorization']
    toast.info('Logged out successfully.')
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
