import { useState, useEffect } from 'react'
import { Search, UserCheck, UserX, Tractor, HardHat, Trash2, Phone, Mail } from 'lucide-react'
import { userAPI } from '../services/api'
import { toast } from 'react-toastify'
import clsx from 'clsx'

const TABS = ['ALL', 'FARMERS', 'WORKERS']

export default function UsersPage() {
  const [users, setUsers]   = useState([])
  const [tab, setTab]       = useState('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await userAPI.getAll()
      setUsers(res.data || [])
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadUsers() }, [])

  const filtered = users
    .filter(u => tab === 'ALL' || (tab === 'FARMERS' ? u.role === 'FARMER' : u.role === 'WORKER'))
    .filter(u => {
      const q = search.toLowerCase()
      return !q || u.fullName?.toLowerCase().includes(q) || u.userId?.toLowerCase().includes(q) || u.phone?.includes(q)
    })

  const toggleStatus = async (id, current) => {
    try {
      await userAPI.updateStatus(id, current === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')
      toast.success('Status updated')
      loadUsers()
    } catch { toast.error('Update failed') }
  }

  const deleteUser = async (id) => {
    if (!confirm('Delete this user permanently?')) return
    try {
      await userAPI.delete(id)
      toast.success('User deleted')
      loadUsers()
    } catch { toast.error('Delete failed') }
  }

  const farmers = users.filter(u => u.role === 'FARMER').length
  const workers = users.filter(u => u.role === 'WORKER').length

  return (
    <div className="space-y-5">
      <div className="animate-fade-up">
        <h2 className="font-display text-2xl font-bold text-gray-800">User Management</h2>
        <p className="text-gray-500 text-sm">{users.length} total users registered</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        {[
          { label: 'Total', value: users.length, color: 'bg-gray-100 text-gray-700' },
          { label: 'Farmers', value: farmers,    color: 'bg-leaf-100 text-leaf-700',  icon: Tractor },
          { label: 'Workers', value: workers,    color: 'bg-soil-100 text-soil-700',  icon: HardHat },
        ].map(c => (
          <div key={c.label} className={clsx('card flex items-center gap-3', c.color)}>
            {c.icon && <c.icon className="w-5 h-5" />}
            <div>
              <p className="text-xs font-medium">{c.label}</p>
              <p className="font-display text-2xl font-bold">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="card !p-4 flex flex-col sm:flex-row gap-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9" placeholder="Search by name, ID or phone…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={clsx(
                'px-4 py-2 rounded-xl text-xs font-semibold border transition-all',
                tab === t ? 'bg-leaf-600 text-white border-leaf-600' : 'bg-white text-gray-500 border-gray-200'
              )}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden animate-fade-up" style={{ animationDelay: '0.15s' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-leaf-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-gray-400 text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>ID</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold',
                          u.role === 'FARMER' ? 'bg-field-gradient' : 'bg-earth-gradient'
                        )}>
                          {u.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{u.fullName}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[140px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="font-mono text-xs text-gray-600">{u.userId}</span></td>
                    <td>
                      <span className={clsx('badge', u.role === 'FARMER' ? 'badge-green' : 'badge-soil')}>
                        {u.role === 'FARMER' ? <Tractor className="w-3 h-3" /> : <HardHat className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{u.phone}</div>
                      </div>
                    </td>
                    <td>
                      <span className={clsx(
                        'badge',
                        u.status === 'ACTIVE' ? 'badge-green' : 'badge-red'
                      )}>
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleStatus(u.id, u.status || 'ACTIVE')}
                          className={clsx(
                            'p-1.5 rounded-lg transition-colors',
                            u.status === 'ACTIVE'
                              ? 'text-red-500 hover:bg-red-100'
                              : 'text-leaf-600 hover:bg-leaf-100'
                          )}
                          title={u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        >
                          {u.status === 'ACTIVE' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteUser(u.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
