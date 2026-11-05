import { SchoolFileLink } from '../../components/common/SchoolFileLink'
import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiRefreshCw, FiSearch, FiTrash2, FiPaperclip, FiTrendingDown } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { deleteExpense, listExpenses } from '../../api/finance'
import { Modal } from '../../components/common/Modal'
import { ExpenseForm } from '../../components/finance/ExpenseForm'
import { formatDate, formatMoney } from '../../utils/format'

const PAGE_SIZE = 10

export default function Expenses() {
  useLanguage()
  const [expenses, setExpenses] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState({ search: '', from: '', to: '' })
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)

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

    listExpenses({ ...query, page, per_page: PAGE_SIZE })
      .then((response) => {
        if (!active) return
        setExpenses(response.data)
        setMeta(response.meta)
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load expenses."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [query, page, refreshKey])

  const handleDelete = async (expense) => {
    if (!window.confirm(t("Delete expense {0}?", [expense.expense_number]))) return

    try {
      await deleteExpense(expense.id)
      toast.success(t("Expense deleted"))
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? t("Unable to delete expense."))
    }
  }

  const updateFilter = (field, value) => {
    setQuery((current) => ({ ...current, [field]: value }))
    setPage(1)
  }

  return (
    // Hapa tunaondoa AppLayout na MODULES_BY_ROLE kabisa. Tunabaki na div ya maudhui pekee.
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiTrendingDown className="h-5 w-5 text-danger" />{t(" Expenses")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Track school spending and attach receipts.")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
          <button type="button" onClick={() => setForm({ expense: null })} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
            <FiPlus className="h-4 w-4" />{t(" Record expense")}</button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("Search expense, category or payee")}
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <input type="date" value={query.from} onChange={(event) => updateFilter('from', event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" aria-label={t("From date")} />
          <input type="date" value={query.to} onChange={(event) => updateFilter('to', event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" aria-label={t("To date")} />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Expense")}</th>
                <th className="px-4 py-3">{t("Category")}</th>
                <th className="px-4 py-3">{t("Paid to")}</th>
                <th className="px-4 py-3">{t("Date")}</th>
                <th className="px-4 py-3 text-right">{t("Amount")}</th>
                <th className="px-4 py-3 text-right">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center text-muted-foreground">{t("No expenses found.")}</td></tr>
              ) : expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{expense.expense_number}</p>
                    <p className="max-w-xs truncate text-xs text-muted-foreground">{expense.description ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3"><span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">{expense.category}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{expense.paid_to ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(expense.expense_date)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(expense.amount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {expense.receipt_url && (
                        <SchoolFileLink href={expense.receipt_url} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-muted-foreground hover:bg-primary-soft hover:text-primary" aria-label={t("View receipt for {0}", [expense.expense_number])}>
                          <FiPaperclip className="h-4 w-4" />
                        </SchoolFileLink>
                      )}
                      <button type="button" onClick={() => setForm({ expense })} className="rounded-lg p-2 text-muted-foreground hover:bg-warning-soft hover:text-warning" aria-label={t("Edit {0}", [expense.expense_number])}>
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(expense)} className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger" aria-label={t("Delete {0}", [expense.expense_number])}>
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
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

      {form && (
        <Modal title={form.expense ? t("Edit expense") : t("Record expense")} onClose={() => setForm(null)}>
          <ExpenseForm expense={form.expense} onClose={() => setForm(null)} onSaved={() => setRefreshKey((key) => key + 1)} />
        </Modal>
      )}
    </div>
  )
}