import { useEffect, useState } from 'react'
import { FiActivity, FiAlertTriangle, FiCreditCard, FiDollarSign, FiRefreshCw, FiSearch, FiTrendingDown } from 'react-icons/fi'
import { toast } from 'react-toastify'
import {
  getAdminFinanceOverview,
  listAdminDebts,
  listAdminExpenses,
  listAdminInvoices,
  listAdminTransactions,
} from '../../api/adminFinance'
import { AppLayout } from '../../components/layouts/AppLayout'
import { MODULES_BY_ROLE } from '../../utils/constants'
import { formatDate, formatMoney, statusClass } from '../../utils/format'

const PAGE_SIZE = 10

const TABS = [
  { key: 'invoices', label: 'Invoices', loader: listAdminInvoices },
  { key: 'transactions', label: 'Transactions', loader: listAdminTransactions },
  { key: 'expenses', label: 'Expenses', loader: listAdminExpenses },
  { key: 'debts', label: 'Debts', loader: listAdminDebts },
]

const SUMMARY = [
  { key: 'total_invoiced', label: 'Total invoiced', icon: FiDollarSign, tone: 'bg-primary-soft text-primary', money: true },
  { key: 'total_collected', label: 'Total collected', icon: FiActivity, tone: 'bg-success-soft text-success', money: true },
  { key: 'total_outstanding', label: 'Outstanding', icon: FiTrendingDown, tone: 'bg-warning-soft text-warning', money: true },
  { key: 'total_expenses', label: 'Expenses', icon: FiCreditCard, tone: 'bg-danger-soft text-danger', money: true },
  { key: 'net_income', label: 'Net income', icon: FiActivity, tone: 'bg-info-soft text-info', money: true },
  { key: 'overdue_invoices', label: 'Overdue invoices', icon: FiAlertTriangle, tone: 'bg-danger-soft text-danger', money: false },
]

function invoiceRows(items) {
  return items.map((item) => ({
    id: item.id,
    reference: item.invoice_number,
    student: item.student?.full_name ?? '-',
    description: item.description ?? '-',
    amount: item.amount,
    paid: item.amount_paid,
    balance: item.balance,
    status: item.status,
    date: item.due_date,
  }))
}

function transactionRows(items) {
  return items.map((item) => ({
    id: item.id,
    reference: item.transaction_ref,
    student: item.student?.full_name ?? '-',
    description: item.description ?? '-',
    amount: item.amount,
    method: item.payment_method,
    status: item.status,
    date: item.created_at,
  }))
}

function expenseRows(items) {
  return items.map((item) => ({
    id: item.id,
    reference: item.expense_number,
    description: item.description ?? '-',
    category: item.category,
    amount: item.amount,
    method: item.payment_method,
    paidTo: item.paid_to,
    date: item.expense_date,
  }))
}

function debtRows(items) {
  return items.map((item) => ({
    id: item.id,
    reference: item.invoice_number,
    student: item.student?.full_name ?? '-',
    description: item.description ?? '-',
    balance: item.balance,
    status: item.status,
    date: item.due_date,
    daysOverdue: item.days_overdue,
  }))
}

const ROW_BUILDERS = {
  invoices: invoiceRows,
  transactions: transactionRows,
  expenses: expenseRows,
  debts: debtRows,
}

export default function Finance() {
  const [overview, setOverview] = useState(null)
  const [tab, setTab] = useState('invoices')
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminFinanceOverview()
      .then(setOverview)
      .catch(() => toast.error('Unable to load finance overview.'))
  }, [refreshKey])

  useEffect(() => {
    let active = true
    setLoading(true)

    const loader = TABS.find((item) => item.key === tab)?.loader ?? listAdminInvoices

    loader({ search, page, per_page: PAGE_SIZE })
      .then((response) => {
        if (!active) return
        setRows(ROW_BUILDERS[tab](response.data))
        setMeta(response.meta)
      })
      .catch(() => {
        if (active) toast.error('Unable to load finance records.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [tab, search, page, refreshKey])

  const changeTab = (key) => {
    setTab(key)
    setPage(1)
    setSearch('')
  }

  return (
    <AppLayout modules={MODULES_BY_ROLE.super_admin} title="Finance">
      <div className="space-y-5">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <FiDollarSign className="h-5 w-5 text-primary" /> Finance oversight
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Read-only view of school finance activity. Operational changes are handled by accountants.</p>
          </div>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUMMARY.map((item) => (
            <article key={item.key} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className={`inline-flex rounded-lg p-2.5 ${item.tone}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">
                {overview ? (item.money ? formatMoney(overview[item.key]) : (overview[item.key] ?? 0)) : '-'}
              </p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </article>
          ))}
        </section>

        {overview && (
          <section className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="font-semibold text-foreground">Collection rate</h3>
              <p className="mt-3 text-3xl font-semibold text-success">{overview.collection_rate}%</p>
              <p className="mt-1 text-sm text-muted-foreground">{overview.pending_payments} pending payment(s)</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-success-soft0" style={{ width: `${Math.min(overview.collection_rate, 100)}%` }} />
              </div>
            </article>

            <article className="rounded-xl border border-border bg-surface p-5 shadow-sm lg:col-span-2">
              <h3 className="font-semibold text-foreground">Payment methods</h3>
              {(overview.payment_methods ?? []).length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">No completed payments yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {overview.payment_methods.map((method) => (
                    <div key={method.payment_method} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium capitalize text-foreground">{method.payment_method ?? 'Other'}</p>
                        <p className="text-xs text-muted-foreground">{method.count} payment(s)</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{formatMoney(method.total)}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        )}

        <section className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex flex-wrap gap-1">
              {TABS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => changeTab(item.key)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${tab === item.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="relative w-full max-w-sm">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1) }}
                placeholder="Search records"
                className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Student / Paid to</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-14 text-center text-muted-foreground">No records found.</td></tr>
                ) : rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3 font-medium text-foreground">{row.reference}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.student ?? row.paidTo ?? '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{row.description}</p>
                      {row.category && <p className="text-xs text-muted-foreground">{row.category}</p>}
                      {row.method && <p className="text-xs text-muted-foreground capitalize">{row.method}</p>}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {formatMoney(row.amount ?? row.balance)}
                      {(tab === 'invoices' || tab === 'debts') && row.balance !== undefined && (
                        <p className="text-xs font-normal text-muted-foreground">Balance {formatMoney(row.balance)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(row.date)}
                      {tab === 'debts' && row.daysOverdue > 0 && <p className="text-xs text-danger">{row.daysOverdue} days overdue</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusClass(row.status)}`}>{row.status ?? '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <p>Page <span className="font-medium text-foreground">{meta.current_page}</span> of <span className="font-medium text-foreground">{Math.max(meta.last_page, 1)}</span> · {meta.total} records</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={meta.current_page <= 1 || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">Previous</button>
              <button type="button" onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))} disabled={meta.current_page >= meta.last_page || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">Next</button>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
