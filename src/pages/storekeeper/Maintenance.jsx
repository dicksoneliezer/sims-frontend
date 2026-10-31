import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiTool, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate, formatMoney } from '../../utils/format'

export default function StoreKeeperMaintenance() {
  useLanguage()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get('/storekeeper/maintenance', { params: { per_page: 50 } })
      .then((res) => {
        if (active) setRecords(res.data.data || [])
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load maintenance records."))
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
            <FiTool className="h-5 w-5 text-primary" />{t(" Maintenance Records")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Track asset maintenance and repairs.")}</p>
        </div>
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Asset")}</th>
                <th className="px-4 py-3">{t("Date")}</th>
                <th className="px-4 py-3">{t("Description")}</th>
                <th className="px-4 py-3 text-right">{t("Cost")}</th>
                <th className="px-4 py-3">{t("Performed By")}</th>
                <th className="px-4 py-3">{t("Status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center text-muted-foreground">{t("No maintenance records found.")}</td></tr>
              ) : records.map((record) => (
                <tr key={record.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3 font-medium text-foreground">{record.asset?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(record.maintenance_date)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{record.description}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatMoney(record.cost)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{record.performed_by ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      record.status === 'completed' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'
                    }`}>{t(record.status)}</span>
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