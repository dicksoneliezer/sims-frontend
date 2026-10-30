import { useEffect, useMemo, useState } from 'react'
import { FiUsers, FiRefreshCw, FiSearch, FiLogOut, FiSmartphone, FiMonitor } from 'react-icons/fi'
import { toast } from 'react-toastify'

const STORAGE_KEY = 'system_sessions'

const SAMPLE_SESSIONS = [
  {
    id: 'sess-001',
    user_name: 'Super Administrator',
    username: 'admin',
    role: 'super_admin',
    ip_address: '127.0.0.1',
    user_agent: 'Chrome on Windows',
    device: 'desktop',
    last_activity: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    login_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'sess-002',
    user_name: 'School Accountant',
    username: 'accountant',
    role: 'accountant',
    ip_address: '127.0.0.1',
    user_agent: 'Firefox on Windows',
    device: 'desktop',
    last_activity: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    login_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'sess-003',
    user_name: 'Class Teacher',
    username: 'teacher',
    role: 'teacher',
    ip_address: '127.0.0.1',
    user_agent: 'Safari on iPhone',
    device: 'mobile',
    last_activity: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    login_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'sess-004',
    user_name: 'Demo Student',
    username: 'student',
    role: 'student',
    ip_address: '127.0.0.1',
    user_agent: 'Chrome on Android',
    device: 'mobile',
    last_activity: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    login_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
]

function loadSessions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : SAMPLE_SESSIONS
  } catch {
    return SAMPLE_SESSIONS
  }
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

const ROLE_TONE = {
  super_admin: 'bg-primary-soft text-primary',
  system_admin: 'bg-primary-soft text-primary',
  accountant: 'bg-success-soft text-success',
  teacher: 'bg-warning-soft text-warning',
  academic_teacher: 'bg-warning-soft text-warning',
  student: 'bg-muted text-muted-foreground',
  parent: 'bg-muted text-muted-foreground',
  store_keeper: 'bg-info-soft text-info',
  matron: 'bg-info-soft text-info',
}

export default function SystemAdminSessions() {
  const [sessions, setSessions] = useState([])
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')

  useEffect(() => {
    const initial = loadSessions()
    setSessions(initial)
    saveSessions(initial)
  }, [])

  const filtered = useMemo(() => {
    return sessions.filter((session) => {
      if (role && session.role !== role) return false
      if (search && !`${session.user_name} ${session.username} ${session.ip_address}`.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [sessions, role, search])

  const handleRefresh = () => {
    const refreshed = loadSessions()
    setSessions(refreshed)
    toast.success('Sessions refreshed')
  }

  const handleTerminate = (session) => {
    if (!window.confirm(`Terminate session for ${session.user_name}?`)) return

    const updated = sessions.filter((s) => s.id !== session.id)
    setSessions(updated)
    saveSessions(updated)
    toast.success(`Session for ${session.user_name} terminated`)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString()
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiUsers className="h-5 w-5 text-primary" /> User Sessions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">View active user sessions and manage logins.</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <FiRefreshCw className="h-4 w-4" /> Refresh
        </button>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, username or IP"
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">All roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="system_admin">System Admin</option>
            <option value="academic_teacher">Academic Teacher</option>
            <option value="teacher">Teacher</option>
            <option value="accountant">Accountant</option>
            <option value="store_keeper">Store Keeper</option>
            <option value="matron">Matron</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Last Activity</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-muted-foreground">
                    No active sessions found.
                  </td>
                </tr>
              ) : (
                filtered.map((session) => (
                  <tr key={session.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{session.user_name}</p>
                      <p className="text-xs text-muted-foreground">@{session.username}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ROLE_TONE[session.role] ?? 'bg-muted text-muted-foreground'}`}>
                        {session.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        {session.device === 'mobile' ? <FiSmartphone className="h-3.5 w-3.5" /> : <FiMonitor className="h-3.5 w-3.5" />}
                        {session.user_agent}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{session.ip_address}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(session.last_activity)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleTerminate(session)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger-soft"
                      >
                        <FiLogOut className="h-3.5 w-3.5" /> Terminate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}