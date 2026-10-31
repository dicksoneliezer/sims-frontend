import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
// src/pages/storekeeper/Reports.jsx
import { useEffect, useMemo, useState } from 'react'
import {
  FiFileText,
  FiRefreshCw,
  FiCalendar,
  FiArchive,
  FiBox,
  FiTrendingUp,
  FiTrendingDown,
  FiTool,
  FiDollarSign,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatMoney } from '../../utils/format'

export default function StoreKeeperReports() {
  useLanguage()
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const [report, setReport] = useState(null)
  const [assetReport, setAssetReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    from: thirtyDaysAgo.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  })

  useEffect(() => {
    let active = true
    setLoading(true)

    Promise.all([
      api.get('/storekeeper/reports', { params: filters }).catch(() => ({ data: { data: null } })),
      api.get('/storekeeper/reports/assets').catch(() => ({ data: { data: null } })),
    ])
      .then(([repRes, assetRes]) => {
        if (!active) return
        setReport(repRes.data?.data ?? repRes.data ?? null)
        setAssetReport(assetRes.data?.data ?? assetRes.data ?? null)
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load reports."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [filters.from, filters.to])

  const quickRange = (days) => {
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - days)
    setFilters({
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    })
  }

  const totals = useMemo(() => {
    return {
      assetsTotal: report?.assets?.total ?? 0,
      assetsValue: report?.assets?.total_value ?? 0,
      inventoryItems: report?.inventory?.total_items ?? 0,
      inventoryValue: report?.inventory?.total_value ?? 0,
      lowStock: report?.inventory?.low_stock ?? 0,
      stockIn: report?.stock_movements?.in ?? 0,
      stockOut: report?.stock_movements?.out ?? 0,
      maintenanceCost: report?.maintenance?.total_cost ?? 0,
      maintenancePending: report?.maintenance?.pending ?? 0,
    }
  }, [report])

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiFileText className="h-5 w-5 text-primary" />{t(" Store Reports")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Reports on assets, stock, maintenance, and missing items.")}</p>
        </div>
        <button
          type="button"
          onClick={() => setFilters((p) => ({ ...p }))}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
      </section>

      {/* Period */}
      <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FiCalendar className="h-4 w-4" />{t(" Period")}</div>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>{t("From")}</span>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>{t("To")}</span>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm"
            />
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => quickRange(7)} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted">7d</button>
            <button type="button" onClick={() => quickRange(30)} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted">30d</button>
            <button type="button" onClick={() => quickRange(90)} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted">90d</button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-14">
          <div role="status" aria-label={t("Loading data")} className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="inline-flex rounded-lg bg-primary-soft p-2.5 text-primary">
                <FiArchive className="h-5 w-5" />
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">{totals.assetsTotal}</p>
              <p className="text-sm text-muted-foreground">{t("Total assets")}</p>
            </article>
            <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="inline-flex rounded-lg bg-info-soft p-2.5 text-info">
                <FiDollarSign className="h-5 w-5" />
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">{formatMoney(totals.assetsValue)}</p>
              <p className="text-sm text-muted-foreground">{t("Asset current value")}</p>
            </article>
            <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="inline-flex rounded-lg bg-success-soft p-2.5 text-success">
                <FiBox className="h-5 w-5" />
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">{totals.inventoryItems}</p>
              <p className="text-sm text-muted-foreground">{t("Inventory items")}</p>
            </article>
            <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="inline-flex rounded-lg bg-warning-soft p-2.5 text-warning">
                <FiAlertCircleIcon />
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">{totals.lowStock}</p>
              <p className="text-sm text-muted-foreground">{t("Low stock items")}</p>
            </article>
          </section>

          {/* Two columns */}
          <section className="grid gap-4 lg:grid-cols-2">
            {/* Stock movements */}
            <article className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h3 className="font-semibold text-foreground">{t("Stock movements")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("Items in and out of the store during this period.")}</p>
              <dl className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FiTrendingUp className="h-4 w-4 text-success" />{t(" Stock in")}</span>
                  <span className="font-semibold text-foreground">{totals.stockIn}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FiTrendingDown className="h-4 w-4 text-danger" />{t(" Stock out")}</span>
                  <span className="font-semibold text-foreground">{totals.stockOut}</span>
                </div>
              </dl>
            </article>

            {/* Maintenance */}
            <article className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h3 className="font-semibold text-foreground">{t("Maintenance")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("Costs and pending repairs during this period.")}</p>
              <dl className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FiTool className="h-4 w-4 text-primary" />{t(" Total cost")}</span>
                  <span className="font-semibold text-foreground">{formatMoney(totals.maintenanceCost)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FiAlertCircleIcon className="text-warning" />{t(" Pending")}</span>
                  <span className="font-semibold text-foreground">{totals.maintenancePending}</span>
                </div>
              </dl>
            </article>
          </section>

          {/* Asset breakdown */}
          {assetReport && (
            <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h3 className="font-semibold text-foreground">{t("Asset value &amp; depreciation")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("Breakdown of assets by category and status.")}</p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {/* Totals */}
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("Overall")}</p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-muted-foreground">{t("Purchase cost")}</dt><dd className="font-semibold text-foreground">{formatMoney(assetReport.totals?.purchase_cost ?? 0)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">{t("Current value")}</dt><dd className="font-semibold text-foreground">{formatMoney(assetReport.totals?.current_value ?? 0)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">{t("Depreciation")}</dt><dd className="font-semibold text-danger">{formatMoney(assetReport.totals?.depreciation ?? 0)}</dd></div>
                    <div className="flex justify-between border-t border-border pt-2"><dt className="text-muted-foreground">{t("Depreciation rate")}</dt><dd className="font-semibold text-foreground">{assetReport.totals?.depreciation_rate ?? 0}%</dd></div>
                  </dl>
                </div>

                {/* By category */}
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("By category")}</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {(assetReport.by_category ?? []).length === 0 ? (
                      <li className="text-muted-foreground">{t("No data.")}</li>
                    ) : (
                      assetReport.by_category.map((row) => (
                        <li key={row.category} className="flex justify-between">
                          <span className="text-muted-foreground">{row.category}</span>
                          <span className="font-semibold text-foreground">{row.count} · {formatMoney(row.total_current)}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* Period info */}
          <section className="rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground shadow-sm">{t("Showing data from")}<span className="font-medium text-foreground">{report?.period?.from ?? '—'}</span>{t(" to ")}<span className="font-medium text-foreground">{report?.period?.to ?? '—'}</span>.
          </section>
        </>
      )}
    </div>
  )
}

// Small icon helper to avoid re-importing
function FiAlertCircleIcon({ className = 'h-5 w-5' }) {
  useLanguage()
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}