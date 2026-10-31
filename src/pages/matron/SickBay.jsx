import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiHeart, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate } from '../../utils/format'

export default function MatronSickBay() {
  useLanguage()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get('/matron/sick-bay')
      .then((res) => {
        if (active) setRecords(res.data.data || [])
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load sick bay records."))
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
            <FiHeart className="h-5 w-5 text-primary" />{t(" Sick Bay")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Track students admitted to the sick bay.")}</p>
        </div>
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Student")}</th>
                <th className="px-4 py-3">{t("Complaint")}</th>
                <th className="px-4 py-3">{t("Admitted")}</th>
                <th className="px-4 py-3">{t("Status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-14 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-14 text-center text-muted-foreground">{t("No sick bay records found.")}</td></tr>
              ) : records.map((record) => (
                <tr key={record.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3 font-medium text-foreground">{record.student?.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{record.complaint}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(record.admitted_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${record.status === 'admitted' ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success'}`}>
                      {t(record.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}