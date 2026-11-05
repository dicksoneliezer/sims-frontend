import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { getChildren } from '../../api/parent'
import { listStudentsFor } from '../../api/students'
import { generateParentControlNumber, generateControlNumber, requestStudentControlNumber } from '../../api/finance'
import { PAYMENT_METHODS } from '../../utils/billing'
import { formatMoney } from '../../utils/format'
import { useLanguage } from '../../hooks/useLanguage'
import { t } from '../../utils/i18n'

const inputClass = 'mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground'
export function ParentPaymentForm({ onClose, onSaved, studentMode = false, accountantMode = false, defaultStudentId = '' }) {
  useLanguage()
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [generated, setGenerated] = useState(null)
  const { register, handleSubmit, setValue, setError, formState: { errors, isSubmitting } } = useForm({ defaultValues: { student_id: String(defaultStudentId), amount: '', payment_method: 'bank' } })
  useEffect(() => {
    if (studentMode) return
    let active = true
    const timer = setTimeout(() => {
      const request = accountantMode ? listStudentsFor('accountant', { search, per_page: 100 }).then(r => r.data) : getChildren()
      request.then(items => { if (active) { setStudents(items); if (items.length === 1 && !defaultStudentId) setValue('student_id', String(items[0].id)) } }).catch(() => { if (active) toast.error(t('Unable to load payment options.')) })
    }, accountantMode ? 250 : 0)
    return () => { active = false; clearTimeout(timer) }
  }, [studentMode, accountantMode, search, defaultStudentId, setValue])
  async function generate(values) {
    try {
      const payload = { student_id: Number(values.student_id), amount: Number(values.amount), payment_method: values.payment_method }
      const payment = studentMode ? await requestStudentControlNumber(payload) : accountantMode ? await generateControlNumber(payload) : await generateParentControlNumber(payload)
      setGenerated(payment); onSaved?.()
    } catch (error) {
      Object.entries(error.response?.data?.errors ?? {}).forEach(([field, messages]) => setError(field, { message: messages[0] }))
      toast.error(error.response?.data?.message ?? t('Unable to generate control number.'))
    }
  }
  if (generated) return <div className="space-y-4">
    <div className="rounded-xl bg-primary-soft p-5 text-center text-primary"><p>{t('Control number')}</p><p className="mt-2 break-all text-xl font-bold">{generated.control_number}</p><p className="mt-2 font-semibold">{formatMoney(generated.amount)}</p><p className="mt-1 text-sm">{t('Pending confirmation')}</p></div>
    <p className="text-sm leading-relaxed text-foreground">{t('Pay using the official details provided by your school accountant and quote this control number. Your balance changes only after the accountant confirms receipt.')}</p>
    <p className="text-sm text-muted-foreground">{t('Keep your bank or mobile money receipt. For cash, pay at the school office and obtain a receipt.')}</p>
    <button type="button" onClick={onClose} className="min-h-11 w-full rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground">{t('Done')}</button>
  </div>
  return <form onSubmit={handleSubmit(generate)} className="space-y-4">
    <p className="rounded-lg bg-primary-soft p-3 text-sm text-primary">{t('You may pay any amount, including advance fees for future terms. Payments settle bills in date order and extra funds remain credit.')}</p>
    {accountantMode && <label className="block text-sm text-foreground">{t('Search student')}<input type="search" value={search} onChange={e => setSearch(e.target.value)} className={inputClass} /></label>}
    {!studentMode && <label className="block text-sm text-foreground">{t(accountantMode ? 'Student' : 'Child')} *<select className={inputClass} {...register('student_id', { required: true })}><option value="">{t('Select student')}</option>{students.map(s => <option key={s.id} value={s.id}>{s.full_name} · {s.student_number}</option>)}</select></label>}
    <label className="block text-sm text-foreground">{t('Amount (TZS)')} *<input type="number" min="0.01" step="0.01" className={inputClass} {...register('amount', { required: true, min: 0.01 })} /></label>
    <label className="block text-sm text-foreground">{t('Method')}<select className={inputClass} {...register('payment_method')}>{PAYMENT_METHODS.map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}</select></label>
    {Object.entries(errors).map(([field, error]) => <p key={field} role="alert" className="text-sm text-danger">{error.message || t('Complete all required fields.')}</p>)}
    <div className="flex justify-end gap-3 border-t border-border pt-4"><button type="button" disabled={isSubmitting} onClick={onClose} className="min-h-11 rounded-lg border border-border px-4 py-2 text-foreground">{t('Cancel')}</button><button disabled={isSubmitting} className="min-h-11 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50">{t(isSubmitting ? 'Generating...' : 'Generate control number')}</button></div>
  </form>
}
