import { useState, useEffect } from 'react'
import { Users, ClipboardList, Tractor, HardHat, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { dashboardAPI, taskAPI, userAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import clsx from 'clsx'



const StatCard = ({ icon: Icon, label, value, sub, color, delay = 0 }) => (
  <div className="stat-card animate-fade-up" style={{ animationDelay: `${delay}s` }}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="font-mono text-3xl font-bold text-gray-800 mt-1">{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={clsx('p-3 rounded-2xl', color)}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="flex gap-2">
          <span className="capitalize">{p.name}:</span>
          <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ farmers: 0, workers: 0, tasks: 0, activeTasks: 0 })
  const [recentTasks, setRecentTasks] = useState([])
  const [activityData, setActivityData] = useState([])
  const [statusData, setStatusData] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, tasksRes, chartsRes] = await Promise.all([
          dashboardAPI.adminStats().catch(() => ({ data: {} })),
          taskAPI.getAll().catch(() => ({ data: [] })),
          dashboardAPI.adminCharts().catch(() => ({ data: { activity: [], statusData: [] } }))
        ])
        setStats(statsRes.data)
        setRecentTasks((tasksRes.data || []).slice(0, 5))
        setActivityData(chartsRes.data.activity || [])
        setStatusData(chartsRes.data.statusData || [])
      } finally {
        setLoadingStats(false)
      }
    }
    load()
  }, [])

  const statCards = [
    { icon: Tractor,       label: 'Total Farmers',   value: stats.farmers,     sub: '+3 this month',    color: 'bg-leaf-100 text-leaf-700',    delay: 0 },
    { icon: HardHat,       label: 'Total Workers',   value: stats.workers,     sub: '+8 this month',    color: 'bg-soil-100 text-soil-700',    delay: 0.05 },
    { icon: ClipboardList, label: 'Total Tasks',     value: stats.tasks,       sub: 'All time',         color: 'bg-harvest-100 text-harvest-700', delay: 0.1 },
    { icon: TrendingUp,    label: 'Active Tasks',    value: stats.activeTasks, sub: 'Currently running',color: 'bg-blue-100 text-blue-700',    delay: 0.15 },
  ]

  const statusBadge = {
    COMPLETED:   'badge badge-green',
    IN_PROGRESS: 'badge badge-yellow',
    PENDING:     'badge badge-gray',
    CANCELLED:   'badge badge-red',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-up">
        <h2 className="font-display text-2xl font-bold text-gray-800">
          Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {user?.fullName?.split(' ')[0]} 👋
        </h2>
        <p className="text-gray-500 text-sm mt-1">Here's your system overview for today</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart */}
        <div className="card lg:col-span-2 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-display font-bold text-gray-800 mb-4">Activity Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="gTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2d9631" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2d9631" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="tasks" stroke="#2d9631" strokeWidth={2.5}
                fill="url(#gTasks)" name="Tasks" dot={{ r: 3, fill: '#2d9631' }} />
              <Area type="monotone" dataKey="farmers" stroke="#cc8125" strokeWidth={2}
                fill="none" name="Farmers" strokeDasharray="4 2" dot={false} />
              <Area type="monotone" dataKey="workers" stroke="#f59e0b" strokeWidth={2}
                fill="none" name="Workers" strokeDasharray="4 2" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card animate-fade-up" style={{ animationDelay: '0.25s' }}>
          <h3 className="font-display font-bold text-gray-800 mb-4">Task Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                dataKey="value" paddingAngle={3}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-gray-600">{s.name}</span>
                </div>
                <span className="font-semibold text-gray-700">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart + Recent tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="font-display font-bold text-gray-800 mb-4">Monthly Registrations</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="farmers" fill="#2d9631" name="Farmers" radius={[4,4,0,0]} />
              <Bar dataKey="workers" fill="#cc8125" name="Workers" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent tasks */}
        <div className="card animate-fade-up" style={{ animationDelay: '0.35s' }}>
          <h3 className="font-display font-bold text-gray-800 mb-4">Recent Tasks</h3>
          {recentTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No tasks yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-leaf-100 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-4 h-4 text-leaf-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400">{task.location}</p>
                  </div>
                  <span className={statusBadge[task.status] || 'badge badge-gray'}>
                    {task.status?.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
