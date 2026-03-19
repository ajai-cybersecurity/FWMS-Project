import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Trash2, Edit, MapPin, Calendar, IndianRupee, CheckCircle, UserCheck, Star, XCircle } from 'lucide-react'
import { taskAPI, ratingAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import TaskModal from '../components/tasks/TaskModal'
import RatingModal from '../components/tasks/RatingModal'
import clsx from 'clsx'

const STATUS_OPTIONS = ['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

const statusStyle = {
  PENDING:     { badge: 'badge-gray',   label: 'Pending' },
  IN_PROGRESS: { badge: 'badge-yellow', label: 'In Progress' },
  COMPLETED:   { badge: 'badge-green',  label: 'Completed' },
  CANCELLED:   { badge: 'badge-red',    label: 'Cancelled' },
}

export default function TasksPage({ role }) {
  const { user } = useAuth()
  const [tasks, setTasks]         = useState([])
  const [filtered, setFiltered]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusFilter, setFilter] = useState('ALL')
  const [modal, setModal]         = useState({ open: false, mode: 'create', task: null })
  const [deleting, setDeleting]     = useState(null)
  const [accepting, setAccepting]   = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [ratingTask, setRatingTask] = useState(null)
  const [ratedTasks, setRatedTasks] = useState(new Set())

  const loadTasks = async () => {
    setLoading(true)
    try {
      const fn = role === 'WORKER' ? taskAPI.getMyTasks
               : role === 'FARMER' ? taskAPI.getMyTasks
               : taskAPI.getAll
      const res = await fn()
      setTasks(res.data || [])
    } catch { toast.error('Failed to load tasks') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadTasks() }, [role])

  useEffect(() => {
    const completedIds = tasks.filter(t => t.status === 'COMPLETED').map(t => t.id)
    if (completedIds.length === 0) return
    Promise.all(completedIds.map(id =>
      ratingAPI.myRating(id).then(r => r.data.rated ? id : null).catch(() => null)
    )).then(results => setRatedTasks(new Set(results.filter(Boolean))))
  }, [tasks])

  useEffect(() => {
    let f = [...tasks]
    if (statusFilter !== 'ALL') f = f.filter(t => t.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      f = f.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.location?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      )
    }
    setFiltered(f)
  }, [tasks, search, statusFilter])

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    setDeleting(id)
    try {
      await taskAPI.delete(id)
      toast.success('Task deleted')
      loadTasks()
    } catch { toast.error('Delete failed') }
    finally { setDeleting(null) }
  }

  const handleComplete = async (id) => {
    try {
      await taskAPI.complete(id)
      toast.success('Task marked complete! You can now rate the worker.')
      loadTasks()
    } catch { toast.error('Failed to update') }
  }

  const handleAccept = async (id) => {
    setAccepting(id)
    try {
      await taskAPI.accept(id)
      toast.success('Job accepted! Get ready to work.')
      loadTasks()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not accept task')
    } finally { setAccepting(null) }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this job? It will go back to available.')) return
    setCancelling(id)
    try {
      await taskAPI.reject(id)
      toast.success('Job cancelled successfully.')
      loadTasks()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel job')
    } finally { setCancelling(null) }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-up">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-800">
            {role === 'ADMIN' ? 'All Tasks' : role === 'FARMER' ? 'My Tasks' : 'My Jobs'}
          </h2>
          <p className="text-gray-500 text-sm">{filtered.length} records found</p>
        </div>
        {role === 'FARMER' && (
          <button onClick={() => setModal({ open: true, mode: 'create', task: null })} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Post Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card !p-4 flex flex-col sm:flex-row gap-3 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={clsx(
                'px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-150',
                statusFilter === s
                  ? 'bg-leaf-600 text-white border-leaf-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-leaf-300'
              )}>
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-leaf-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Filter className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">No tasks found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Wage</th>
                  <th>Status</th>
                  {role === 'FARMER' && <th>Worker</th>}
                  {role === 'WORKER' && <th>Farmer</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(task => {
                  const st = statusStyle[task.status] || statusStyle.PENDING
                  return (
                    <tr key={task.id}>
                      <td>
                        <div>
                          <p className="font-medium text-gray-800">{task.title}</p>
                          <p className="text-xs text-gray-400 truncate max-w-xs">{task.description}</p>
                        </div>
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-3 h-3" />{task.location}
                        </span>
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-3 h-3" />{task.date || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="flex items-center gap-1 font-semibold text-leaf-700">
                          <IndianRupee className="w-3 h-3" />{task.wage}/day
                        </span>
                      </td>
                      <td>
                        <span className={clsx('badge', st.badge)}>{st.label}</span>
                      </td>

                      {/* Worker column — only for FARMER */}
                      {role === 'FARMER' && (
                        <td>
                          {task.worker ? (
                            <span className="flex items-center gap-1 text-sm font-medium text-leaf-700">
                              <UserCheck className="w-3.5 h-3.5" />
                              {task.worker.fullName}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Not assigned</span>
                          )}
                        </td>
                      )}

                      {/* Farmer column — only for WORKER */}
                      {role === 'WORKER' && (
                        <td>
                          <span className="flex items-center gap-1 text-sm font-medium text-leaf-700">
                            <UserCheck className="w-3.5 h-3.5" />
                            {task.farmer?.fullName || '—'}
                          </span>
                        </td>
                      )}

                      <td>
                        <div className="flex items-center gap-1.5">
                          {/* WORKER: Accept button — only on available PENDING tasks without a worker */}
                          {role === 'WORKER' && task.status === 'PENDING' && !task.worker && (
                            <button
                              onClick={() => handleAccept(task.id)}
                              disabled={accepting === task.id}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-leaf-600 hover:bg-leaf-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
                            >
                              {accepting === task.id
                                ? <><div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> Accepting…</>
                                : <><CheckCircle className="w-3.5 h-3.5" /> Accept</>
                              }
                            </button>
                          )}

                          {/* WORKER: Cancel button on IN_PROGRESS tasks */}
                          {role === 'WORKER' && task.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleCancel(task.id)}
                              disabled={cancelling === task.id}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors disabled:opacity-60"
                            >
                              {cancelling === task.id
                                ? <><div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" /> Cancelling…</>
                                : <><XCircle className="w-3.5 h-3.5" /> Cancel Job</>
                              }
                            </button>
                          )}

                          {/* FARMER: Mark complete */}
                          {role === 'FARMER' && task.status === 'IN_PROGRESS' && (
                            <button onClick={() => handleComplete(task.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-colors">
                              <CheckCircle className="w-3.5 h-3.5" /> Complete
                            </button>
                          )}

                          {/* Rate button for completed tasks */}
                          {task.status === 'COMPLETED' &&
                           ((role === 'FARMER' && task.worker) || role === 'WORKER') &&
                           !ratedTasks.has(task.id) && (
                            <button
                              onClick={() => setRatingTask(task)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors"
                            >
                              <Star className="w-3.5 h-3.5" /> Rate
                            </button>
                          )}
                          {task.status === 'COMPLETED' && ratedTasks.has(task.id) && (
                            <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-xs font-semibold">
                              <Star className="w-3.5 h-3.5" /> Rated
                            </span>
                          )}

                          {/* FARMER / ADMIN: Edit & Delete on PENDING */}
                          {(role === 'FARMER' || role === 'ADMIN') && task.status === 'PENDING' && (
                            <>
                              <button onClick={() => setModal({ open: true, mode: 'edit', task })}
                                className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-100 transition-colors" title="Edit">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(task.id)} disabled={deleting === task.id}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.open && (
        <TaskModal
          mode={modal.mode}
          task={modal.task}
          onClose={() => setModal({ open: false, mode: 'create', task: null })}
          onSuccess={() => { setModal({ open: false, mode: 'create', task: null }); loadTasks() }}
        />
      )}

      {ratingTask && (
        <RatingModal
          task={ratingTask}
          raterRole={role}
          onClose={() => setRatingTask(null)}
          onSuccess={() => setRatedTasks(prev => new Set([...prev, ratingTask.id]))}
        />
      )}
    </div>
  )
}
