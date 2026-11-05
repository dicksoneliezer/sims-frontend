import { useEffect, useState } from 'react'
import { getStudentBilling } from '../../api/finance'
import { BillTable } from '../../components/finance/BillTable'
import { FinancialSummary } from '../../components/finance/FinancialSummary'
import { ParentPaymentForm } from '../../components/finance/ParentPaymentForm'
import { Modal } from '../../components/common/Modal'
import { formatMoney, formatDate, statusClass } from '../../utils/format'
import { useLanguage } from '../../hooks/useLanguage'
import { t } from '../../utils/i18n'

export default function Billing() {
  useLanguage()
  const [version, setVersion] = useState(0)
  const [loaded, setLoaded] = useState(null)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    let active = true
    getStudentBilling().then(data => { if (active) setLoaded({ version, data }) }).catch(() => { if (active) setLoaded({ version, failed: true }) })
    return () => { active = false }
  }, [version])
  return <div className="space-y-5">
    <div className="flex flex-wrap justify-between gap-3"><h2 className="text-2xl font-semibold text-foreground">{t('Billing')}</h2><div className="flex gap-2"><button className="min-h-11 rounded-lg border border-border px-4 py-2 text-foreground" onClick={() => setVersion(v => v + 1)}>{t('Refresh')}</button><button className="min-h-11 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground" onClick={() => setOpen(true)}>{t('Generate control number')}</button></div></div>
    {loaded?.version !== version ? <p role="status" className="py-10 text-center text-muted-foreground">{t('Loading data')}</p> : loaded.failed ? <p role="alert" className="text-danger">{t('Unable to load billing report.')}</p> : <>
      <FinancialSummary summary={loaded.data.summary} /><BillTable invoices={loaded.data.invoices} />
      <section className="rounded-xl border border-border bg-surface p-4"><h3 className="font-semibold text-foreground">{t('Payments and control numbers')}</h3><p className="mt-1 text-sm text-muted-foreground">{t('Pending requests do not count as paid. The accountant confirms received funds.')}</p><div className="mt-4 space-y-3">{loaded.data.payments.map(payment => <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm text-foreground"><div><p className="break-all font-medium">{payment.control_number}</p><p className="text-xs text-muted-foreground">{formatDate(payment.completed_at ?? payment.created_at)}</p></div><strong>{formatMoney(payment.amount)}</strong><span className={`rounded-full px-2 py-1 ${statusClass(payment.status)}`}>{t(payment.status)}</span></div>)}</div></section>
    </>}
    {open && <Modal title="Generate control number" onClose={() => setOpen(false)}><ParentPaymentForm studentMode onClose={() => setOpen(false)} onSaved={() => setVersion(v => v + 1)} /></Modal>}
  </div>
}
