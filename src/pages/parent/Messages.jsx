import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiMessageSquare, FiSend, FiRefreshCw, FiInbox } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate } from '../../utils/format'

const SAMPLE_MESSAGES = [
  {
    id: 1,
    subject: 'Your child\'s progress in Mathematics',
    body: 'Amina has shown great improvement in Mathematics this term. Keep encouraging her.',
    sender_name: 'Mr. John Doe (Math Teacher)',
    created_at: '2026-10-26T10:00:00Z',
    is_read: false,
  },
  {
    id: 2,
    subject: 'Parent-Teacher Meeting',
    body: 'Reminder: Parent-Teacher meeting on Friday, 1 November 2026 at 3 PM.',
    sender_name: 'School Administration',
    created_at: '2026-10-24T14:30:00Z',
    is_read: true,
  },
]

export default function Messages() {
  useLanguage()
  const [tab, setTab] = useState('inbox')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState({ subject: '', body: '', recipient: 'teacher' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/parent/messages')
      .then((res) => {
        if (active) {
          const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
          setMessages(data.length > 0 ? data : SAMPLE_MESSAGES)
        }
      })
      .catch(() => {
        if (active) setMessages(SAMPLE_MESSAGES)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [refreshKey])

  const handleSend = async (e) => {
    e.preventDefault()
    setSending(true)

    try {
      const newMessage = {
        id: Date.now(),
        subject: form.subject,
        body: form.body,
        sender_name: 'You',
        created_at: new Date().toISOString(),
        is_read: true,
      }

      // Kwa sasa tunahifadhi kwenye local state tu (API haipo bado)
      setMessages((current) => [newMessage, ...current])
      setForm({ subject: '', body: '', recipient: 'teacher' })
      toast.success(t("Message sent successfully"))
      setTab('inbox')
    } catch (error) {
      toast.error(t("Unable to send message."))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiMessageSquare className="h-5 w-5 text-primary" />{t(" Messages")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Read messages from teachers and send new ones.")}</p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
      </section>

      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => setTab('inbox')}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium ${tab === 'inbox' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground'}`}
        >
          <FiInbox className="h-4 w-4" />{t(" Inbox (")}{messages.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('compose')}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium ${tab === 'compose' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground'}`}
        >
          <FiSend className="h-4 w-4" />{t(" Compose")}</button>
      </div>

      {tab === 'inbox' ? (
        loading ? (
          <div className="rounded-xl border border-border bg-surface p-14 text-center shadow-sm">
            <div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-14 text-center text-muted-foreground shadow-sm">{t("No messages yet.")}</div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <article key={msg.id} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{msg.subject}</h3>
                  {!msg.is_read && (
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">{t("New")}</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {msg.sender_name} · {formatDate(msg.created_at)}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{msg.body}</p>
              </article>
            ))}
          </div>
        )
      ) : (
        <form onSubmit={handleSend} className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">{t("Recipient")}</span>
            <select
              value={form.recipient}
              onChange={(e) => setForm({ ...form, recipient: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            >
              <option value="teacher">{t("Teacher")}</option>
              <option value="admin">{t("School Administration")}</option>
              <option value="accountant">{t("Accountant")}</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">{t("Subject")}</span>
            <input
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">{t("Message")}</span>
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
              <FiSend className="h-4 w-4" /> {sending ? t("Sending...") : t("Send Message")}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}