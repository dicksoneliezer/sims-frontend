import { PAYMENT_METHODS, newReceiptRequestId } from '../../utils/billing'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import { recordPayment, confirmControlNumber } from '../../api/finance'
import { listStudentsFor } from '../../api/students'
import { formatMoney } from '../../utils/format'
import { useLanguage } from '../../hooks/useLanguage'
import { t } from '../../utils/i18n'

const inputClass = 'mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground'

export function PaymentForm({ invoice, payment, onClose, onSaved }) {
  useLanguage()
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [requestId] = useState(newReceiptRequestId)
  const { register, handleSubmit, control, setError, formState: { errors, isSubmitting } } = useForm({ defaultValues: { student_id: '', amount: payment?.amount ?? invoice?.balance ?? '', payment_method: payment?.payment_method ?? 'cash', reference: '', phone_number: '', description: '' } })
  const method = useWatch({ control, name: 'payment_method' })
  const mobile = ['mpesa', 'tigopesa', 'airtel'].includes(method)
  useEffect(() => {
    if (invoice || payment) return
    let active = true
    const timer = setTimeout(() => listStudentsFor('accountant', { search, per_page: 100 }).then(response => { if (active) setStudents(response.data) }).catch(() => { if (active) toast.error(t('Unable to load students.')) }), 250)
    return () => { active = false; clearTimeout(timer) }
  }, [invoice, payment, search])
  async function save(values) {
    const data = { payment_method: values.payment_method, phone_number: mobile ? values.phone_number : null, reference: values.reference || null }
    try {
      if (payment) await confirmControlNumber(payment.id, data)
      else await recordPayment({ ...data, request_id: requestId, student_id: invoice?.student_id ?? Number(values.student_id), invoice_id: invoice?.id ?? null, amount: Number(values.amount), description: values.description || null })
      toast.success(t('Payment confirmed and allocated.')); onSaved(); onClose()
    } catch (error) {
      Object.entries(error.response?.data?.errors ?? {}).forEach(([field, messages]) => setError(field, { message: messages[0] }))
      toast.error(error.response?.data?.message ?? t('Unable to record payment.'))
    }
  }
  return <form onSubmit={handleSubmit(save)} className="space-y-4">
    {(invoice || payment) && <div className="rounded-lg bg-muted p-4 text-sm text-foreground"><p className="font-semibold">{payment?.control_number ?? invoice?.invoice_number}</p><p>{payment?.student?.full_name ?? invoice?.student?.full_name}</p><p>{formatMoney(payment?.amount ?? invoice?.balance)}</p></div>}
    <p className="rounded-lg bg-primary-soft p-3 text-sm text-primary">{t('Payments settle the oldest outstanding bills first. Any extra amount remains credit for future bills.')}</p>
    {!invoice && !payment && <><label className="block text-sm text-foreground">{t('Search student')}<input type="search" value={search} onChange={event => setSearch(event.target.value)} className={inputClass} /></label><label className="block text-sm text-foreground">{t('Student')} *<select className={inputClass} {...register('student_id', { required: true })}><option value="">{t('Select student')}</option>{students.map(s => <option key={s.id} value={s.id}>{s.full_name} · {s.student_number}</option>)}</select></label></>}
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm text-foreground">{t('Amount (TZS)')} *<input disabled={Boolean(payment)} type="number" min="0.01" step="0.01" className={inputClass} {...register('amount', { required: true, min: 0.01 })} /></label>
      <label className="text-sm text-foreground">{t('Method')}<select className={inputClass} {...register('payment_method')}>{PAYMENT_METHODS.map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}</select></label>
      <label className="text-sm text-foreground">{t('Receipt / transaction reference')}<input className={inputClass} maxLength={60} {...register('reference')} /></label>
      {mobile && <label className="text-sm text-foreground">{t('Phone number')} *<input className={inputClass} {...register('phone_number', { required: mobile })} /></label>}
      {!payment && <label className="text-sm text-foreground sm:col-span-2">{t('Description')}<input className={inputClass} {...register('description')} /></label>}
    </div>
    <label className="flex items-start gap-2 text-sm text-foreground"><input type="checkbox" className="mt-1" required />{t('I have verified that these funds have been received.')}</label>
    {Object.entries(errors).map(([field, error]) => <p key={field} role="alert" className="text-sm text-danger">{error.message || t('Complete all required fields.')}</p>)}
    <div className="flex justify-end gap-3 border-t border-border pt-4"><button type="button" disabled={isSubmitting} onClick={onClose} className="min-h-11 rounded-lg border border-border px-4 py-2 text-foreground">{t('Cancel')}</button><button disabled={isSubmitting} className="min-h-11 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50">{t(isSubmitting ? 'Recording...' : 'Confirm received payment')}</button></div>
  </form>
}
