import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { listStudentsFor } from '../../api/students'
import { createInvoice, updateInvoice } from '../../api/finance'

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

export function InvoiceForm({ invoice, onClose, onSaved }) {
  useLanguage()
  const isEdit = Boolean(invoice)
  const [students, setStudents] = useState([])
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      student_id: invoice?.student_id ?? '',
      description: invoice?.description ?? '',
      amount: invoice?.amount ?? '',
      due_date: invoice?.due_date ?? '',
    },
  })

  useEffect(() => {
    let active = true

    listStudentsFor('accountant', { per_page: 100 })
      .then((response) => {
        if (active) setStudents(response.data)
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load students."))
      })

    return () => {
      active = false
    }
  }, [])

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      student_id: Number(values.student_id),
      amount: Number(values.amount),
      due_date: values.due_date || null,
    }

    try {
      if (isEdit) {
        await updateInvoice(invoice.id, {
          description: payload.description,
          amount: payload.amount,
          due_date: payload.due_date,
        })
        toast.success(t("Invoice updated"))
      } else {
        await createInvoice(payload)
        toast.success(t("Invoice created"))
      }

      onSaved()
      onClose()
    } catch (error) {
      const data = error.response?.data
      const validationErrors = data?.errors ?? {}

      Object.entries(validationErrors).forEach(([field, messages]) => {
        setError(field, { type: 'server', message: messages[0] })
      })

      toast.error(data?.message ?? t("Unable to save invoice."))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="student_id" className={labelClass}>{t("Student ")}<span className="text-red-500">*</span></label>
          <select id="student_id" disabled={isEdit} className={`${inputClass} mt-1.5 disabled:bg-muted`} {...register('student_id', { required: t("Student is required.") })}>
            <option value="">{t("Select student")}</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>{student.full_name} · {student.student_number}</option>
            ))}
          </select>
          {errors.student_id && <p className={errorClass}>{errors.student_id.message}</p>}
        </div>

        <div>
          <label htmlFor="amount" className={labelClass}>{t("Amount (TZS) ")}<span className="text-red-500">*</span></label>
          <input id="amount" type="number" min="0.01" step="0.01" className={`${inputClass} mt-1.5`} {...register('amount', { required: t("Amount is required."), min: { value: 0.01, message: t("Must be greater than zero.") } })} />
          {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
        </div>

        <div>
          <label htmlFor="due_date" className={labelClass}>{t("Due date")}</label>
          <input id="due_date" type="date" className={`${inputClass} mt-1.5`} {...register('due_date')} />
          {errors.due_date && <p className={errorClass}>{errors.due_date.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelClass}>{t("Description")}</label>
          <textarea id="description" rows={3} className={`${inputClass} mt-1.5`} {...register('description')} />
          {errors.description && <p className={errorClass}>{errors.description.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t("Cancel")}</button>
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
          {isSubmitting ? t("Saving...") : isEdit ? t("Update invoice") : t("Create invoice")}
        </button>
      </div>
    </form>
  )
}
