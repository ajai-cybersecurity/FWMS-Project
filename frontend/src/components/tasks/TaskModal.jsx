import { useState, useEffect } from 'react'
import { X, MapPin, Calendar, IndianRupee, FileText, AlignLeft } from 'lucide-react'
import { taskAPI } from '../../services/api'
import { toast } from 'react-toastify'
import clsx from 'clsx'

const EMPTY = { title: '', description: '', location: '', date: '', wage: '', status: 'PENDING' }

export default function TaskModal({ mode = 'create', task = null, onClose, onSuccess }) {
  const [form, setForm]     = useState(mode === 'edit' && task ? { ...task } : EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title    = 'Title is required'
    if (!form.location.trim())    e.location = 'Location is required'
    if (!form.date)               e.date     = 'Date is required'
    if (!form.wage || isNaN(form.wage) || +form.wage < 0) e.wage = 'Enter valid wage'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      if (mode === 'edit') {
        await taskAPI.update(task.id, form)
        toast.success('Task updated!')
      } else {
        await taskAPI.create(form)
        toast.success('Task posted successfully!')
      }
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  // Close on Escape
  useEffect(() => {
    const h = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-fade-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="font-display font-bold text-gray-800 text-xl">
              {mode === 'edit' ? 'Edit Task' : 'Post New Task'}
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              {mode === 'edit' ? 'Update task details' : 'Fill in the job details for workers'}
            </p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />Task Title *</span>
            </label>
            <input className={clsx('input-field', errors.title && 'input-error')}
              placeholder="e.g. Rice Harvesting – 5 Acres"
              value={form.title} onChange={set('title')} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              <span className="flex items-center gap-1.5"><AlignLeft className="w-3.5 h-3.5" />Description</span>
            </label>
            <textarea className="input-field resize-none h-20" rows={3}
              placeholder="Describe the work, requirements, tools needed…"
              value={form.description} onChange={set('description')} />
          </div>

          {/* Location + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Location *</span>
              </label>
              <input className={clsx('input-field', errors.location && 'input-error')}
                placeholder="Village, District"
                value={form.location} onChange={set('location')} />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Start Date *</span>
              </label>
              <input type="date" className={clsx('input-field', errors.date && 'input-error')}
                value={form.date} onChange={set('date')}
                min={new Date().toISOString().split('T')[0]} />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
          </div>

          {/* Wage + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                <span className="flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" />Daily Wage (₹) *</span>
              </label>
              <input type="number" min="0" className={clsx('input-field', errors.wage && 'input-error')}
                placeholder="500"
                value={form.wage} onChange={set('wage')} />
              {errors.wage && <p className="text-red-500 text-xs mt-1">{errors.wage}</p>}
            </div>
            {mode === 'edit' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                <select className="input-field" value={form.status} onChange={set('status')}>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving
                ? <><div className="spinner" /><span>Saving…</span></>
                : <span>{mode === 'edit' ? 'Update Task' : 'Post Task'}</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
