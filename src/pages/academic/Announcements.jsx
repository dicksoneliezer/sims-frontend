import { useEffect, useState } from 'react'
import { FiBell, FiSend, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate } from '../../utils/format'

export default function AcademicAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState({
    title: '',
    body: '',
    audience: 'all_teachers',
  })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/academic/announcements')
      .then((res) => {
        if (active) {
          const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
          setAnnouncements(data)
        }
      })
      .catch(() => {
        if (active) toast.error('Unable to load announcements.')
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
      await api.post('/academic/announcements', form)
      toast.success('Announcement sent successfully')
      setForm({ title: '', body: '', audience: 'all_teachers' })
      setRefreshKey((key) => key + 1)
    } catch (error) {
      const errors = error.response?.data?.errors
      toast.error(
        errors
          ? Object.values(errors).flat()[0]
          : error.response?.data?.message ?? 'Unable to send announcement.',
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
            <FiBell className="h-5 w-5 text-primary" /> Academic Announcements
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Send academic announcements to teachers or selected groups.
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
        <h3 className="font-semibold text-foreground">Compose announcement</h3>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-foreground">Audience</span>
          <select
            value={form.audience}
            onChange={(e) => setForm({ ...form, audience: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
          >
            <option value="all_teachers">All Teachers</option>
            <option value="all_students">All Students</option>
            <option value="all">Everyone</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-foreground">Title</span>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
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
            <FiSend className="h-4 w-4" /> {sending ? 'Sending...' : 'Send announcement'}
          </button>
        </div>
      </form>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold text-foreground">Sent announcements</h3>
        </div>
        {loading ? (
          <div className="rounded-xl border border-border bg-surface p-14 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        ) : announcements.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            No announcements sent yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {announcements.map((item) => (
              <article key={item.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <span className="text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">To: {item.audience}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}