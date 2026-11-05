import { newReceiptRequestId } from '../../utils/billing'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import { getChildren } from '../../api/parent'
import { listStudentsFor } from '../../api/students'
import { getStudentInvoices, listChildInvoices, transferBillingCredit } from '../../api/finance'
import { formatMoney } from '../../utils/format'
import { useLanguage } from '../../hooks/useLanguage'
import { t } from '../../utils/i18n'

const inputClass = 'mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground'
export function CreditTransferForm({ prefix = 'parent', sourceStudentId = '', onClose, onSaved }) {
  useLanguage()
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [credit, setCredit] = useState(null)
  const [requestId] = useState(newReceiptRequestId)
  const [cache, setCache] = useState({})
  const { register, handleSubmit, control, setError, formState: { errors, isSubmitting } } = useForm({ defaultValues: { source_student_id: String(sourceStudentId), target_student_id: '', amount: '', reason: '' } })
  const source = useWatch({ control, name: 'source_student_id' })
  const target = useWatch({ control, name: 'target_student_id' })
  const options = [...students]
  for (const id of [source, target]) { if (cache[id] && !options.some(s => String(s.id) === id)) options.unshift(cache[id]) }
  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      const request = prefix === 'parent' ? getChildren() : listStudentsFor('accountant', { search, per_page: 100 }).then(r => r.data)
      request.then(data => { if (active) { setStudents(data); setCache(previous => ({ ...previous, ...Object.fromEntries(data.map(s => [s.id, s])) })) } }).catch(() => { if (active) toast.error(t('Unable to load students.')) })
    }, prefix === 'parent' ? 0 : 250)
    return () => { active = false; clearTimeout(timer) }
  }, [prefix, search])
  useEffect(() => {
    if (!source) return
    let active = true
    const request = prefix === 'parent' ? listChildInvoices(source) : getStudentInvoices('accountant', source)
    request.then(response => { if (active) setCredit({ source, amount: response.summary.credit_balance }) }).catch(() => { if (active) setCredit(null) })
    return () => { active = false }
  }, [source, prefix])
  async function save(values) {
    try {
      await transferBillingCredit(prefix, { ...values, request_id: requestId, source_student_id: Number(values.source_student_id), target_student_id: Number(values.target_student_id), amount: Number(values.amount) })
      toast.success(t('Credit transferred.')); onSaved(); onClose()
    } catch (error) {
      Object.entries(error.response?.data?.errors ?? {}).forEach(([field, messages]) => setError(field, { message: messages[0] }))
      toast.error(error.response?.data?.message ?? t('Unable to transfer credit.'))
    }
  }
  return <form onSubmit={handleSubmit(save)} className="space-y-4">
    <p className="text-sm text-muted-foreground">{t('Transfer only unused credit between children linked to the same parent. The receiving child’s oldest bills are settled first.')}</p>
    {prefix === 'accountant' && <label className="block text-sm text-foreground">{t('Search student')}<input className={inputClass} value={search} onChange={e => setSearch(e.target.value)} /></label>}
    {[['source_student_id', 'From child'], ['target_student_id', 'To child']].map(([name, label]) => <label key={name} className="block text-sm text-foreground">{t(label)} *<select className={inputClass} {...register(name, { required: true })}><option value="">{t('Select student')}</option>{options.filter(s => name === 'source_student_id' || String(s.id) !== source).map(s => <option key={s.id} value={s.id}>{s.full_name} · {s.student_number}</option>)}</select></label>)}
    {credit?.source === source && <p className="text-sm text-success">{t('Credit available')}: <strong>{formatMoney(credit.amount)}</strong></p>}
    <label className="block text-sm text-foreground">{t('Amount (TZS)')} *<input className={inputClass} type="number" min="0.01" step="0.01" max={credit?.source === source ? credit.amount : undefined} {...register('amount', { required: true, min: 0.01 })} /></label>
    <label className="block text-sm text-foreground">{t('Reason')} *<input className={inputClass} maxLength={500} {...register('reason', { required: true })} /></label>
    {Object.entries(errors).map(([field, error]) => <p key={field} role="alert" className="text-sm text-danger">{error.message || t('Complete all required fields.')}</p>)}
    <div className="flex justify-end gap-3 border-t border-border pt-4"><button type="button" disabled={isSubmitting} onClick={onClose} className="min-h-11 rounded-lg border border-border px-4 py-2 text-foreground">{t('Cancel')}</button><button disabled={isSubmitting || credit?.source !== source || Number(credit?.amount) <= 0} className="min-h-11 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50">{t(isSubmitting ? 'Saving...' : 'Transfer credit')}</button></div>
  </form>
}
