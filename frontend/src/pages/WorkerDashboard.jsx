import { useState, useEffect } from 'react'
import { ClipboardList, CheckCircle, IndianRupee, MapPin, Calendar, Briefcase, Star, MessageCircle, Search } from 'lucide-react'
import { taskAPI, dashboardAPI, ratingAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import ChatModal from '../components/tasks/ChatModal'
import RatingModal from '../components/tasks/RatingModal'
import clsx from 'clsx'

export default function WorkerDashboard() {
  const { user } = useAuth()
  const [available, setAvailable] = useState([])
  const [myTasks, setMyTasks]     = useState([])
  const [stats, setStats]         = useState({ accepted: 0, completed: 0, earnings: 0, rating: 0 })
  const [loading, setLoading]     = useState(true)
  const [accepting, setAccepting] = useState(null)
  const [chatTask, setChatTask]   = useState(null)
  const [ratingTask, setRatingTask] = useState(null)
  const [ratedTasks, setRatedTasks] = useState(new Set())
  const [avgRating, setAvgRating]   = useState(null)
  const [jobSearch, setJobSearch] = useState('')
  const [mySearch, setMySearch]   = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [avRes, myRes, sRes] = await Promise.all([
        taskAPI.getAvailable().catch(() => ({ data: [] })),
        taskAPI.getMyTasks().catch(() => ({ data: [] })),
        dashboardAPI.workerStats().catch(() => ({ data: { accepted: 0, completed: 0, earnings: 0 } }))
      ])
      setAvailable(avRes.data || [])
      setMyTasks(myRes.data || [])
      setStats(sRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // Fetch real average rating for this worker
  useEffect(() => {
    if (!user?.id) return
    ratingAPI.getForUser(user.id)
      .then(res => setAvgRating(res.data.average > 0 ? res.data.average.toFixed(1) : '—'))
      .catch(() => setAvgRating('—'))
  }, [user?.id])

  useEffect(() => {
    const completedIds = myTasks.filter(t => t.status === 'COMPLETED').map(t => t.id)
    if (completedIds.length === 0) return
    Promise.all(completedIds.map(id =>
      ratingAPI.myRating(id).then(r => r.data.rated ? id : null).catch(() => null)
    )).then(results => setRatedTasks(new Set(results.filter(Boolean))))
  }, [myTasks])

  const acceptTask = async (taskId) => {
    setAccepting(taskId)
    try {
      await taskAPI.accept(taskId)
      toast.success('Task accepted! Get ready to work.')
      loadData()
    } catch {
      toast.error('Could not accept task. Try again.')
    } finally {
      setAccepting(null)
    }
  }

  const filteredAvailable = available.filter(t =>
    t.title?.toLowerCase().includes(jobSearch.toLowerCase()) ||
    t.location?.toLowerCase().includes(jobSearch.toLowerCase()) ||
    t.description?.toLowerCase().includes(jobSearch.toLowerCase())
  )

  const filteredMyTasks = myTasks.filter(t =>
    t.title?.toLowerCase().includes(mySearch.toLowerCase()) ||
    t.location?.toLowerCase().includes(mySearch.toLowerCase())
  )

  const statCards = [
    { icon: Briefcase,    label: 'Jobs Accepted',  value: stats.accepted,            color: 'bg-leaf-100 text-leaf-700' },
    { icon: CheckCircle,  label: 'Completed',      value: stats.completed,           color: 'bg-blue-100 text-blue-700' },
    { icon: IndianRupee,  label: 'Total Earnings', value: `₹${stats.earnings || 0}`, color: 'bg-harvest-100 text-harvest-700' },
    { icon: Star,         label: 'Rating',         value: avgRating ?? '—',          color: 'bg-soil-100 text-soil-700' },
  ]

  return (
    <div className="space-y-6">
      {chatTask && <ChatModal task={chatTask} onClose={() => setChatTask(null)} />}
      {ratingTask && (
        <RatingModal
          task={ratingTask}
          raterRole="WORKER"
          onClose={() => setRatingTask(null)}
          onSuccess={() => setRatedTasks(prev => new Set([...prev, ratingTask.id]))}
        />
      )}
      {/* Agri Banner */}
      <div className="worker-banner rounded-3xl overflow-hidden relative h-36 animate-fade-up">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8">
          <p className="text-white/80 text-xs font-medium uppercase tracking-widest mb-1">Worker Portal</p>
          <h3 className="font-display text-2xl font-bold text-white">Find Your Next Job</h3>
          <p className="text-white/70 text-sm mt-1">Browse available farm jobs and earn daily 💪</p>
        </div>
      </div>

      <div className="animate-fade-up">
        <h2 className="font-display text-2xl font-black text-gray-800">
          Hello, {user?.fullName?.split(' ')[0]} 👷
        </h2>
        <p className="text-gray-600 text-sm mt-0.5 font-bold">
          ID: <span className="font-black font-mono text-soil-600">{user?.userId}</span>
          {user?.skills && (
            <span className="ml-3 text-gray-400">Skills: {user.skills}</span>
          )}
        </p>
      </div>

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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Available Jobs */}
        <div className="card animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-gray-800">Available Jobs</h3>
            <span className="badge badge-green">{filteredAvailable.length} open</span>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soil-500" />
            <input className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-soil-400 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-soil-400 shadow-md text-sm font-medium" placeholder="Search by title, location…"
              value={jobSearch} onChange={e => setJobSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-7 h-7 border-2 border-soil-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredAvailable.length === 0 ? (
            <div className="text-center py-10">
              <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">{jobSearch ? 'No jobs match your search' : 'No available jobs right now'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAvailable.map(task => (
                <div key={task.id} className="p-4 rounded-2xl border border-gray-100 hover:border-soil-200 hover:bg-soil-50/20 transition-all duration-200">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-gray-800 text-sm">{task.title}</h4>
                    <span className="badge badge-soil shrink-0 font-mono">₹{task.wage}/day</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{task.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.date}</span>
                  </div>
                  <button
                    onClick={() => acceptTask(task.id)}
                    disabled={accepting === task.id}
                    className="w-full bg-soil-600 hover:bg-soil-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {accepting === task.id
                      ? <><div className="spinner scale-75" />Accepting…</>
                      : 'Accept Job'
                    }
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Accepted Tasks */}
        <div className="card animate-fade-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-gray-800">My Tasks</h3>
            <span className="badge badge-yellow">{filteredMyTasks.length} tasks</span>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-leaf-500" />
            <input className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-leaf-400 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-leaf-400 shadow-md text-sm font-medium" placeholder="Search my tasks…"
              value={mySearch} onChange={e => setMySearch(e.target.value)} />
          </div>

          {filteredMyTasks.length === 0 ? (
            <div className="text-center py-10">
              <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">{mySearch ? 'No tasks match your search' : 'No tasks accepted yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMyTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={clsx(
                    'w-2 h-2 rounded-full shrink-0',
                    task.status === 'COMPLETED' ? 'bg-leaf-500' :
                    task.status === 'IN_PROGRESS' ? 'bg-harvest-500' : 'bg-gray-400'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400">{task.location} · ₹{task.wage}/day</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      'badge text-xs',
                      task.status === 'COMPLETED' ? 'badge-green' :
                      task.status === 'IN_PROGRESS' ? 'badge-yellow' : 'badge-gray'
                    )}>
                      {task.status?.replace('_', ' ')}
                    </span>
                    {task.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => setChatTask(task)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Chat
                      </button>
                    )}
                    {task.status === 'COMPLETED' && !ratedTasks.has(task.id) && (
                      <button
                        onClick={() => setRatingTask(task)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-semibold transition-colors"
                      >
                        <Star className="w-3.5 h-3.5" /> Rate
                      </button>
                    )}
                    {task.status === 'COMPLETED' && ratedTasks.has(task.id) && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-400 text-xs font-semibold">
                        <Star className="w-3.5 h-3.5" /> Rated
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
