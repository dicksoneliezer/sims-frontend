import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBillingReport } from '../../api/finance'
import { BillTable } from '../../components/finance/BillTable'
import { BulkInvoiceForm } from '../../components/finance/BulkInvoiceForm'
import { PaymentForm } from '../../components/finance/PaymentForm'
import { CreditTransferForm } from '../../components/finance/CreditTransferForm'
import { Modal } from '../../components/common/Modal'
import { formatMoney } from '../../utils/format'
import { useLanguage } from '../../hooks/useLanguage'
import { t } from '../../utils/i18n'

const buttonClass = 'min-h-11 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50'
const inputClass = 'min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground'
export default function Billing() {
  useLanguage()
  const [query, setQuery] = useState({ period: '', status: '', search: '' })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [form, setForm] = useState(null)
  const [loaded, setLoaded] = useState(null)
  const key = JSON.stringify([query, page, version])
  const loading = loaded?.key !== key
  const result = loaded?.result
  useEffect(() => {
    const controller = new AbortController()
    getBillingReport({ ...query, page }).then(result => { if (!controller.signal.aborted) setLoaded({ key, result }) }).catch(() => { if (!controller.signal.aborted) setLoaded({ key, failed: true }) })
    return () => controller.abort()
  }, [query, page, key])
  const saved = () => setVersion(v => v + 1)
  const cards = [
    ['Total Bills', result?.summary.total_bills, 'text-foreground'], ['Total Payments', result?.summary.total_payments, 'text-success'], ['Total Debt', result?.summary.total_debt, 'text-danger'], ['Total Overpaid', result?.summary.total_overpaid, 'text-success'],
    ['Paying students', result?.summary.paying_students, 'text-primary', true], ['Students with debt', result?.summary.owing_students, 'text-danger', true], ['Fully settled students', result?.summary.settled_students, 'text-muted-foreground', true], ['Students with credit', result?.summary.overpaid_students, 'text-success', true],
  ]
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-semibold text-foreground">{t('Billing Report')}</h2><p className="mt-1 text-sm text-muted-foreground">{t('Create term bills, record received payments and track student credit.')}</p></div><div className="flex flex-wrap gap-2"><button className={buttonClass} onClick={() => setForm('transfer')}>{t('Transfer credit')}</button><button className={buttonClass} onClick={() => setForm('payment')}>{t('Record payment')}</button><button className="min-h-11 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" onClick={() => setForm('bulk')}>{t('Bulk Create')}</button></div></div>
    <form className="flex flex-wrap gap-3" onSubmit={e => { e.preventDefault(); setQuery(q => ({ ...q, search: search.trim() })); setPage(1) }}>
      <input className={`${inputClass} min-w-0 flex-1`} placeholder={t('Search student or bill ID')} aria-label={t('Search student or bill ID')} value={search} onChange={e => setSearch(e.target.value)} />
      <select className={inputClass} aria-label={t('Period')} value={query.period} onChange={e => { setQuery(q => ({ ...q, period: e.target.value })); setPage(1) }}><option value="">{t('All periods')}</option>{result?.periods.map(period => <option key={period}>{period}</option>)}</select>
      <select className={inputClass} aria-label={t('Status')} value={query.status} onChange={e => { setQuery(q => ({ ...q, status: e.target.value })); setPage(1) }}><option value="">{t('All statuses')}</option>{['unpaid', 'partial', 'paid'].map(s => <option key={s} value={s}>{t(s)}</option>)}</select>
      <button className={buttonClass}>{t('Search')}</button><button type="button" className={buttonClass} onClick={saved}>{t('Refresh')}</button>
    </form>
    {loading ? <p role="status" className="py-12 text-center text-muted-foreground">{t('Loading data')}</p> : loaded.failed ? <div role="alert" className="rounded-xl border border-border p-6 text-danger">{t('Unable to load billing report.')} <button className={buttonClass} onClick={saved}>{t('Try again')}</button></div> : <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, tone, count]) => <article key={label} className="dashboard-stat-card"><p className="text-sm text-muted-foreground">{t(label)}</p><p className={`mt-3 text-xl font-semibold ${tone}`}>{count ? value ?? 0 : formatMoney(value)}</p></article>)}</div>
      <p className="text-xs text-muted-foreground">{t(result.summary.payments_are_allocations ? 'For the selected period/status, Total Payments shows amounts allocated to the filtered bills. Unallocated credit is shown across all periods for these students.' : 'Total Payments includes received funds, historical paid balances and net credit transfers. Allocations are not counted again as income.')}</p>
      <BillTable invoices={result.data} showStudent showPayments />
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"><Link className="font-medium text-primary hover:underline" to="/accountant/invoices">{t('Manage individual bills')}</Link><div className="flex items-center gap-2"><button className={buttonClass} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t('Previous')}</button><span>{t('Page {0} of {1}', [result.meta.current_page, result.meta.last_page])}</span><button className={buttonClass} disabled={page >= result.meta.last_page} onClick={() => setPage(p => p + 1)}>{t('Next')}</button></div></div>
    </>}
    {form && <Modal title={form === 'bulk' ? 'Bulk Create' : form === 'payment' ? 'Record payment' : 'Transfer credit'} onClose={() => setForm(null)}>{form === 'bulk' ? <BulkInvoiceForm onClose={() => setForm(null)} onSaved={saved} /> : form === 'payment' ? <PaymentForm onClose={() => setForm(null)} onSaved={saved} /> : <CreditTransferForm prefix="accountant" onClose={() => setForm(null)} onSaved={saved} />}</Modal>}
  </div>
}
