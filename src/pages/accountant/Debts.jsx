import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiAlertTriangle, FiCreditCard, FiRefreshCw, FiSearch, FiTrendingDown } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { listDebts } from '../../api/finance'
import { Modal } from '../../components/common/Modal'
import { PaymentForm } from '../../components/finance/PaymentForm'
import { formatDate, formatMoney } from '../../utils/format'

const PAGE_SIZE = 10

export default function Debts() {
  useLanguage()
  const [debts, setDebts] = useState([])
  const [summary, setSummary] = useState({ total_outstanding: 0, invoice_count: 0, overdue_count: 0 })
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState({ search: '', overdue: false })
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((current) => current.search === search ? current : { ...current, search })
      setPage(1)
    }, 350)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let active = true
    setLoading(true)

    listDebts({ ...query, page, per_page: PAGE_SIZE })
      .then((response) => {
        if (!active) return
        setDebts(response.data)
        setSummary(response.summary)
        setMeta(response.meta)
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load debts."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [query, page, refreshKey])

  return (
    // Hapa tunaondoa AppLayout na MODULES_BY_ROLE kabisa. Tunabaki na div ya maudhui pekee.
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiTrendingDown className="h-5 w-5 text-danger" />{t(" Outstanding debts")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Invoices with a remaining balance.")}</p>
        </div>
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">{t("Total outstanding")}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{formatMoney(summary.total_outstanding)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">{t("Debt invoices")}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{summary.invoice_count}</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-danger-soft p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-sm text-danger"><FiAlertTriangle className="h-4 w-4" />{t(" Overdue invoices")}</p>
          <p className="mt-2 text-2xl font-semibold text-danger">{summary.overdue_count}</p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("Search invoice or student")}
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={query.overdue}
              onChange={(event) => { setQuery((current) => ({ ...current, overdue: event.target.checked })); setPage(1) }}
              className="h-4 w-4 rounded border-border text-primary focus:ring-blue-500"
            />{t("Overdue only")}</label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Invoice")}</th>
                <th className="px-4 py-3">{t("Student")}</th>
                <th className="px-4 py-3">{t("Due date")}</th>
                <th className="px-4 py-3 text-right">{t("Amount")}</th>
                <th className="px-4 py-3 text-right">{t("Balance")}</th>
                <th className="px-4 py-3 text-right">{t("Action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : debts.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center text-muted-foreground">{t("No outstanding debts found.")}</td></tr>
              ) : debts.map((debt) => (
                <tr key={debt.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{debt.invoice_number}</p>
                    <p className="max-w-xs truncate text-xs text-muted-foreground">{debt.description ?? debt.fee_structure?.name ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p>{debt.student?.full_name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{debt.student?.class ?? debt.student?.student_number ?? ''}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p>{formatDate(debt.due_date)}</p>
                    {debt.is_overdue && <p className="text-xs font-medium text-danger">{debt.days_overdue}{t(" day(s) overdue")}</p>}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">{formatMoney(debt.amount)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-danger">{formatMoney(debt.balance)}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => setPaying(debt)} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-success-soft px-3 py-1.5 text-xs font-semibold text-success hover:bg-emerald-100">
                      <FiCreditCard className="h-3.5 w-3.5" />{t(" Pay")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <p>{t("Showing ")}<span className="font-medium text-foreground">{meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1}</span>–<span className="font-medium text-foreground">{Math.min(meta.current_page * meta.per_page, meta.total)}</span>{t(" of ")}<span className="font-medium text-foreground">{meta.total}</span></p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={meta.current_page <= 1 || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">{t("Previous")}</button>
            <span>{t("Page ")}{meta.current_page}{t(" of ")}{Math.max(meta.last_page, 1)}</span>
            <button type="button" onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))} disabled={meta.current_page >= meta.last_page || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">{t("Next")}</button>
          </div>
        </div>
      </section>

      {paying && (
        <Modal title={t("Record payment")} description={t("Payment for {0}.", [paying.invoice_number])} onClose={() => setPaying(null)}>
          <PaymentForm invoice={paying} onClose={() => setPaying(null)} onSaved={() => setRefreshKey((key) => key + 1)} />
        </Modal>
      )}
    </div>
  )
}