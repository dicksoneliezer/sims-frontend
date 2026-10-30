import { useEffect, useState } from 'react'
import { FiCreditCard, FiEdit2, FiPlus, FiRefreshCw, FiSearch, FiTrash2, FiUpload, FiFileText } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { deleteInvoice, listInvoices } from '../../api/finance'
import { Modal } from '../../components/common/Modal'
import { InvoiceForm } from '../../components/finance/InvoiceForm'
import { BulkInvoiceForm } from '../../components/finance/BulkInvoiceForm'
import { PaymentForm } from '../../components/finance/PaymentForm'
import { formatDate, formatMoney, statusClass } from '../../utils/format'

const PAGE_SIZE = 10

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState({ search: '', status: '' })
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [paying, setPaying] = useState(null)

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

    listInvoices({ ...query, page, per_page: PAGE_SIZE })
      .then((response) => {
        if (!active) return
        setInvoices(response.data)
        setMeta(response.meta)
      })
      .catch(() => {
        if (active) toast.error('Unable to load invoices.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [query, page, refreshKey])

  const handleDelete = async (invoice) => {
    if (!window.confirm(`Delete invoice ${invoice.invoice_number}?`)) return

    try {
      await deleteInvoice(invoice.id)
      toast.success('Invoice deleted')
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to delete invoice.')
    }
  }

  return (
    // Hapa tunaondoa AppLayout kabisa. Tunabaki na div ya maudhui pekee.
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiFileText className="h-5 w-5 text-primary" /> Invoices
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Create, generate and track student fee invoices.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button type="button" onClick={() => setBulkOpen(true)} className="flex items-center gap-2 rounded-lg border border-blue-200 bg-primary-soft px-4 py-2 text-sm font-semibold text-primary hover:bg-blue-100">
            <FiUpload className="h-4 w-4" /> Bulk generate
          </button>
          <button type="button" onClick={() => setForm({ invoice: null })} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
            <FiPlus className="h-4 w-4" /> New invoice
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
              placeholder="Search invoice number, student or description"
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={query.status}
            onChange={(event) => { setQuery((current) => ({ ...current, status: event.target.value })); setPage(1) }}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All statuses</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Balance</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-14 text-center text-muted-foreground">No invoices found.</td></tr>
              ) : invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{invoice.invoice_number}</p>
                    <p className="max-w-xs truncate text-xs text-muted-foreground">{invoice.description ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p>{invoice.student?.full_name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{invoice.student?.class ?? invoice.student?.student_number ?? ''}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">{formatMoney(invoice.amount)}</td>
                  <td className="px-4 py-3 text-right text-success">{formatMoney(invoice.amount_paid)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(invoice.balance)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p>{formatDate(invoice.due_date)}</p>
                    {invoice.is_overdue && <p className="text-xs font-medium text-danger">{invoice.days_overdue} day(s) overdue</p>}
                  </td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusClass(invoice.status)}`}>{invoice.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {invoice.balance > 0 && (
                        <button type="button" onClick={() => setPaying(invoice)} className="rounded-lg p-2 text-muted-foreground hover:bg-success-soft hover:text-success" aria-label={`Record payment for ${invoice.invoice_number}`}>
                          <FiCreditCard className="h-4 w-4" />
                        </button>
                      )}
                      <button type="button" onClick={() => setForm({ invoice })} className="rounded-lg p-2 text-muted-foreground hover:bg-warning-soft hover:text-warning" aria-label={`Edit ${invoice.invoice_number}`}>
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(invoice)} className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger" aria-label={`Delete ${invoice.invoice_number}`}>
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
          <p>Showing <span className="font-medium text-foreground">{meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1}</span>–<span className="font-medium text-foreground">{Math.min(meta.current_page * meta.per_page, meta.total)}</span> of <span className="font-medium text-foreground">{meta.total}</span></p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={meta.current_page <= 1 || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">Previous</button>
            <span>Page {meta.current_page} of {Math.max(meta.last_page, 1)}</span>
            <button type="button" onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))} disabled={meta.current_page >= meta.last_page || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">Next</button>
          </div>
        </div>
      </section>

      {form && (
        <Modal title={form.invoice ? 'Edit invoice' : 'New invoice'} description={form.invoice ? `Update ${form.invoice.invoice_number}.` : 'Create an invoice for a single student.'} onClose={() => setForm(null)}>
          <InvoiceForm invoice={form.invoice} onClose={() => setForm(null)} onSaved={() => setRefreshKey((key) => key + 1)} />
        </Modal>
      )}

      {bulkOpen && (
        <Modal title="Bulk generate invoices" description="Generate invoices from active fee structures." onClose={() => setBulkOpen(false)}>
          <BulkInvoiceForm onClose={() => setBulkOpen(false)} onSaved={() => setRefreshKey((key) => key + 1)} />
        </Modal>
      )}

      {paying && (
        <Modal title="Record payment" description={`Payment for ${paying.invoice_number}.`} onClose={() => setPaying(null)}>
          <PaymentForm invoice={paying} onClose={() => setPaying(null)} onSaved={() => setRefreshKey((key) => key + 1)} />
        </Modal>
      )}
    </div>
  )
}