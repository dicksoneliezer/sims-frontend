import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiFileText, FiRefreshCw, FiDownload } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate } from '../../utils/format'

const SAMPLE_DOCUMENTS = [
  { id: 1, title: 'School Calendar 2026', category: 'Calendar', file_url: null, created_at: '2026-01-05T00:00:00Z' },
  { id: 2, title: 'Term 1 Fee Structure', category: 'Finance', file_url: null, created_at: '2026-01-08T00:00:00Z' },
  { id: 3, title: 'School Rules and Regulations', category: 'Policy', file_url: null, created_at: '2026-01-10T00:00:00Z' },
  { id: 4, title: 'Uniform Requirements', category: 'Policy', file_url: null, created_at: '2026-02-01T00:00:00Z' },
  { id: 5, title: 'Parents Meeting Minutes', category: 'Meeting', file_url: null, created_at: '2026-09-15T00:00:00Z' },
]

export default function Documents() {
  useLanguage()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/parent/documents')
      .then((res) => {
        if (active) {
          const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
          setDocuments(data.length > 0 ? data : SAMPLE_DOCUMENTS)
        }
      })
      .catch(() => {
        if (active) setDocuments(SAMPLE_DOCUMENTS)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [refreshKey])

  const handleDownload = (doc) => {
    if (doc.file_url) {
      window.open(doc.file_url, '_blank')
    } else {
      toast.info(t("Download simulated for \"{0}\".", [doc.title]))
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiFileText className="h-5 w-5 text-primary" />{t(" School Documents")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Download school calendars, forms, and policies.")}</p>
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
      ) : documents.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-14 text-center text-muted-foreground shadow-sm">{t("No documents available.")}</div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <article key={doc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-lg bg-primary-soft p-2.5 text-primary">
                  <FiFileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{doc.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {doc.category} · {formatDate(doc.created_at)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDownload(doc)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <FiDownload className="h-3.5 w-3.5" />{t(" Download")}</button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}