import { useState, useEffect, useRef } from 'react'
import { Plus, ClipboardList, CheckCircle, Clock, Users, MapPin, Calendar, IndianRupee, X, Phone, Mail, User, Briefcase, MessageCircle, UserX, Search, Star } from 'lucide-react'
import { taskAPI, dashboardAPI, userAPI, ratingAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import TaskModal from '../components/tasks/TaskModal'
import ChatModal from '../components/tasks/ChatModal'
import RatingModal from '../components/tasks/RatingModal'
import clsx from 'clsx'

const STATUS_STYLES = {
  PENDING:     { cls: 'badge badge-gray',   label: 'Pending' },
  IN_PROGRESS: { cls: 'badge badge-yellow', label: 'In Progress' },
  COMPLETED:   { cls: 'badge badge-green',  label: 'Completed' },
  CANCELLED:   { cls: 'badge badge-red',    label: 'Cancelled' },
}

// ── Worker Detail Modal ──────────────────────────────────
function WorkerDetailModal({ worker, taskTitle, onClose }) {
  useEffect(() => {
    const h = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-up overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-leaf-600 to-leaf-500 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-leaf-100 text-xs font-medium mb-0.5">Worker accepted your task</p>
            <h3 className="text-white font-bold text-lg">{taskTitle}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Worker Info */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-leaf-100 flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-leaf-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-xl">{worker.fullName}</h4>
              <p className="text-sm font-mono text-leaf-600">{worker.userId}</p>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <Phone className="w-4 h-4 text-leaf-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-700">{worker.phone || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <Mail className="w-4 h-4 text-leaf-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-700">{worker.email || '—'}</p>
              </div>
            </div>
            {worker.skills && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <Briefcase className="w-4 h-4 text-leaf-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Skills</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {worker.skills.split(',').map(s => (
                      <span key={s} className="px-2 py-0.5 bg-leaf-100 text-leaf-700 text-xs rounded-full font-medium">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {worker.address && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <MapPin className="w-4 h-4 text-leaf-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Address</p>
                  <p className="text-sm font-medium text-gray-700">{worker.address}</p>
                </div>
              </div>
            )}
          </div>

          <button onClick={onClose} className="w-full btn-primary mt-2">Close</button>
        </div>
      </div>
    </div>
  )
}

// ── Notification Popup ───────────────────────────────────
function AcceptNotification({ notification, onView, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 10000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="fixed top-5 right-5 z-50 animate-fade-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-leaf-200 p-4 w-80 flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-leaf-100 flex items-center justify-center shrink-0">
          <CheckCircle className="w-5 h-5 text-leaf-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800">Job Accepted! 🎉</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            <span className="font-semibold text-leaf-700">{notification.workerName}</span> accepted your task
            <span className="font-semibold"> "{notification.taskTitle}"</span>
          </p>
          <button
            onClick={onView}
            className="mt-2 text-xs font-semibold text-leaf-600 hover:text-leaf-700 underline underline-offset-2"
          >
            View Worker Details →
          </button>
        </div>
        <button onClick={onDismiss} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────
export default function FarmerDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks]           = useState([])
  const [stats, setStats]           = useState({ total: 0, active: 0, completed: 0, workers: 0 })
  const [showModal, setShowModal]   = useState(false)
  const [loading, setLoading]       = useState(true)
  const [notification, setNotification] = useState(null)
  const [workerDetail, setWorkerDetail] = useState(null)
  const [chatTask, setChatTask]         = useState(null)
  const [rejecting, setRejecting]       = useState(null)
  const prevTasksRef                    = useRef({})
  const [taskSearch, setTaskSearch]     = useState('')
  const [workerSearch, setWorkerSearch] = useState('')
  const [allWorkers, setAllWorkers]     = useState([])
  const [showWorkerSearch, setShowWorkerSearch] = useState(false)
  const [ratingTask, setRatingTask]     = useState(null)
  const [ratedTasks, setRatedTasks]     = useState(new Set())

  const loadData = async (isFirst = false) => {
    if (isFirst) setLoading(true)
    try {
      const [tRes, sRes] = await Promise.all([
        taskAPI.getMyTasks().catch(() => ({ data: [] })),
        dashboardAPI.farmerStats().catch(() => ({ data: { total: 0, active: 0, completed: 0, workers: 0 } }))
      ])
      const newTasks = tRes.data || []

      // Detect newly accepted tasks
      newTasks.forEach(task => {
        const prev = prevTasksRef.current[task.id]
        if (prev && prev.status === 'PENDING' && task.status === 'IN_PROGRESS' && task.worker) {
          setNotification({
            workerName: task.worker.fullName,
            taskTitle:  task.title,
            worker:     task.worker,
            task:       task,
          })
        }
      })

      prevTasksRef.current = Object.fromEntries(newTasks.map(t => [t.id, { status: t.status }]))
      setTasks(newTasks)
      setStats(sRes.data)
      if (isFirst) {
        const wRes = await userAPI.getWorkers().catch(() => ({ data: [] }))
        setAllWorkers(wRes.data || [])
      }
    } finally {
      if (isFirst) setLoading(false)
    }
  }

  useEffect(() => {
    loadData(true)
    const interval = setInterval(() => loadData(false), 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const completedIds = tasks.filter(t => t.status === 'COMPLETED' && t.worker).map(t => t.id)
    if (completedIds.length === 0) return
    Promise.all(completedIds.map(id =>
      ratingAPI.myRating(id).then(r => r.data.rated ? id : null).catch(() => null)
    )).then(results => setRatedTasks(new Set(results.filter(Boolean))))
  }, [tasks])

  const handleReject = async (task) => {
    if (!confirm(`Reject ${task.worker?.fullName} from "${task.title}"? The task will go back to PENDING.`)) return
    setRejecting(task.id)
    try {
      await taskAPI.reject(task.id)
      loadData(false)
    } catch {} finally { setRejecting(null) }
  }

  const filteredTasks = tasks.filter(t =>
    t.title?.toLowerCase().includes(taskSearch.toLowerCase()) ||
    t.location?.toLowerCase().includes(taskSearch.toLowerCase())
  )

  const filteredWorkers = allWorkers.filter(w =>
    w.fullName?.toLowerCase().includes(workerSearch.toLowerCase()) ||
    w.skills?.toLowerCase().includes(workerSearch.toLowerCase()) ||
    w.userId?.toLowerCase().includes(workerSearch.toLowerCase())
  )

  const statCards = [
    { icon: ClipboardList, label: 'Total Tasks',   value: stats.total,     color: 'bg-leaf-100 text-leaf-700' },
    { icon: Clock,         label: 'Active Tasks',  value: stats.active,    color: 'bg-harvest-100 text-harvest-700' },
    { icon: CheckCircle,   label: 'Completed',     value: stats.completed, color: 'bg-blue-100 text-blue-700' },
    { icon: Users,         label: 'Workers Hired', value: stats.workers,   color: 'bg-soil-100 text-soil-700' },
  ]

  return (
    <div className="space-y-6">

      {/* Notification Popup */}
      {notification && (
        <AcceptNotification
          notification={notification}
          onView={() => {
            setWorkerDetail({ worker: notification.worker, taskTitle: notification.taskTitle })
            setNotification(null)
          }}
          onDismiss={() => setNotification(null)}
        />
      )}

      {/* Chat Modal */}
      {chatTask && (
        <ChatModal task={chatTask} onClose={() => setChatTask(null)} />
      )}

      {/* Rating Modal */}
      {ratingTask && (
        <RatingModal
          task={ratingTask}
          raterRole="FARMER"
          onClose={() => setRatingTask(null)}
          onSuccess={() => setRatedTasks(prev => new Set([...prev, ratingTask.id]))}
        />
      )}

      {/* Worker Detail Modal */}
      {workerDetail && (
        <WorkerDetailModal
          worker={workerDetail.worker}
          taskTitle={workerDetail.taskTitle}
          onClose={() => setWorkerDetail(null)}
        />
      )}

      {/* Agri Banner */}
      <div className="farmer-banner rounded-3xl overflow-hidden relative h-36 animate-fade-up">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8">
          <p className="text-white/80 text-xs font-medium uppercase tracking-widest mb-1">Farmer Portal</p>
          <h3 className="font-display text-2xl font-bold text-white">Manage Your Farm Tasks</h3>
          <p className="text-white/70 text-sm mt-1">Post jobs, hire workers, grow your harvest 🌱</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h2 className="font-display text-2xl font-black text-gray-800">
            Welcome, {user?.fullName?.split(' ')[0]} 🌾
          </h2>
          <p className="text-gray-600 text-sm mt-0.5 font-bold">ID: <span className="font-black font-mono text-leaf-600">{user?.userId}</span></p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Post New Task
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 animate-fade-up">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-leaf-500" />
          <input
            className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-leaf-400 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-leaf-500 shadow-md text-sm font-medium"
            placeholder="Search your tasks by title or location…"
            value={taskSearch}
            onChange={e => setTaskSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowWorkerSearch(v => !v)}
          className={clsx('flex items-center gap-2 px-5 py-3 rounded-xl border-2 text-sm font-bold transition-all shadow-md',
            showWorkerSearch
              ? 'bg-leaf-600 text-white border-leaf-600 shadow-leaf'
              : 'bg-white text-leaf-700 border-leaf-400 hover:bg-leaf-50'
          )}
        >
          <Users className="w-4 h-4" /> Find Workers
        </button>
      </div>

      {/* Worker Search Panel */}
      {showWorkerSearch && (
        <div className="card animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-gray-800">Search Available Workers</h3>
            <button onClick={() => setShowWorkerSearch(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-leaf-500" />
            <input
              className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-leaf-400 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-leaf-400 shadow-md text-sm font-medium"
              placeholder="Search by name, skill (e.g. Harvesting, Planting)…"
              value={workerSearch}
              onChange={e => setWorkerSearch(e.target.value)}
              autoFocus
            />
          </div>
          {filteredWorkers.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">No workers found</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
              {filteredWorkers.map(w => (
                <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-leaf-200 hover:bg-leaf-50/30 transition-all cursor-pointer"
                  onClick={() => setWorkerDetail({ worker: w, taskTitle: 'Worker Profile' })}>
                  <div className="w-10 h-10 rounded-xl bg-leaf-100 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-leaf-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{w.fullName}</p>
                    <p className="text-xs font-mono text-leaf-600">{w.userId}</p>
                    {w.skills && <p className="text-xs text-gray-400 truncate mt-0.5">{w.skills}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={s.label} className="card animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">{s.label}</p>
                <p className="font-mono text-2xl font-bold text-gray-800 mt-0.5">{s.value}</p>
              </div>
              <div className={clsx('p-2.5 rounded-xl', s.color)}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tasks list */}
      <div className="card animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-gray-800">Your Posted Tasks</h3>
          <span className="badge badge-green">{filteredTasks.length} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-leaf-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{taskSearch ? 'No tasks match your search' : 'No tasks posted yet'}</p>
            <p className="text-gray-400 text-sm">{taskSearch ? 'Try a different keyword' : 'Post your first task to hire workers'}</p>
            {!taskSearch && <button onClick={() => setShowModal(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Post a Task
            </button>}
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredTasks.map(task => {
              const st = STATUS_STYLES[task.status] || STATUS_STYLES.PENDING
              return (
                <div key={task.id}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-leaf-200 hover:bg-leaf-50/30 transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl bg-leaf-100 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5 text-leaf-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-gray-800 text-sm">{task.title}</h4>
                      <span className={st.cls}>{st.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{task.location}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.date}</span>
                      <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{task.wage}/day</span>
                    </div>

                    {/* Worker info with reject + chat + details */}
                    {task.worker ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setWorkerDetail({ worker: task.worker, taskTitle: task.title })}
                          className="flex items-center gap-1.5 text-xs font-semibold text-leaf-600 hover:text-leaf-700 hover:underline underline-offset-2 transition-colors"
                        >
                          <Users className="w-3.5 h-3.5" />
                          👷 {task.worker.fullName} ({task.worker.userId})
                        </button>
                        <button
                          onClick={() => setChatTask(task)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Chat
                        </button>
                        {task.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleReject(task)}
                            disabled={rejecting === task.id}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <UserX className="w-3.5 h-3.5" /> Reject Worker
                          </button>
                        )}
                        {task.status === 'COMPLETED' && !ratedTasks.has(task.id) && (
                          <button
                            onClick={() => setRatingTask(task)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-semibold transition-colors"
                          >
                            <Star className="w-3.5 h-3.5" /> Rate Worker
                          </button>
                        )}
                        {task.status === 'COMPLETED' && ratedTasks.has(task.id) && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-400 text-xs font-semibold">
                            <Star className="w-3.5 h-3.5" /> Rated
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic mt-2">Waiting for worker to accept…</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <TaskModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); loadData(true) }}
          mode="create"
        />
      )}
    </div>
  )
}
