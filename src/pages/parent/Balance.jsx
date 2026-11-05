import { FinancialSummary } from '../../components/finance/FinancialSummary'
import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiAlertTriangle, FiRefreshCw, FiTrendingUp } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { getParentBalance } from '../../api/finance'
import { formatDate, formatMoney, statusClass } from '../../utils/format'

export default function Balance() {
  useLanguage()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)

    getParentBalance()
      .then((response) => {
        if (active) setData(response)
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load balance."))
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
            <FiTrendingUp className="h-5 w-5 text-primary" />{t(" Fee balance")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Outstanding fees across all your children.")}</p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
      </section>

      {/* Total Outstanding – styled like a StatCard, not a gradient banner */}
      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="inline-flex rounded-lg bg-danger-soft p-2.5 text-danger">
          <FiTrendingUp className="h-5 w-5" />
        </div>
        <p className="mt-4 text-2xl font-semibold text-foreground">
          {formatMoney(data?.total_outstanding ?? 0)}
        </p>
        <p className="text-sm text-muted-foreground">{t("Total outstanding")}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {data?.children?.length ?? 0} {data?.children?.length === 1 ? t("child") : t("children")}{t(" linked to your account")}</p>
      </section>

      {loading ? (
        <div className="rounded-xl border border-border bg-surface p-14 text-center shadow-sm">
          <div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : !data || data.children.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-14 text-center text-muted-foreground shadow-sm">{t("No children linked to your account.")}</div>
      ) : (
        <div className="space-y-5">
          {data.children.map((child) => (
            <section key={child.student_id} className="rounded-xl border border-border bg-surface shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
                <div>
                  <h3 className="font-semibold text-foreground">{child.student_name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {child.student_number} · {child.class ?? t("No class")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{t("Invoiced")}</p>
                    <p className="font-medium text-foreground">{formatMoney(child.total_invoiced)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{t("Paid")}</p>
                    <p className="font-medium text-success">{formatMoney(child.total_paid)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{t("Outstanding")}</p>
                    <p className={`font-semibold ${child.outstanding > 0 ? 'text-danger' : 'text-success'}`}>
                      {formatMoney(child.outstanding)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4"><FinancialSummary summary={child} /></div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">{t("Invoice")}</th>
                      <th className="px-4 py-3">{t("Due date")}</th>
                      <th className="px-4 py-3 text-right">{t("Amount")}</th>
                      <th className="px-4 py-3 text-right">{t("Paid")}</th>
                      <th className="px-4 py-3 text-right">{t("Balance")}</th>
                      <th className="px-4 py-3">{t("Status")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {child.invoices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{t("No invoices.")}</td>
                      </tr>
                    ) : (
                      child.invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-muted/70">
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">{invoice.invoice_number}</p>
                            <p className="max-w-xs truncate text-xs text-muted-foreground">
                              {invoice.description ?? '—'}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            <p>{formatDate(invoice.due_date)}</p>
                            {invoice.is_overdue && (
                              <p className="flex items-center gap-1 text-xs font-medium text-danger">
                                <FiAlertTriangle className="h-3 w-3" />{t(" Overdue")}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground">{formatMoney(invoice.amount)}</td>
                          <td className="px-4 py-3 text-right text-success">{formatMoney(invoice.amount_paid)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(invoice.balance)}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusClass(invoice.status)}`}>
                              {t(invoice.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}