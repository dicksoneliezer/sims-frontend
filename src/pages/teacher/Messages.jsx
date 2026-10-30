import { useEffect, useState } from 'react'
import { FiMessageSquare, FiSend, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate } from '../../utils/format'

export default function TeacherMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState({
    student_id: '',
    subject: '',
    body: '',
  })
  const [students, setStudents] = useState([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)

    Promise.all([
      api.get('/teacher/messages').catch(() => ({ data: { data: [] } })),
      api.get('/teacher/students', { params: { per_page: 100 } }).catch(() => ({ data: { data: [] } })),
    ])
      .then(([messagesRes, studentsRes]) => {
        if (!active) return
        const messagesData = Array.isArray(messagesRes.data?.data) ? messagesRes.data.data : []
        const studentsData = Array.isArray(studentsRes.data?.data)
          ? studentsRes.data.data
          : Array.isArray(studentsRes.data)
          ? studentsRes.data
          : []
        setMessages(messagesData)
        setStudents(studentsData)
      })
      .catch(() => {
        if (active) toast.error('Unable to load messages.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [refreshKey])

  const handleSend = async (e) => {
    e.preventDefault()
    setSending(true)

    try {
      const res = await api.post('/teacher/messages', form)
      toast.success('Message sent successfully')
      setForm({ student_id: '', subject: '', body: '' })
      setRefreshKey((key) => key + 1)
    } catch (error) {
      const errors = error.response?.data?.errors
      toast.error(
        errors
          ? Object.values(errors).flat()[0]
          : error.response?.data?.message ?? 'Unable to send message.',
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiMessageSquare className="h-5 w-5 text-primary" /> Parent Messages
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Send messages to parents about their child's progress, attendance, or behaviour.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </section>

      <form onSubmit={handleSend} className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-foreground">Compose message</h3>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-foreground">Student (parent recipient)</span>
          <select
            required
            value={form.student_id}
            onChange={(e) => setForm({ ...form, student_id: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
          >
            <option value="">Select a student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} — {s.student_number} ({s.class ?? '—'})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-foreground">Subject</span>
          <input
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-foreground">Message</span>
          <textarea
            required
            rows={5}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
          />
        </label>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            <FiSend className="h-4 w-4" /> {sending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold text-foreground">Sent messages</h3>
        </div>
        {loading ? (
          <div className="rounded-xl border border-border bg-surface p-14 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        ) : messages.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            No messages sent yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {messages.map((msg) => (
              <article key={msg.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{msg.subject}</h3>
                  <span className="text-xs text-muted-foreground">{formatDate(msg.created_at)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  To: {msg.parent?.full_name ?? 'Parent'}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{msg.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}