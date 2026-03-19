import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, Users, User, LogOut,
  Menu, X, Wheat, Bell, ChevronDown, Tractor, HardHat, Shield, CheckCircle, Clock
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { taskAPI } from '../../services/api'
import clsx from 'clsx'

const NAV_CONFIG = {
  ADMIN: [
    { to: '/admin',       icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/tasks', icon: ClipboardList,   label: 'All Tasks' },
    { to: '/admin/users', icon: Users,           label: 'Users' },
    { to: '/admin/profile',icon: User,           label: 'Profile' },
  ],
  FARMER: [
    { to: '/farmer',        icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/farmer/tasks',  icon: ClipboardList,   label: 'My Tasks' },
    { to: '/farmer/profile',icon: User,            label: 'Profile' },
  ],
  WORKER: [
    { to: '/worker',        icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/worker/tasks',  icon: ClipboardList,   label: 'Jobs' },
    { to: '/worker/profile',icon: User,            label: 'Profile' },
  ],
}

const RoleIcon = ({ role }) => {
  if (role === 'FARMER') return <Tractor className="w-4 h-4" />
  if (role === 'WORKER') return <HardHat className="w-4 h-4" />
  return <Shield className="w-4 h-4" />
}

const roleBadge = {
  ADMIN:  'badge-yellow',
  FARMER: 'badge-green',
  WORKER: 'badge-soil',
}

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen]   = useState(true)
  const [profileOpen, setProfileOpen]   = useState(false)
  const [notifOpen, setNotifOpen]       = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]   = useState(0)
  const prevTasksRef = useRef({})
  const notifRef = useRef(null)
  const navItems = NAV_CONFIG[role] || []

  // Poll tasks to generate notifications
  useEffect(() => {
    if (role !== 'FARMER') return
    const check = async () => {
      try {
        const res = await taskAPI.getMyTasks()
        const tasks = res.data || []
        const newNotifs = []
        tasks.forEach(task => {
          const prev = prevTasksRef.current[task.id]
          if (prev && prev.status === 'PENDING' && task.status === 'IN_PROGRESS' && task.worker) {
            newNotifs.push({
              id: `${task.id}-accepted-${Date.now()}`,
              type: 'ACCEPTED',
              message: `${task.worker.fullName} accepted "${task.title}"`,
              time: new Date().toLocaleTimeString(),
              read: false,
            })
          }
          if (prev && prev.status === 'IN_PROGRESS' && task.status === 'COMPLETED') {
            newNotifs.push({
              id: `${task.id}-completed-${Date.now()}`,
              type: 'COMPLETED',
              message: `Task "${task.title}" has been completed`,
              time: new Date().toLocaleTimeString(),
              read: false,
            })
          }
        })
        prevTasksRef.current = Object.fromEntries(tasks.map(t => [t.id, { status: t.status }]))
        if (newNotifs.length > 0) {
          setNotifications(prev => [...newNotifs, ...prev].slice(0, 20))
          setUnreadCount(c => c + newNotifs.length)
        }
      } catch {}
    }
    check()
    const interval = setInterval(check, 15000)
    return () => clearInterval(interval)
  }, [role])

  // Poll for worker notifications
  useEffect(() => {
    if (role !== 'WORKER') return
    const check = async () => {
      try {
        const res = await taskAPI.getMyTasks()
        const tasks = res.data || []
        const newNotifs = []
        tasks.forEach(task => {
          const prev = prevTasksRef.current[task.id]
          if (!prev && task.status === 'IN_PROGRESS') {
            // first load — skip
          } else if (prev && prev.status === 'IN_PROGRESS' && task.status === 'COMPLETED') {
            newNotifs.push({
              id: `${task.id}-done-${Date.now()}`,
              type: 'COMPLETED',
              message: `Task "${task.title}" marked complete. Rate the farmer!`,
              time: new Date().toLocaleTimeString(),
              read: false,
            })
          }
        })
        prevTasksRef.current = Object.fromEntries(tasks.map(t => [t.id, { status: t.status }]))
        if (newNotifs.length > 0) {
          setNotifications(prev => [...newNotifs, ...prev].slice(0, 20))
          setUnreadCount(c => c + newNotifs.length)
        }
      } catch {}
    }
    check()
    const interval = setInterval(check, 15000)
    return () => clearInterval(interval)
  }, [role])

  // Close notif panel on outside click
  useEffect(() => {
    const handler = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-body">
      {/* Sidebar */}
      <aside className={clsx(
        'flex flex-col border-r border-green-900 transition-all duration-300 shrink-0 shadow-lg',
        'bg-gradient-to-b from-[#1a3a1a] via-[#1f4a1f] to-[#163016]',
        sidebarOpen ? 'w-60' : 'w-16'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-green-800/50">
          <div className="w-8 h-8 rounded-xl bg-field-gradient flex items-center justify-center shrink-0 shadow-leaf">
            <Wheat className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-display font-bold text-white text-sm leading-tight">FWMS</p>
              <p className="text-xs text-green-300 truncate">Farm Management</p>
            </div>
          )}
        </div>

        {/* Role badge */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-green-800/50">
            <span className={clsx('badge', roleBadge[role] || 'badge-gray')}>
              <RoleIcon role={role} />
              {role}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'bg-green-600 text-yellow-200 shadow-md'
                    : 'text-emerald-300 hover:text-yellow-200 hover:bg-green-800/60',
                  !sidebarOpen && 'justify-center px-2'
                )
              }
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-green-800/50">
          <button
            onClick={handleLogout}
            className={clsx(
              'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium',
              'text-red-300 hover:bg-red-900/40 hover:text-red-200 transition-all duration-200',
              !sidebarOpen && 'justify-center px-2'
            )}
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="bg-gradient-to-r from-[#1a3a1a] via-[#1f4a1f] to-[#2d6a2d] px-6 py-3 flex items-center justify-between shrink-0 shadow-md z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="p-2 rounded-xl hover:bg-green-800/50 text-green-200 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="font-display font-bold text-white text-lg leading-tight">
                {role === 'ADMIN' ? 'Admin Control Panel' : role === 'FARMER' ? 'Farmer Portal' : 'Worker Portal'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(v => !v); if (!notifOpen) markAllRead() }}
                className="relative p-2 rounded-xl hover:bg-green-800/50 text-green-200 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-800 text-sm">Notifications</p>
                    <button onClick={markAllRead} className="text-xs text-leaf-600 hover:text-leaf-700 font-medium">Mark all read</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={clsx(
                          'flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors',
                          !n.read && 'bg-leaf-50/50'
                        )}>
                          <div className={clsx(
                            'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                            n.type === 'ACCEPTED' ? 'bg-leaf-100' : 'bg-blue-100'
                          )}>
                            {n.type === 'ACCEPTED'
                              ? <CheckCircle className="w-4 h-4 text-leaf-600" />
                              : <Clock className="w-4 h-4 text-blue-600" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                          </div>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-leaf-500 shrink-0 mt-2" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(v => !v)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-green-800/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-field-gradient flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs font-bold">
                    {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-white leading-tight">{user?.fullName}</p>
                  <p className="text-xs text-green-300 font-mono">{user?.userId}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-green-300" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{user?.email}</p>
                  </div>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 dashboard-main-bg">
          <div className="page-enter max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
