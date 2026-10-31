import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiAward, FiDownload } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate } from '../../utils/format'

const SAMPLE_CERTIFICATES = [
  { id: 1, title: 'Certificate of Completion — Form 1', issued_at: '2026-06-12T00:00:00Z', file_url: null },
  { id: 2, title: 'Best Student in Mathematics — Term 1', issued_at: '2026-06-12T00:00:00Z', file_url: null },
]

export default function StudentCertificates() {
  useLanguage()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/student/certificates')
      .then((res) => {
        if (active) {
          const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
          setCertificates(data.length > 0 ? data : SAMPLE_CERTIFICATES)
        }
      })
      .catch(() => {
        if (active) setCertificates(SAMPLE_CERTIFICATES)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [refreshKey])

  const handleDownload = (cert) => {
    if (cert.file_url) {
      window.open(cert.file_url, '_blank')
    } else {
      toast.info(t("Download simulated for \"{0}\".", [cert.title]))
    }
  }

  return (
    <div className="space-y-5">
      <section>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <FiAward className="h-5 w-5 text-primary" />{t(" Certificates")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("View and download your certificates.")}</p>
      </section>

      {loading ? (
        <div className="rounded-xl border border-border bg-surface p-14 text-center shadow-sm">
          <div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-14 text-center text-muted-foreground shadow-sm">{t("No certificates yet.")}</div>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert) => (
            <article key={cert.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-lg bg-primary-soft p-2.5 text-primary">
                  <FiAward className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{cert.title}</h3>
                  <p className="text-xs text-muted-foreground">{t("Issued ")}{formatDate(cert.issued_at)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDownload(cert)}
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