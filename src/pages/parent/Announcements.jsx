import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiBell, FiRefreshCw, FiCalendar, FiTag } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate } from '../../utils/format'

const SAMPLE_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Term 2 Parents Meeting',
    body: 'All parents are invited to the Term 2 parents meeting on 15 November 2026 at 9:00 AM in the school hall.',
    category: 'meeting',
    published_at: '2026-10-25T08:00:00Z',
  },
  {
    id: 2,
    title: 'Midterm Examinations Start',
    body: 'Midterm examinations will start on 10 November 2026. Please ensure your child is well prepared.',
    category: 'exam',
    published_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 3,
    title: 'School Fees Deadline',
    body: 'All outstanding school fees for Term 2 must be paid by 30 November 2026 to avoid penalties.',
    category: 'finance',
    published_at: '2026-10-15T14:30:00Z',
  },
  {
    id: 4,
    title: 'Graduation Ceremony',
    body: 'The graduation ceremony for Form 4 students will be held on 5 December 2026.',
    category: 'event',
    published_at: '2026-10-10T09:00:00Z',
  },
]

const CATEGORY_TONE = {
  meeting: 'bg-primary-soft text-primary',
  exam: 'bg-warning-soft text-warning',
  finance: 'bg-danger-soft text-danger',
  event: 'bg-success-soft text-success',
  general: 'bg-muted text-muted-foreground',
}

export default function Announcements() {
  useLanguage()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/parent/announcements')
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

    return () => {
      active = false
    }
  }, [refreshKey])

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiBell className="h-5 w-5 text-primary" />{t(" Announcements")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("School notices, events, and important dates.")}</p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
      </section>

      {loading ? (
        <div className="rounded-xl border border-border bg-surface p-14 text-center shadow-sm">
          <div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-14 text-center text-muted-foreground shadow-sm">{t("No announcements yet.")}</div>
      ) : (
        <div className="space-y-3">
          {announcements.map((item) => (
            <article key={item.id} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FiCalendar className="h-3.5 w-3.5" />
                    {formatDate(item.published_at)}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${CATEGORY_TONE[item.category] ?? CATEGORY_TONE.general}`}>
                  <FiTag className="mr-1 inline h-3 w-3" />
                  {item.category}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}