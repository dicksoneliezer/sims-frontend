import { useEffect, useState } from 'react'
import { FiClipboard, FiPlus, FiRefreshCw, FiSearch, FiHash } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { listControlNumbers } from '../../api/finance'
import { Modal } from '../../components/common/Modal'
import { ControlNumberForm } from '../../components/finance/ControlNumberForm'
import { formatDate, formatMoney, statusClass } from '../../utils/format'

const PAGE_SIZE = 10

export default function ControlNumbers() {
  const [payments, setPayments] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState({ search: '', status: '' })
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)

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

    listControlNumbers({ ...query, page, per_page: PAGE_SIZE })
      .then((response) => {
        if (!active) return
        setPayments(response.data)
        setMeta(response.meta)
      })
      .catch(() => {
        if (active) toast.error('Unable to load control numbers.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [query, page, refreshKey])

  const copy = async (controlNumber) => {
    try {
      await navigator.clipboard.writeText(controlNumber)
      toast.success('Control number copied')
    } catch {
      toast.error('Unable to copy control number.')
    }
  }

  return (
    // Hapa tunaondoa AccountantLayout kabisa. Tunabaki na div ya maudhui pekee.
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiHash className="h-5 w-5 text-primary" /> Control numbers
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Generate payment control numbers for students.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button type="button" onClick={() => setFormOpen(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
            <FiPlus className="h-4 w-4" /> Generate
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search control number, reference or student"
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={query.status}
            onChange={(event) => { setQuery((current) => ({ ...current, status: event.target.value })); setPage(1) }}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Control number</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-muted-foreground">No control numbers found.</td></tr>
              ) : payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => copy(payment.control_number)} className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary">
                      {payment.control_number} <FiClipboard className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    {payment.transaction_ref && <p className="text-xs text-muted-foreground">{payment.transaction_ref}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p>{payment.student?.full_name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{payment.student?.class ?? ''}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{payment.invoice?.invoice_number ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(payment.amount)}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{payment.payment_method ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p>{formatDate(payment.created_at)}</p>
                    {payment.expires_at && <p className="text-xs text-muted-foreground">Expires {formatDate(payment.expires_at)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusClass(payment.status)}`}>{payment.status}</span>
                    {payment.is_expired && <p className="mt-0.5 text-xs text-warning">Expired</p>}
                  </td>
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

      {formOpen && (
        <Modal title="Generate control number" description="Create a payment control number for a student invoice." onClose={() => setFormOpen(false)}>
          <ControlNumberForm onClose={() => setFormOpen(false)} onSaved={() => setRefreshKey((key) => key + 1)} />
        </Modal>
      )}
    </div>
  )
}