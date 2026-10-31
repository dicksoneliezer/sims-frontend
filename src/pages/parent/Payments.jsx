import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiCreditCard, FiPlus, FiRefreshCw, FiSearch, FiXCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'
import {
  cancelParentPayment,
  listParentPayments,
  payParentPayment,
} from '../../api/finance'
import { Modal } from '../../components/common/Modal'
import { ParentPaymentForm } from '../../components/finance/ParentPaymentForm'
import { formatDate, formatMoney, statusClass } from '../../utils/format'

const PAGE_SIZE = 10

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'

function PayModal({ payment, onClose, onPaid }) {
  useLanguage()
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const requiresPhone = ['mpesa', 'tigopesa', 'airtel'].includes(payment.payment_method)

  const pay = async (event) => {
    event.preventDefault()

    if (requiresPhone && !phone.trim()) {
      toast.error(t("Enter the mobile money phone number."))
      return
    }

    setSaving(true)

    try {
      await payParentPayment(payment.id, { payment_method: payment.payment_method, phone_number: phone.trim() || undefined })
      toast.success(t("Payment completed successfully"))
      onPaid()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message ?? t("Unable to complete payment."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={pay} className="space-y-4">
      <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm">
        <p className="font-semibold text-foreground">{payment.control_number}</p>
        <p className="text-muted-foreground">{payment.student?.full_name} · {payment.invoice?.invoice_number ?? '—'}</p>
        <p className="mt-1 text-muted-foreground">{t("Amount: ")}<span className="font-semibold text-foreground">{formatMoney(payment.amount)}</span></p>
      </div>

      {requiresPhone && (
        <div>
          <label htmlFor="pay-phone" className="text-sm font-medium text-foreground">{t("Phone number ")}<span className="text-red-500">*</span></label>
          <input id="pay-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder={t("+2557XXXXXXXX")} className={`${inputClass} mt-1.5`} />
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t("Cancel")}</button>
        <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-emerald-700 disabled:opacity-60">
          {saving ? t("Processing...") : t("Pay now")}
        </button>
      </div>
    </form>
  )
}

export default function Payments() {
  useLanguage()
  const [payments, setPayments] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState({ search: '', status: '' })
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
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

    listParentPayments({ ...query, page, per_page: PAGE_SIZE })
      .then((response) => {
        if (!active) return
        setPayments(response.data)
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

  const handleCancel = async (payment) => {
    if (!window.confirm(t("Cancel control number {0}?", [payment.control_number]))) return

    try {
      await cancelParentPayment(payment.id)
      toast.success(t("Payment cancelled"))
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? t("Unable to cancel payment."))
    }
  }

  return (
    // Hapa tunaondoa AppLayout na MODULES_BY_ROLE kabisa. Tunabaki na div ya maudhui pekee.
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiCreditCard className="h-5 w-5 text-primary" />{t(" Fee payments")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Generate a control number and pay school fees.")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
          <button type="button" onClick={() => setFormOpen(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
            <FiPlus className="h-4 w-4" />{t(" New payment")}</button>
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
              placeholder={t("Search control number or child")}
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={query.status}
            onChange={(event) => { setQuery((current) => ({ ...current, status: event.target.value })); setPage(1) }}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{t("All statuses")}</option>
            <option value="pending">{t("Pending")}</option>
            <option value="completed">{t("Completed")}</option>
            <option value="cancelled">{t("Cancelled")}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Control number")}</th>
                <th className="px-4 py-3">{t("Child")}</th>
                <th className="px-4 py-3">{t("Invoice")}</th>
                <th className="px-4 py-3 text-right">{t("Amount")}</th>
                <th className="px-4 py-3">{t("Method")}</th>
                <th className="px-4 py-3">{t("Date")}</th>
                <th className="px-4 py-3">{t("Status")}</th>
                <th className="px-4 py-3 text-right">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-14 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-14 text-center text-muted-foreground">{t("No payments yet.")}</td></tr>
              ) : payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3 font-medium text-foreground">{payment.control_number}</td>
                  <td className="px-4 py-3 text-muted-foreground">{payment.student?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{payment.invoice?.invoice_number ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(payment.amount)}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{payment.payment_method ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p>{formatDate(payment.completed_at ?? payment.created_at)}</p>
                    {payment.status === 'pending' && payment.expires_at && <p className="text-xs text-muted-foreground">{t("Expires ")}{formatDate(payment.expires_at)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusClass(payment.status)}`}>{t(payment.status)}</span>
                    {payment.is_expired && payment.status === 'pending' && <p className="mt-0.5 text-xs text-warning">{t("Expired")}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {payment.status === 'pending' && !payment.is_expired && (
                        <button type="button" onClick={() => setPaying(payment)} className="rounded-lg p-2 text-muted-foreground hover:bg-success-soft hover:text-success" aria-label={t("Pay {0}", [payment.control_number])}>
                          <FiCreditCard className="h-4 w-4" />
                        </button>
                      )}
                      {payment.status === 'pending' && (
                        <button type="button" onClick={() => handleCancel(payment)} className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger" aria-label={t("Cancel {0}", [payment.control_number])}>
                          <FiXCircle className="h-4 w-4" />
                        </button>
                      )}
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

      {formOpen && (
        <Modal title={t("New payment")} description={t("Generate a control number to pay school fees.")} onClose={() => setFormOpen(false)}>
          <ParentPaymentForm onClose={() => setFormOpen(false)} onSaved={() => setRefreshKey((key) => key + 1)} />
        </Modal>
      )}

      {paying && (
        <Modal title={t("Complete payment")} description={t("Pay control number {0}.", [paying.control_number])} onClose={() => setPaying(null)}>
          <PayModal payment={paying} onClose={() => setPaying(null)} onPaid={() => setRefreshKey((key) => key + 1)} />
        </Modal>
      )}
    </div>
  )
}