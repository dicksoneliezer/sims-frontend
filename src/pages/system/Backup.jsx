import { useEffect, useState } from 'react'
import { FiDatabase, FiDownload, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-toastify'

const STORAGE_KEY = 'system_backups'

function loadBackups() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveBackups(backups) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(backups))
}

export default function SystemAdminBackup() {
  const [backups, setBackups] = useState([])
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    setBackups(loadBackups())
  }, [])

  const handleCreateBackup = () => {
    setCreating(true)

    try {
      const now = new Date()
      const newBackup = {
        id: Date.now(),
        filename: `sims_backup_${now.toISOString().slice(0, 19).replace(/[:T]/g, '_')}.sql`,
        file_size: Math.floor(Math.random() * 5000000) + 1000000, // Simulated size
        type: 'manual',
        status: 'completed',
        created_at: now.toISOString(),
      }

      const updated = [newBackup, ...backups]
      setBackups(updated)
      saveBackups(updated)
      toast.success('Backup created successfully')
    } catch (error) {
      toast.error('Unable to create backup.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = (backup) => {
    if (!window.confirm(`Delete backup "${backup.filename}"?`)) return

    const updated = backups.filter((b) => b.id !== backup.id)
    setBackups(updated)
    saveBackups(updated)
    toast.success('Backup deleted')
  }

  const handleDownload = (backup) => {
    toast.info(`Downloading ${backup.filename}... (simulated)`)
  }

  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleString()
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiDatabase className="h-5 w-5 text-primary" /> Database Backup
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Create and manage database backups.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBackups(loadBackups())}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <FiRefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            type="button"
            onClick={handleCreateBackup}
            disabled={creating}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            <FiPlus className="h-4 w-4" /> {creating ? 'Creating...' : 'Create Backup'}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Filename</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Size</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-muted-foreground">
                    No backups yet. Click "Create Backup" to create one.
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3 font-medium text-foreground">{backup.filename}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{backup.type}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatSize(backup.file_size)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(backup.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleDownload(backup)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-primary-soft hover:text-primary"
                          aria-label={`Download ${backup.filename}`}
                        >
                          <FiDownload className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(backup)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                          aria-label={`Delete ${backup.filename}`}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
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