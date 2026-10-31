import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { listStudentsFor } from '../../api/students'
import { generateControlNumber, getStudentInvoices } from '../../api/finance'
import { formatMoney } from '../../utils/format'

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

const METHODS = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'tigopesa', label: 'Tigo Pesa' },
  { value: 'airtel', label: 'Airtel Money' },
  { value: 'bank', label: 'Bank transfer' },
]

export function ControlNumberForm({ onClose, onSaved }) {
  useLanguage()
  const [students, setStudents] = useState([])
  const [invoices, setInvoices] = useState([])
  const [generated, setGenerated] = useState(null)
  const requestRef = useRef(0)
  const { register, handleSubmit, watch, setError, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      student_id: '',
      invoice_id: '',
      amount: '',
      payment_method: 'mpesa',
      description: '',
    },
  })

  const studentId = watch('student_id')
  const invoiceId = watch('invoice_id')

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

  useEffect(() => {
    if (!studentId) {
      setInvoices([])
      return
    }

    const requestId = requestRef.current + 1
    requestRef.current = requestId

    getStudentInvoices('accountant', studentId)
      .then((response) => {
        if (requestRef.current === requestId) setInvoices(response.data.filter((invoice) => invoice.balance > 0))
      })
      .catch(() => {
        if (requestRef.current === requestId) toast.error(t("Unable to load student invoices."))
      })
  }, [studentId])

  useEffect(() => {
    if (!invoiceId) return

    const invoice = invoices.find((item) => String(item.id) === String(invoiceId))
    if (invoice) reset((current) => ({ ...current, amount: invoice.balance }))
  }, [invoiceId, invoices, reset])

  const onSubmit = async (values) => {
    try {
      const payment = await generateControlNumber({
        ...values,
        student_id: Number(values.student_id),
        invoice_id: Number(values.invoice_id),
        amount: Number(values.amount),
      })

      setGenerated(payment)
      onSaved()
    } catch (error) {
      const data = error.response?.data
      const validationErrors = data?.errors ?? {}

      Object.entries(validationErrors).forEach(([field, messages]) => {
        setError(field, { type: 'server', message: messages[0] })
      })

      toast.error(data?.message ?? t("Unable to generate control number."))
    }
  }

  if (generated) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-success-soft p-4 text-center">
          <p className="text-sm text-success">{t("Control number generated")}</p>
          <p className="mt-1 text-2xl font-bold tracking-wide text-emerald-900">{generated.control_number}</p>
          <p className="mt-1 text-sm text-success">{formatMoney(generated.amount)} · {t(generated.payment_method)}</p>
          {generated.expires_at && <p className="mt-1 text-xs text-success">{t("Expires ")}{new Date(generated.expires_at).toLocaleString()}</p>}
        </div>
        {generated.payment_instructions && (
          <div className="rounded-lg border border-border bg-muted p-3 text-sm text-foreground">
            <p className="font-medium text-foreground">{t("Payment instructions")}</p>
            <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{generated.payment_instructions[generated.payment_method] ?? JSON.stringify(generated.payment_instructions)}</p>
          </div>
        )}
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <button type="button" onClick={() => setGenerated(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t("Generate another")}</button>
          <button type="button" onClick={onClose} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">{t("Done")}</button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="student_id" className={labelClass}>{t("Student ")}<span className="text-red-500">*</span></label>
          <select id="student_id" className={`${inputClass} mt-1.5`} {...register('student_id', { required: t("Student is required.") })}>
            <option value="">{t("Select student")}</option>
            {students.map((student) => <option key={student.id} value={student.id}>{student.full_name} · {student.student_number}</option>)}
          </select>
          {errors.student_id && <p className={errorClass}>{errors.student_id.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="invoice_id" className={labelClass}>{t("Invoice ")}<span className="text-red-500">*</span></label>
          <select id="invoice_id" disabled={!studentId} className={`${inputClass} mt-1.5 disabled:bg-muted`} {...register('invoice_id', { required: t("Invoice is required.") })}>
            <option value="">{studentId ? t("Select invoice") : t("Select a student first")}</option>
            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>{invoice.invoice_number}{t(" · balance ")}{formatMoney(invoice.balance)}</option>
            ))}
          </select>
          {studentId && invoices.length === 0 && <p className="mt-1 text-xs text-warning">{t("This student has no invoices with a balance.")}</p>}
          {errors.invoice_id && <p className={errorClass}>{errors.invoice_id.message}</p>}
        </div>

        <div>
          <label htmlFor="amount" className={labelClass}>{t("Amount (TZS) ")}<span className="text-red-500">*</span></label>
          <input id="amount" type="number" min="0.01" step="0.01" className={`${inputClass} mt-1.5`} {...register('amount', { required: t("Amount is required."), min: { value: 0.01, message: t("Must be greater than zero.") } })} />
          {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
        </div>

        <div>
          <label htmlFor="payment_method" className={labelClass}>{t("Payment method")}</label>
          <select id="payment_method" className={`${inputClass} mt-1.5`} {...register('payment_method')}>
            {METHODS.map((method) => <option key={method.value} value={method.value}>{t(method.label)}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelClass}>{t("Description")}</label>
          <input id="description" className={`${inputClass} mt-1.5`} {...register('description')} />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t("Cancel")}</button>
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
          {isSubmitting ? t("Generating...") : t("Generate control number")}
        </button>
      </div>
    </form>
  )
}
