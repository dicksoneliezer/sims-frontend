import { useEffect, useMemo, useState } from 'react'
import { FiBookOpen, FiCheck, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { getOwnNotes, markNoteRead } from '../../api/self'
import { formatDate } from '../../utils/format'

export default function StudentNotes() {
  const [notes, setNotes] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)

    getOwnNotes()
      .then((response) => {
        if (active) setNotes(response ?? [])
      })
      .catch(() => {
        if (active) toast.error('Unable to load your notes.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [refreshKey])

  const visible = useMemo(
    () => notes.filter((note) => filter === 'all' || (filter === 'unread' ? !note.is_read : note.is_read)),
    [notes, filter],
  )

  const handleRead = async (note) => {
    if (note.is_read) return

    try {
      await markNoteRead(note.id)
      setNotes((current) => current.map((item) => (item.id === note.id ? { ...item, is_read: true } : item)))
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to mark note as read.')
    }
  }

  return (
    // Hapa tunaondoa AppLayout na MODULES_BY_ROLE kabisa. Tunabaki na div ya maudhui pekee.
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiBookOpen className="h-5 w-5 text-primary" /> Notes from teachers
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Read academic, attendance and performance notes addressed to you.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="all">All notes</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </section>

      {loading ? (
        <div className="rounded-xl border border-border bg-surface py-14 text-center shadow-sm"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-14 text-center text-muted-foreground shadow-sm">No notes match this filter.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((note) => (
            <article key={note.id} className={`rounded-xl border bg-surface p-5 shadow-sm ${note.is_read ? 'border-border' : 'border-blue-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">{note.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{note.teacher_name ?? 'Teacher'} · {formatDate(note.created_at)}</p>
                </div>
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold capitalize text-primary">{note.type}</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{note.note}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className={`text-xs font-medium ${note.is_read ? 'text-success' : 'text-warning'}`}>{note.is_read ? 'Read' : 'Unread'}</span>
                {!note.is_read && (
                  <button type="button" onClick={() => handleRead(note)} className="flex items-center gap-1.5 rounded-lg bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary hover:bg-blue-100">
                    <FiCheck className="h-3.5 w-3.5" /> Mark as read
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}