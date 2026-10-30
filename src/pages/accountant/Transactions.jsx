import { useEffect, useState } from 'react'
import { FiArrowDownLeft, FiArrowUpRight, FiRefreshCw, FiSearch, FiActivity } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { listTransactions } from '../../api/finance'
import { formatDate, formatMoney, statusClass } from '../../utils/format'

const PAGE_SIZE = 12

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState({ search: '', type: '', status: '', from: '', to: '' })
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((current) => ({ ...current, search }))
      setPage(1)
    }, 350)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let active = true
    setLoading(true)

    listTransactions({ ...query, page, per_page: PAGE_SIZE })
      .then((response) => {
        if (!active) return
        setTransactions(response.data)
        setMeta(response.meta)
      })
      .catch(() => {
        if (active) toast.error('Unable to load transactions.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [query, page, refreshKey])

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
            <FiActivity className="h-5 w-5 text-primary" /> Transactions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">All money movements recorded in the system.</p>
        </div>
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-6">
          <div className="relative md:col-span-2">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reference, student or description"
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select value={query.type} onChange={(event) => updateFilter('type', event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
            <option value="">All types</option>
            <option value="payment">Payment</option>
            <option value="expense">Expense</option>
            <option value="refund">Refund</option>
          </select>
          <select value={query.status} onChange={(event) => updateFilter('status', event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
            <option value="">All statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input type="date" value={query.from} onChange={(event) => updateFilter('from', event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" aria-label="From date" />
          <input type="date" value={query.to} onChange={(event) => updateFilter('to', event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" aria-label="To date" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-muted-foreground">No transactions found.</td></tr>
              ) : transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{transaction.transaction_ref}</p>
                    <p className="max-w-xs truncate text-xs text-muted-foreground">{transaction.invoice?.invoice_number ?? transaction.description ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{transaction.student?.full_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${transaction.type === 'payment' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                      {transaction.type === 'payment' ? <FiArrowDownLeft className="h-3 w-3" /> : <FiArrowUpRight className="h-3 w-3" />}
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{transaction.payment_method ?? '—'}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${transaction.type === 'payment' ? 'text-success' : 'text-danger'}`}>{formatMoney(transaction.amount)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusClass(transaction.status)}`}>{transaction.status}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(transaction.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <p>Showing <span className="font-medium text-foreground">{meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1}</span>–<span className="font-medium text-foreground">{Math.min(meta.current_page * meta.per_page, meta.total)}</span> of <span className="font-medium text-foreground">{meta.total}</span></p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={meta.current_page <= 1 || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">Previous</button>
            <span>Page {meta.current_page} of {Math.max(meta.last_page, 1)}</span>
            <button type="button" onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))} disabled={meta.current_page >= meta.last_page || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">Next</button>
          </div>
        </div>
      </section>
    </div>
  )
}