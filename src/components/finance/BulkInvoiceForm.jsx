import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import { listClasses } from '../../api/academics'
import { generateInvoices, getBillingFeeStructures } from '../../api/finance'
import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { formatMoney } from '../../utils/format'

const inputClass = 'mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground'
export function BulkInvoiceForm({ onClose, onSaved }) {
  useLanguage()
  const [options, setOptions] = useState({ classes: [], fees: [] })
  const [ready, setReady] = useState(false)
  const [year] = useState(() => String(new Date().getFullYear()))
  const { register, handleSubmit, control, setValue, setError, formState: { errors, isSubmitting } } = useForm({ defaultValues: { class_id: '', fee_structure_id: '', term: 'Term 1', academic_year: year, due_date: '' } })
  const values = useWatch({ control })
  const schoolClass = options.classes.find(c => String(c.id) === values.class_id)
  const fees = options.fees.filter(fee => fee.class_id ? String(fee.class_id) === values.class_id : fee.school_level === schoolClass?.level)
  const fee = fees.find(f => String(f.id) === values.fee_structure_id)
  const period = `${values.term} ${values.academic_year}`
  useEffect(() => {
    let active = true
    Promise.all([listClasses({ per_page: 100 }, 'accountant'), getBillingFeeStructures()]).then(([classes, feeList]) => { if (active) { setOptions({ classes: classes.data, fees: feeList }); setReady(true) } }).catch(() => { if (active) toast.error(t('Unable to load billing options.')) })
    return () => { active = false }
  }, [])
  async function save(data) {
    try {
      const response = await generateInvoices({ class_id: Number(data.class_id), fee_structure_id: Number(data.fee_structure_id), period, due_date: data.due_date })
      toast.success(t('Bills created: {0}. Existing bills skipped: {1}.', [response.data.created, response.data.skipped]))
      onSaved(); onClose()
    } catch (error) {
      Object.entries(error.response?.data?.errors ?? {}).forEach(([field, messages]) => setError(field, { message: messages[0] }))
      toast.error(error.response?.data?.message ?? t('Unable to generate invoices.'))
    }
  }
  return <form onSubmit={handleSubmit(save)} className="space-y-4">
    <p className="rounded-lg bg-primary-soft p-3 text-sm text-primary">{t('Create one bill per active student in the selected class. The same fee and period are never billed twice.')}</p>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium text-foreground">{t('Class')} *<select className={inputClass} disabled={!ready} {...register('class_id', { required: true, onChange: () => setValue('fee_structure_id', '') })}><option value="">{t('Select class')}</option>{options.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="text-sm font-medium text-foreground">{t('Fee Structure')} *<select className={inputClass} disabled={!values.class_id} {...register('fee_structure_id', { required: true })}><option value="">{t('Select fee structure')}</option>{fees.map(f => <option key={f.id} value={f.id}>{f.name} · {formatMoney(f.amount)}</option>)}</select></label>
      <label className="text-sm font-medium text-foreground">{t('Term')} *<select className={inputClass} {...register('term')}>{['Term 1', 'Term 2', 'Term 3'].map(term => <option key={term} value={term}>{t(term)}</option>)}</select></label>
      <label className="text-sm font-medium text-foreground">{t('Academic year')} *<input className={inputClass} type="number" min="2000" max="2200" {...register('academic_year', { required: true })} /></label>
      <label className="text-sm font-medium text-foreground sm:col-span-2">{t('Due date')} *<input className={inputClass} type="date" {...register('due_date', { required: true })} /></label>
    </div>
    <p className="text-sm text-foreground">{t('Period')}: <strong>{period}</strong>{fee && <> · {t('Amount')}: <strong>{formatMoney(fee.amount)}</strong></>}</p>
    {Object.entries(errors).map(([field, error]) => <p key={field} role="alert" className="text-sm text-danger">{error.message || t('Complete all required fields.')}</p>)}
    <div className="flex justify-end gap-3 border-t border-border pt-4"><button type="button" disabled={isSubmitting} onClick={onClose} className="min-h-11 rounded-lg border border-border px-4 py-2 text-foreground">{t('Cancel')}</button><button disabled={isSubmitting || !fee} className="min-h-11 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50">{t(isSubmitting ? 'Generating...' : 'Bulk Create')}</button></div>
  </form>
}
