import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useCallback, useEffect, useState } from 'react'
import { FiBarChart2, FiDownload, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { getFinancialReport } from '../../api/finance'
import { formatDate, formatMoney } from '../../utils/format'

const firstOfMonth = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

const today = () => new Date().toISOString().slice(0, 10)

export default function Reports() {
  useLanguage()
  const [range, setRange] = useState({ from: firstOfMonth(), to: today() })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback((params) => {
    setLoading(true)

    getFinancialReport(params)
      .then(setReport)
      .catch(() => toast.error(t("Unable to generate report.")))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load(range)
  }, [load, range])

  const handleExport = () => {
    if (!report) return

    const rows = [
      ['Financial report', `${report.period.from} to ${report.period.to}`],
      [],
      ['Metric', 'Amount (TZS)'],
      ['Total invoiced', report.total_invoiced],
      ['Total collected', report.total_collected],
      ['Total outstanding', report.total_outstanding],
      ['Total expenses', report.total_expenses],
      ['Net income', report.net_income],
      [],
      ['Payment method', 'Transactions', 'Total (TZS)'],
      ...report.payment_methods.map((row) => [row.payment_method, row.count, row.total]),
    ]

    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `financial-report-${report.period.from}-to-${report.period.to}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const cards = report ? [
    { label: 'Invoiced', value: report.total_invoiced, tone: 'text-foreground' },
    { label: 'Collected', value: report.total_collected, tone: 'text-success' },
    { label: 'Outstanding', value: report.total_outstanding, tone: 'text-warning' },
    { label: 'Expenses', value: report.total_expenses, tone: 'text-danger' },
    { label: 'Net income', value: report.net_income, tone: report.net_income >= 0 ? 'text-success' : 'text-danger' },
  ] : []

  return (
    // Hapa tunaondoa AppLayout na MODULES_BY_ROLE kabisa. Tunabaki na div ya maudhui pekee.
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiBarChart2 className="h-5 w-5 text-primary" />{t(" Financial report")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Invoicing, collection and spending for a period.")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={range.from} onChange={(event) => setRange((current) => ({ ...current, from: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" aria-label={t("From date")} />
          <span className="text-sm text-muted-foreground">{t("to")}</span>
          <input type="date" value={range.to} onChange={(event) => setRange((current) => ({ ...current, to: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" aria-label={t("To date")} />
          <button type="button" onClick={() => load(range)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Run")}</button>
          <button type="button" onClick={handleExport} disabled={!report} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
            <FiDownload className="h-4 w-4" />{t(" Export CSV")}</button>
        </div>
      </section>

      {report && (
        <p className="text-sm text-muted-foreground">{t("Period: ")}<span className="font-medium text-foreground">{formatDate(report.period.from)}</span>{t(" to ")}<span className="font-medium text-foreground">{formatDate(report.period.to)}</span></p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {loading && !report ? (
          <div className="col-span-full rounded-xl border border-border bg-surface p-10 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
        ) : cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{t(card.label)}</p>
            <p className={`mt-2 text-xl font-semibold ${card.tone}`}>{formatMoney(card.value)}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-semibold text-foreground">{t("Collections by payment method")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Method")}</th>
                <th className="px-4 py-3 text-right">{t("Transactions")}</th>
                <th className="px-4 py-3 text-right">{t("Total")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!report || report.payment_methods.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">{t("No collections in this period.")}</td></tr>
              ) : report.payment_methods.map((row) => (
                <tr key={row.payment_method} className="hover:bg-muted/70">
                  <td className="px-4 py-3 font-medium capitalize text-foreground">{t(row.payment_method)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{row.count}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}