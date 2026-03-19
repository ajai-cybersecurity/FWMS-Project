import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Sprout, Shield, HardHat, Tractor, ArrowRight, Wheat } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import clsx from 'clsx'

const ROLES = [
  { key: 'FARMER', label: 'Farmer', icon: Tractor, color: 'leaf', hint: 'Farmer ID or Phone' },
  { key: 'WORKER', label: 'Worker', icon: HardHat, color: 'soil', hint: 'Worker ID or Phone' },
  { key: 'ADMIN',  label: 'Admin',  icon: Shield,  color: 'harvest', hint: 'Email address' },
]

const colorMap = {
  leaf:    { tab: 'bg-leaf-600 text-white',    ring: 'focus:ring-leaf-400',    btn: 'btn-primary' },
  soil:    { tab: 'bg-soil-600 text-white',    ring: 'focus:ring-soil-400',    btn: 'btn-soil' },
  harvest: { tab: 'bg-harvest-500 text-white', ring: 'focus:ring-harvest-400', btn: 'bg-harvest-500 hover:bg-harvest-600 text-white font-medium px-6 py-2.5 rounded-xl transition-all duration-200' },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading } = useAuth()
  const [role, setRole] = useState('FARMER')
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [errors, setErrors] = useState({})

  const current = ROLES.find(r => r.key === role)
  const colors  = colorMap[current.color]

  const validate = () => {
    const e = {}
    if (!form.identifier.trim()) e.identifier = 'This field is required'
    if (!form.password)          e.password   = 'Password is required'
    else if (form.password.length < 4) e.password = 'Password too short'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    const res = await login({ identifier: form.identifier, password: form.password }, role)
    if (res.success) {
      const map = { ADMIN: '/admin', FARMER: '/farmer', WORKER: '/worker' }
      navigate(map[res.user.role] || '/dashboard')
    }
  }

  return (
    <div className="min-h-screen auth-bg field-pattern flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 text-white/5 text-9xl font-display font-black select-none">🌾</div>
        <div className="absolute bottom-10 right-10 text-white/5 text-9xl font-display font-black select-none rotate-12">🌿</div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-white/3 -translate-y-1/2 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-4 shadow-lg">
            <Wheat className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">FWMS</h1>
          <p className="text-white/70 text-sm mt-1 font-body">Farmers & Workers Management System</p>
        </div>

        <div className="glass-card rounded-3xl shadow-2xl overflow-hidden animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {/* Role Tabs */}
          <div className="flex border-b border-gray-100">
            {ROLES.map(r => (
              <button
                key={r.key}
                onClick={() => { setRole(r.key); setErrors({}) }}
                className={clsx(
                  'flex-1 flex flex-col items-center gap-1 py-4 text-xs font-semibold transition-all duration-200',
                  role === r.key ? colorMap[r.color].tab : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
              >
                <r.icon className="w-4 h-4" />
                {r.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-1">
              {current.label} Login
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Use your {current.hint} to sign in
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {current.hint}
                </label>
                <input
                  type="text"
                  className={clsx('input-field', errors.identifier && 'input-error')}
                  placeholder={role === 'ADMIN' ? 'admin@fwms.com' : role === 'FARMER' ? 'FRM-1023 or 9876543210' : 'WRK-1042 or 9876543210'}
                  value={form.identifier}
                  onChange={e => setForm(p => ({ ...p, identifier: e.target.value }))}
                  autoComplete="username"
                />
                {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className={clsx('input-field pr-10', errors.password && 'input-error')}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPwd(v => !v)}
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={clsx(colors.btn, 'w-full flex items-center justify-center gap-2 mt-2')}
              >
                {loading ? (
                  <><div className="spinner" /><span>Signing in…</span></>
                ) : (
                  <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            {role !== 'ADMIN' && (
              <p className="text-center text-sm text-gray-500 mt-6">
                Don't have an account?{' '}
                <Link
                  to={`/register?role=${role.toLowerCase()}`}
                  className="text-leaf-600 hover:text-leaf-700 font-semibold"
                >
                  Register here
                </Link>
              </p>
            )}

            {/* Demo credentials */}
            <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 font-medium mb-1">🔑 Demo credentials</p>
              <p className="text-xs text-gray-400 font-mono">
                {role === 'ADMIN'  && 'admin@fwms.com / admin123'}
                {role === 'FARMER' && 'FRM-0001 / farmer123'}
                {role === 'WORKER' && 'WRK-0001 / worker123'}
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          © 2024 FWMS · Farmers & Workers Management System
        </p>
      </div>
    </div>
  )
}
