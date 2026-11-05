import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiDollarSign, FiRefreshCw, FiSearch, FiPlus } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { listTransactions, listInvoices } from '../../api/finance'
import { Modal } from '../../components/common/Modal'
import { PaymentForm } from '../../components/finance/PaymentForm'
import { formatDate, formatMoney, statusClass } from '../../utils/format'

const PAGE_SIZE = 10

export default function AccountantPayments() {
  useLanguage()
  const [transactions, setTransactions] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState({ search: '' })
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Hali ya kuchagua invoice
  const [invoicePickerOpen, setInvoicePickerOpen] = useState(false)
  const [invoices, setInvoices] = useState([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  
  // Hali ya PaymentForm
  const [selectedInvoice, setSelectedInvoice] = useState(null)

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

    listTransactions({ ...query, type: 'payment', page, per_page: PAGE_SIZE })
      .then((response) => {
        if (!active) return
        setTransactions(response.data)
        setMeta(response.meta)
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load payments."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [query, page, refreshKey])

  // Fungua invoice picker
  const openInvoicePicker = () => {
    setInvoicePickerOpen(true)
    setInvoicesLoading(true)
    listInvoices({ per_page: 50, status: 'unpaid' })
      .then((response) => setInvoices(response.data || []))
      .catch(() => toast.error(t("Unable to load invoices.")))
      .finally(() => setInvoicesLoading(false))
  }

  // Chagua invoice na fungua PaymentForm
  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setInvoicePickerOpen(false)
  }

  // Funga PaymentForm na refresh
  const handlePaymentSaved = () => {
    setSelectedInvoice(null)
    setRefreshKey((key) => key + 1)
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiDollarSign className="h-5 w-5 text-primary" />{t(" Fee Collection")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Record and track student fee payments.")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
          <button type="button" onClick={openInvoicePicker} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
            <FiPlus className="h-4 w-4" />{t(" Record Payment")}</button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border p-4">
          <div className="relative max-w-md">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("Search transaction reference or student")}
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Reference")}</th>
                <th className="px-4 py-3">{t("Student")}</th>
                <th className="px-4 py-3">{t("Invoice")}</th>
                <th className="px-4 py-3 text-right">{t("Amount")}</th>
                <th className="px-4 py-3">{t("Method")}</th>
                <th className="px-4 py-3">{t("Date")}</th>
                <th className="px-4 py-3">{t("Status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-muted-foreground">{t("No payments recorded yet.")}</td></tr>
              ) : transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3 font-medium text-foreground">{tx.transaction_ref ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tx.student?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tx.invoice?.invoice_number ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(tx.amount)}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{tx.payment_method ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(tx.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusClass(tx.status)}`}>{t(tx.status)}</span>
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

      {/* Invoice Picker Modal */}
      {invoicePickerOpen && (
        <Modal title={t("Select invoice")} description={t("Choose an unpaid invoice to record a payment for.")} onClose={() => setInvoicePickerOpen(false)}>
          {invoicesLoading ? (
            <div className="py-8 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : invoices.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">{t("No unpaid invoices found.")}</p>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {invoices.map((invoice) => (
                <button
                  key={invoice.id}
                  type="button"
                  onClick={() => handleSelectInvoice(invoice)}
                  className="w-full rounded-lg border border-border p-3 text-left transition hover:bg-muted"
                >
                  <p className="font-medium text-foreground">{invoice.invoice_number}</p>
                  <p className="text-sm text-muted-foreground">{invoice.student?.full_name} · {formatMoney(invoice.amount)}{t(" · Balance: ")}{formatMoney(invoice.balance)}</p>
                </button>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Payment Form Modal */}
      {selectedInvoice && (
        <Modal title={t("Record payment")} description={t("Payment for {0}.", [selectedInvoice.invoice_number])} onClose={() => setSelectedInvoice(null)}>
          <PaymentForm invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} onSaved={handlePaymentSaved} />
        </Modal>
      )}
    </div>
  )
}