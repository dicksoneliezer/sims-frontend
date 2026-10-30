// src/pages/matron/Messages.jsx
import { useEffect, useRef, useState } from 'react'
import { FiMail, FiRefreshCw, FiPlus, FiX, FiSend } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate } from '../../utils/format'

const PAGE_SIZE = 20

export default function MatronMessages() {
  const [messages, setMessages] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)

  const studentsLoaded = useRef(false)

  const [form, setForm] = useState({ student_id: '', subject: '', message: '' })

  // =========================================
  // 1. Load students MARA MOJA tu (sio kila refresh)
  // =========================================
  useEffect(() => {
    if (studentsLoaded.current) return

    let active = true
    setStudentsLoading(true)

    api.get('/matron/students', { params: { per_page: 50 } })
      .then((res) => {
        if (!active) return
        const data = Array.isArray(res.data) ? res.data : res.data.data || []
        setStudents(data)
        studentsLoaded.current = true
      })
      .catch(() => {
        if (active) toast.error('Unable to load students.')
      })
      .finally(() => {
        if (active) setStudentsLoading(false)
      })

    return () => { active = false }
  }, [])

  // =========================================
  // 2. Load messages (pagination + refreshKey)
  // =========================================
  useEffect(() => {
    let active = true
    setLoading(true)

    const timer = setTimeout(() => {
      api.get('/matron/messages', { params: { page, per_page: PAGE_SIZE } })
        .then((res) => {
          if (!active) return
          const data = Array.isArray(res.data) ? res.data : res.data.data || []
          setMessages(data)
          setMeta(res.data.meta || { current_page: page, per_page: PAGE_SIZE, total: data.length, last_page: 1 })
        })
        .catch(() => {
          if (active) toast.error('Unable to load messages.')
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 200)

    return () => {
      clearTimeout(timer)
      active = false
    }
  }, [refreshKey, page])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.student_id || !form.subject || !form.message) {
      toast.error('Please fill all fields.')
      return
    }
    try {
      setSaving(true)
      await api.post('/matron/messages', form)
      toast.success('Message sent to parent.')
      setShowForm(false)
      setForm({ student_id: '', subject: '', message: '' })
      setPage(1)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to send message.')
    } finally {
      setSaving(false)
    }
  }

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const to = Math.min(meta.current_page * meta.per_page, meta.total)

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiMail className="h-5 w-5 text-primary" /> Messages to Parents
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Send messages to parents about boarding matters.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            {showForm ? <FiX className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />} {showForm ? 'Close' : 'New Message'}
          </button>
        </div>
      </section>

      {/* Form */}
      {showForm && (
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h3 className="font-semibold text-foreground">Send a new message</h3>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Student (message goes to their parent)</span>
              <select
                name="student_id"
                value={form.student_id}
                onChange={handleChange}
                required
                disabled={studentsLoading}
                className="rounded-lg border border-border bg-surface px-3 py-2 disabled:opacity-60"
              >
                <option value="">{studentsLoading ? 'Loading students...' : 'Select student'}</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name} ({s.student_number})</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Subject</span>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                maxLength={150}
                className="rounded-lg border border-border bg-surface px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Message</span>
              <textarea
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                required
                className="rounded-lg border border-border bg-surface px-3 py-2"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
              >
                <FiSend className="h-4 w-4" /> {saving ? 'Sending...' : 'Send message'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Messages list */}
      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-semibold text-foreground">Sent messages</h3>
          <p className="text-sm text-muted-foreground">
            {meta.total} {meta.total === 1 ? 'message' : 'messages'} found
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-14 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
            </div>
          ) : messages.length === 0 ? (
            <p className="px-4 py-14 text-center text-muted-foreground">No messages sent yet.</p>
          ) : (
            messages.map((m) => (
              <article key={m.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{m.subject}</h3>
                    <p className="text-xs text-muted-foreground">
                      To: {m.parent?.full_name ?? '—'} · About: {m.student?.full_name ?? '—'} · {formatDate(m.created_at)}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${m.is_read ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'}`}>
                    {m.is_read ? 'Read' : 'Unread'}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{m.message}</p>
              </article>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && messages.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <p>
              Showing <span className="font-medium text-foreground">{from}</span>–
              <span className="font-medium text-foreground">{to}</span> of{' '}
              <span className="font-medium text-foreground">{meta.total}</span> messages
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.current_page <= 1}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-1">
                Page {meta.current_page} of {Math.max(meta.last_page, 1)}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={meta.current_page >= meta.last_page}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}