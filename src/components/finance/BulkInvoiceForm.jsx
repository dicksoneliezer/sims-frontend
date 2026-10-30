import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { listClasses } from '../../api/academics'
import { generateInvoices } from '../../api/finance'

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

export function BulkInvoiceForm({ onClose, onSaved }) {
  const [classes, setClasses] = useState([])
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      class_id: '',
      term: 'Term 1',
      academic_year: String(new Date().getFullYear()),
      due_date: '',
    },
  })

  useEffect(() => {
    let active = true

    listClasses({ per_page: 100 }, 'accountant')
      .then((response) => {
        if (active) setClasses(response.data)
      })
      .catch(() => {
        if (active) toast.error('Unable to load classes.')
      })

    return () => {
      active = false
    }
  }, [])

  const onSubmit = async (values) => {
    try {
      const response = await generateInvoices({
        ...values,
        class_id: Number(values.class_id),
        due_date: values.due_date || null,
      })

      toast.success(response.message)
      onSaved()
      onClose()
    } catch (error) {
      const data = error.response?.data
      const validationErrors = data?.errors ?? {}

      Object.entries(validationErrors).forEach(([field, messages]) => {
        setError(field, { type: 'server', message: messages[0] })
      })

      toast.error(data?.message ?? 'Unable to generate invoices.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <p className="rounded-lg bg-primary-soft px-3 py-2 text-xs text-primary">
        Active fee structures matching the class, term and year are used. Students who already have
        an invoice for the same fee structure are skipped.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="class_id" className={labelClass}>Class <span className="text-red-500">*</span></label>
          <select id="class_id" className={`${inputClass} mt-1.5`} {...register('class_id', { required: 'Class is required.' })}>
            <option value="">Select class</option>
            {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          {errors.class_id && <p className={errorClass}>{errors.class_id.message}</p>}
        </div>

        <div>
          <label htmlFor="term" className={labelClass}>Term</label>
          <input id="term" className={`${inputClass} mt-1.5`} {...register('term')} />
        </div>

        <div>
          <label htmlFor="academic_year" className={labelClass}>Academic year</label>
          <input id="academic_year" className={`${inputClass} mt-1.5`} {...register('academic_year')} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="due_date" className={labelClass}>Due date</label>
          <input id="due_date" type="date" className={`${inputClass} mt-1.5`} {...register('due_date')} />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
          {isSubmitting ? 'Generating...' : 'Generate invoices'}
        </button>
      </div>
    </form>
  )
}
