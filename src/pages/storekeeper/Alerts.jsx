import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
// src/pages/storekeeper/Alerts.jsx
import { useEffect, useMemo, useState } from 'react'
import { FiAlertCircle, FiRefreshCw, FiFilter, FiBox } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'

export default function StoreKeeperAlerts() {
  useLanguage()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/storekeeper/alerts')
      .then((res) => {
        if (!active) return
        const data = Array.isArray(res.data) ? res.data : res.data.data || []
        setAlerts(data)
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load low-stock alerts."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [refreshKey])

  const filtered = useMemo(() => {
    if (!search) return alerts
    const s = search.toLowerCase()
    return alerts.filter(
      (a) =>
        a.name?.toLowerCase().includes(s) ||
        a.item_code?.toLowerCase().includes(s) ||
        a.category?.toLowerCase().includes(s)
    )
  }, [alerts, search])

  const critical = useMemo(() => alerts.filter((a) => a.quantity === 0).length, [alerts])

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiAlertCircle className="h-5 w-5 text-danger" />{t(" Low Stock Alerts")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Items whose quantity is at or below the reorder level.")}</p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
      </section>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-warning-soft p-2.5 text-warning">
            <FiAlertCircle className="h-5 w-5" />
          </div>
          <p className="mt-4 text-2xl font-semibold text-foreground">{alerts.length}</p>
          <p className="text-sm text-muted-foreground">{t("Items below reorder level")}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-danger-soft p-2.5 text-danger">
            <FiAlertCircle className="h-5 w-5" />
          </div>
          <p className="mt-4 text-2xl font-semibold text-foreground">{critical}</p>
          <p className="text-sm text-muted-foreground">{t("Out of stock")}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-primary-soft p-2.5 text-primary">
            <FiBox className="h-5 w-5" />
          </div>
          <p className="mt-4 text-2xl font-semibold text-foreground">{alerts.length - critical}</p>
          <p className="text-sm text-muted-foreground">{t("Need reorder")}</p>
        </article>
      </section>

      {/* Search */}
      <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FiFilter className="h-4 w-4" />{t(" Search")}</div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search by name, code, or category...")}
            className="flex-1 min-w-48 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>
      </section>

      {/* Table */}
      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Item code")}</th>
                <th className="px-4 py-3">{t("Name")}</th>
                <th className="px-4 py-3">{t("Category")}</th>
                <th className="px-4 py-3 text-right">{t("Quantity")}</th>
                <th className="px-4 py-3 text-right">{t("Reorder level")}</th>
                <th className="px-4 py-3">{t("Unit")}</th>
                <th className="px-4 py-3">{t("Location")}</th>
                <th className="px-4 py-3">{t("Status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-muted-foreground">
                    {search ? t("No matching alerts.") : t("No low-stock alerts. All items are above reorder level. 🎉")}
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3 font-medium text-foreground">{a.item_code}</td>
                    <td className="px-4 py-3 text-foreground">{a.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.category}</td>
                    <td className="px-4 py-3 text-right font-semibold text-danger">{a.quantity}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{a.reorder_level}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.unit}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.location ?? '—'}</td>
                    <td className="px-4 py-3">
                      {a.quantity === 0 ? (
                        <span className="rounded-full bg-danger-soft px-2.5 py-0.5 text-xs font-semibold text-danger">{t("Out of stock")}</span>
                      ) : (
                        <span className="rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-semibold text-warning">{t("Low stock")}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}