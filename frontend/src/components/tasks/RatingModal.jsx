import { useState } from 'react'
import { X, Star } from 'lucide-react'
import { ratingAPI } from '../../services/api'
import { toast } from 'react-toastify'

export default function RatingModal({ task, raterRole, onClose, onSuccess }) {
  const [stars, setStars]     = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const targetName = raterRole === 'FARMER'
    ? task.worker?.fullName
    : task.farmer?.fullName

  const targetLabel = raterRole === 'FARMER' ? 'Worker' : 'Farmer'

  const handleSubmit = async () => {
    if (stars === 0) { toast.warning('Please select a star rating'); return }
    setLoading(true)
    try {
      await ratingAPI.submit(task.id, { stars, comment: comment.trim() || null })
      toast.success('Rating submitted! Thank you for your feedback.')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating')
    } finally {
      setLoading(false)
    }
  }

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-up overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-harvest-600 to-harvest-500 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-harvest-100 text-xs font-medium mb-0.5">Rate {targetLabel}</p>
            <h3 className="text-white font-bold text-lg">"{task.title}"</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Who is being rated */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50">
            <div className="w-10 h-10 rounded-xl bg-harvest-100 flex items-center justify-center shrink-0">
              <span className="text-harvest-700 font-bold text-sm">
                {targetName?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Rating {targetLabel}</p>
              <p className="font-semibold text-gray-800">{targetName || '—'}</p>
            </div>
          </div>

          {/* Stars */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-3">How was your experience?</p>
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setStars(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className="w-9 h-9 transition-colors"
                    fill={(hovered || stars) >= n ? '#f59e0b' : 'none'}
                    stroke={(hovered || stars) >= n ? '#f59e0b' : '#d1d5db'}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            {(hovered || stars) > 0 && (
              <p className="text-sm font-semibold text-harvest-600">
                {labels[hovered || stars]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Comment <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-harvest-400 text-sm resize-none"
              rows={3}
              placeholder={
                raterRole === 'FARMER'
                  ? 'e.g. Hard working, punctual, great attitude…'
                  : 'e.g. Fair payment, clear instructions, respectful…'
              }
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/500</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || stars === 0}
              className="flex-1 px-4 py-3 rounded-xl bg-harvest-500 hover:bg-harvest-600 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                : <><Star className="w-4 h-4" /> Submit Rating</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
