import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Tractor, HardHat, CheckCircle, ArrowLeft, Wheat } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import clsx from 'clsx'

const SKILLS_OPTIONS = [
  'Planting', 'Harvesting', 'Irrigation', 'Spraying', 'Pruning',
  'Weeding', 'Ploughing', 'Transplanting', 'Grafting', 'Packaging'
]

export default function RegisterPage() {
  const [params] = useSearchParams()
  const navigate  = useNavigate()
  const { register, loading } = useAuth()
  const [role, setRole] = useState(params.get('role') === 'worker' ? 'WORKER' : 'FARMER')
  const [step, setStep] = useState(1) // 1 = form, 2 = success
  const [newId, setNewId] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [skills, setSkills] = useState([])
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', address: '', password: '', confirmPassword: ''
  })

  const toggleSkill = s => setSkills(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
  )

  const set = field => e => setForm(p => ({ ...p, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.phone.trim())    e.phone = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter valid 10-digit Indian mobile number'
    if (!form.email.trim())    e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format'
    if (!form.password)        e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Min 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (role === 'WORKER' && skills.length === 0) e.skills = 'Select at least one skill'
    // identityProof is optional
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return

    const fd = new FormData()
    fd.append('fullName', form.fullName)
    fd.append('phone', form.phone)
    fd.append('email', form.email)
    fd.append('address', form.address)
    fd.append('password', form.password)
    fd.append('role', role)
    if (role === 'WORKER') fd.append('skills', skills.join(','))

    const res = await register(fd, role)
    if (res.success) {
      setNewId(res.data.userId)
      setStep(2)
    }
  }

  if (step === 2) return (
    <div className="min-h-screen auth-bg field-pattern flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl shadow-2xl p-10 w-full max-w-md text-center animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-leaf-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-leaf-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
        <p className="text-gray-500 mb-6 text-sm">Welcome to FWMS. Your unique ID has been generated.</p>

        <div className="bg-leaf-50 border-2 border-leaf-200 rounded-2xl p-5 mb-6">
          <p className="text-sm text-leaf-700 font-medium mb-1">Your {role === 'FARMER' ? 'Farmer' : 'Worker'} ID</p>
          <p className="font-display text-3xl font-bold text-leaf-700 tracking-wider">{newId}</p>
          <p className="text-xs text-leaf-600 mt-2">Save this ID — you'll need it to log in!</p>
        </div>

        <button onClick={() => navigate('/login')} className="btn-primary w-full">
          Proceed to Login
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen auth-bg field-pattern flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-6 animate-fade-up">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur mb-3">
            <Wheat className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Create Account</h1>
          <p className="text-white/70 text-sm mt-1">Join FWMS today</p>
        </div>

        <div className="glass-card rounded-3xl shadow-2xl overflow-hidden">
          {/* Role Toggle */}
          <div className="flex border-b border-gray-100">
            {['FARMER', 'WORKER'].map(r => (
              <button
                key={r}
                onClick={() => { setRole(r); setErrors({}) }}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all duration-200',
                  role === r
                    ? r === 'FARMER' ? 'bg-leaf-600 text-white' : 'bg-soil-600 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                )}
              >
                {r === 'FARMER' ? <Tractor className="w-4 h-4" /> : <HardHat className="w-4 h-4" />}
                {r === 'FARMER' ? 'Farmer' : 'Worker'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-7 space-y-4" noValidate>
            {/* Name & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                <input className={clsx('input-field', errors.fullName && 'input-error')}
                  placeholder="Ravi Kumar" value={form.fullName} onChange={set('fullName')} />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone * <span className="text-gray-400 font-normal">(for login)</span></label>
                <input className={clsx('input-field', errors.phone && 'input-error')}
                  placeholder="9876543210" value={form.phone} onChange={set('phone')} type="tel" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
              <input className={clsx('input-field', errors.email && 'input-error')}
                placeholder="ravi@example.com" value={form.email} onChange={set('email')} type="email" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address</label>
              <input className="input-field" placeholder="Village, District, State"
                value={form.address} onChange={set('address')} />
            </div>

            {/* Skills (Worker only) */}
            {role === 'WORKER' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Skills * <span className="text-gray-400 font-normal">(select all that apply)</span></label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS_OPTIONS.map(s => (
                    <button key={s} type="button" onClick={() => toggleSkill(s)}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150',
                        skills.includes(s)
                          ? 'bg-soil-600 text-white border-soil-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-soil-300'
                      )}>
                      {s}
                    </button>
                  ))}
                </div>
                {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
              </div>
            )}

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password *</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'}
                    className={clsx('input-field pr-10', errors.password && 'input-error')}
                    placeholder="Min 6 chars" value={form.password} onChange={set('password')} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password *</label>
                <input type="password"
                  className={clsx('input-field', errors.confirmPassword && 'input-error')}
                  placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>


            <div className="pt-2 space-y-3">
              <button type="submit" disabled={loading}
                className={clsx(
                  'w-full flex items-center justify-center gap-2 font-medium px-6 py-2.5 rounded-xl transition-all duration-200',
                  role === 'FARMER'
                    ? 'bg-leaf-600 hover:bg-leaf-700 text-white shadow-leaf'
                    : 'bg-soil-600 hover:bg-soil-700 text-white shadow-soil'
                )}>
                {loading
                  ? <><div className="spinner" /><span>Registering…</span></>
                  : <span>Create {role === 'FARMER' ? 'Farmer' : 'Worker'} Account</span>
                }
              </button>

              <p className="text-center text-sm text-gray-500">
                Already registered?{' '}
                <Link to="/login" className="text-leaf-600 hover:text-leaf-700 font-semibold inline-flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
