import { useEffect, useMemo, useState } from 'react'
import { FiFileText, FiRefreshCw, FiTrash2, FiSearch } from 'react-icons/fi'
import { toast } from 'react-toastify'

const STORAGE_KEY = 'system_logs'

const SAMPLE_LOGS = [
  { id: 1, level: 'info', message: 'User admin logged in', module: 'Auth', created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: 2, level: 'info', message: 'Student record created', module: 'Students', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: 3, level: 'warning', message: 'Low stock alert for First Aid Kits', module: 'Inventory', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 4, level: 'error', message: 'Failed to send parent message', module: 'Communication', created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: 5, level: 'info', message: 'Database backup completed', module: 'System', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
]

function loadLogs() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : SAMPLE_LOGS
  } catch {
    return SAMPLE_LOGS
  }
}

function saveLogs(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
}

const LEVEL_TONE = {
  info: 'bg-primary-soft text-primary',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-danger-soft text-danger',
}

export default function SystemAdminLogs() {
  const [logs, setLogs] = useState([])
  const [level, setLevel] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const initial = loadLogs()
    setLogs(initial)
    saveLogs(initial)
  }, [])

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (level && log.level !== level) return false
      if (search && !`${log.message} ${log.module}`.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [logs, level, search])

  const handleClear = () => {
    if (!window.confirm('Clear all system logs?')) return
    setLogs([])
    saveLogs([])
    toast.success('System logs cleared')
  }

  const handleRefresh = () => {
    const refreshed = loadLogs()
    setLogs(refreshed)
    toast.success('Logs refreshed')
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
            <FiFileText className="h-5 w-5 text-primary" /> System Logs
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">View system activity and audit logs.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <FiRefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-danger hover:bg-danger-soft"
          >
            <FiTrash2 className="h-4 w-4" /> Clear Logs
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs by message or module"
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">All levels</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-14 text-center text-muted-foreground">
                    No logs found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${LEVEL_TONE[log.level] ?? 'bg-muted text-muted-foreground'}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{log.module}</td>
                    <td className="px-4 py-3 text-foreground">{log.message}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(log.created_at)}</td>
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