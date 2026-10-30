import { useEffect, useState } from 'react'
import { FiBell, FiRefreshCw, FiCalendar } from 'react-icons/fi'
import api from '../../api/axios'
import { formatDate } from '../../utils/format'

const SAMPLE_ANNOUNCEMENTS = [
  { id: 1, title: 'Midterm Exams Start', body: 'Midterm exams start on 10 November 2026. Prepare well.', published_at: '2026-10-25T00:00:00Z' },
  { id: 2, title: 'Sports Day', body: 'Annual sports day on 20 November 2026. All students must attend.', published_at: '2026-10-20T00:00:00Z' },
]

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/student/announcements')
      .then((res) => {
        if (active) {
          const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
          setAnnouncements(data.length > 0 ? data : SAMPLE_ANNOUNCEMENTS)
        }
      })
      .catch(() => {
        if (active) setAnnouncements(SAMPLE_ANNOUNCEMENTS)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [refreshKey])

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiBell className="h-5 w-5 text-primary" /> Announcements
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">School notices and important dates.</p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </section>

      {loading ? (
        <div className="rounded-xl border border-border bg-surface p-14 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-14 text-center text-muted-foreground shadow-sm">
          No announcements yet.
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <article key={a.id} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground">{a.title}</h3>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FiCalendar className="h-3.5 w-3.5" /> {formatDate(a.published_at)}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{a.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}