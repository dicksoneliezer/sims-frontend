import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate } from '../../utils/format'

export default function MatronIncidents() {
  useLanguage()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get('/matron/incidents')
      .then((res) => {
        if (active) setIncidents(res.data.data || [])
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load incidents."))
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
            <FiAlertTriangle className="h-5 w-5 text-primary" />{t(" Incidents")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Record and review boarding incidents.")}</p>
        </div>
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Incident")}</th>
                <th className="px-4 py-3">{t("Student")}</th>
                <th className="px-4 py-3">{t("Date")}</th>
                <th className="px-4 py-3">{t("Severity")}</th>
                <th className="px-4 py-3">{t("Status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-14 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : incidents.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-14 text-center text-muted-foreground">{t("No incidents found.")}</td></tr>
              ) : incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3 font-medium text-foreground">{incident.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{incident.student?.full_name || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(incident.incident_date)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      incident.severity === 'high' ? 'bg-danger-soft text-danger' : 
                      incident.severity === 'medium' ? 'bg-warning-soft text-warning' : 
                      'bg-success-soft text-success'
                    }`}>
                      {t(incident.severity)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${incident.status === 'open' ? 'bg-warning-soft text-warning' : 'bg-success-soft text-success'}`}>
                      {t(incident.status)}
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