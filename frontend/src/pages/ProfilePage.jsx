import { useState, useEffect } from 'react'
import { User, Phone, Mail, MapPin, Shield, Tractor, HardHat, Copy, CheckCircle, Star, MessageSquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ratingAPI } from '../services/api'
import { toast } from 'react-toastify'
import clsx from 'clsx'

function StarDisplay({ value, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className="w-4 h-4"
          fill={i < Math.round(value) ? '#f59e0b' : 'none'}
          stroke={i < Math.round(value) ? '#f59e0b' : '#d1d5db'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [copied, setCopied]         = useState(false)
  const [ratingData, setRatingData] = useState({ ratings: [], average: 0, count: 0 })
  const [loadingRatings, setLoadingRatings] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    ratingAPI.getForUser(user.id)
      .then(res => setRatingData(res.data))
      .catch(() => {})
      .finally(() => setLoadingRatings(false))
  }, [user?.id])

  const copyId = () => {
    navigator.clipboard.writeText(user?.userId || '')
    setCopied(true)
    toast.success('ID copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const RoleIcon = user?.role === 'FARMER' ? Tractor : user?.role === 'WORKER' ? HardHat : Shield
  const roleColor = user?.role === 'FARMER' ? 'bg-leaf-100 text-leaf-700' :
                    user?.role === 'WORKER' ? 'bg-soil-100 text-soil-700' : 'bg-harvest-100 text-harvest-700'

  const fields = [
    { icon: User,    label: 'Full Name', value: user?.fullName },
    { icon: Phone,   label: 'Phone',     value: user?.phone },
    { icon: Mail,    label: 'Email',     value: user?.email },
    { icon: MapPin,  label: 'Address',   value: user?.address || 'Not provided' },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div className="animate-fade-up">
        <h2 className="font-display text-2xl font-bold text-gray-800">My Profile</h2>
        <p className="text-gray-500 text-sm">Your account information</p>
      </div>

      {/* ID Card */}
      <div className="rounded-3xl bg-field-gradient p-6 text-white shadow-leaf animate-fade-up relative overflow-hidden"
           style={{ animationDelay: '0.05s' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/4 translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">FWMS Identity Card</p>
              <h3 className="font-display text-2xl font-bold mt-1">{user?.fullName}</h3>
            </div>
            <div className={clsx('p-3 rounded-2xl bg-white/20')}>
              <RoleIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <p className="text-white/70 text-xs">Your ID</p>
              <p className="font-mono font-bold text-lg tracking-wider">{user?.userId}</p>
            </div>
            <button onClick={copyId}
              className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              title="Copy ID">
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className={clsx('badge bg-white/20 text-white border-0')}>
              <RoleIcon className="w-3 h-3" /> {user?.role}
            </span>
            <span className="badge bg-white/20 text-white border-0">
              <CheckCircle className="w-3 h-3" /> Active
            </span>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="card animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="font-display font-bold text-gray-800 mb-4">Account Details</h3>
        <div className="space-y-4">
          {fields.map(f => (
            <div key={f.label} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
              <div className="w-8 h-8 rounded-lg bg-leaf-100 flex items-center justify-center shrink-0">
                <f.icon className="w-4 h-4 text-leaf-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{f.label}</p>
                <p className="text-sm font-semibold text-gray-700">{f.value || '—'}</p>
              </div>
            </div>
          ))}

          {user?.role === 'WORKER' && user?.skills && (
            <div className="p-3 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-400 font-medium mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {user.skills.split(',').map(s => (
                  <span key={s} className="badge badge-soil">{s.trim()}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Identity Proof */}
      {user?.identityProofUrl && (
        <div className="card animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <h3 className="font-display font-bold text-gray-800 mb-3">Identity Proof</h3>
          <a href={user.identityProofUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-leaf-600 hover:text-leaf-700 text-sm font-medium
                       px-4 py-2.5 bg-leaf-50 rounded-xl border border-leaf-200 hover:bg-leaf-100 transition-colors">
            <CheckCircle className="w-4 h-4" /> View Uploaded Document
          </a>
        </div>
      )}

      {/* Ratings Section */}
      {user?.role !== 'ADMIN' && (
        <div className="card animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-gray-800">My Ratings</h3>
            {!loadingRatings && (
              <div className="flex items-center gap-2">
                <StarDisplay value={ratingData.average} />
                <span className="font-bold text-gray-800">{ratingData.average > 0 ? ratingData.average.toFixed(1) : '—'}</span>
                <span className="text-xs text-gray-400">({ratingData.count} review{ratingData.count !== 1 ? 's' : ''})</span>
              </div>
            )}
          </div>

          {/* Overall rating summary bar */}
          {!loadingRatings && ratingData.count > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-harvest-50 to-amber-50 border border-harvest-100 mb-5 flex items-center gap-5">
              <div className="text-center shrink-0">
                <p className="font-display text-4xl font-bold text-harvest-600">{ratingData.average.toFixed(1)}</p>
                <StarDisplay value={ratingData.average} />
                <p className="text-xs text-gray-400 mt-1">out of 5</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = ratingData.ratings.filter(r => r.stars === star).length
                  const pct = ratingData.count > 0 ? (count / ratingData.count) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-3">{star}</span>
                      <Star className="w-3 h-3 text-harvest-400 shrink-0" fill="#fbbf24" stroke="#fbbf24" />
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-harvest-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-4">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {loadingRatings ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-harvest-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : ratingData.count === 0 ? (
            <div className="text-center py-8">
              <Star className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm font-medium">No ratings yet</p>
              <p className="text-gray-300 text-xs mt-1">Ratings will appear here after completing tasks</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ratingData.ratings.map(r => (
                <div key={r.id} className="p-4 rounded-2xl border border-gray-100 hover:border-harvest-100 hover:bg-harvest-50/20 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StarDisplay value={r.stars} />
                      <span className="font-bold text-gray-700">{r.stars}/5</span>
                    </div>
                    <span className={clsx(
                      'text-xs font-semibold px-2.5 py-1 rounded-full',
                      r.ratingType === 'FARMER_TO_WORKER'
                        ? 'bg-leaf-100 text-leaf-700'
                        : 'bg-soil-100 text-soil-700'
                    )}>
                      {r.ratingType === 'FARMER_TO_WORKER' ? '🌾 From Farmer' : '👷 From Worker'}
                    </span>
                  </div>
                  {r.comment && (
                    <div className="flex items-start gap-2 mt-2">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-600 italic">"{r.comment}"</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-300 mt-2">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
