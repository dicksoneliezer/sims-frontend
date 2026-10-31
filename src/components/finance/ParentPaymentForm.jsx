import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { getChildren } from '../../api/parent'
import {
  generateParentControlNumber,
  getParentPaymentMethods,
  listChildInvoices,
  payParentPayment,
} from '../../api/finance'
import { formatMoney } from '../../utils/format'

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

export function ParentPaymentForm({ onClose, onSaved }) {
  useLanguage()
  const [children, setChildren] = useState([])
  const [invoices, setInvoices] = useState([])
  const [methods, setMethods] = useState([])
  const [payment, setPayment] = useState(null)
  const [instructions, setInstructions] = useState('')
  const [paying, setPaying] = useState(false)
  const requestRef = useRef(0)
  const { register, handleSubmit, watch, reset, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      student_id: '',
      invoice_id: '',
      amount: '',
      payment_method: 'mpesa',
      description: '',
      phone_number: '',
    },
  })

  const studentId = watch('student_id')
  const invoiceId = watch('invoice_id')
  const method = watch('payment_method')
  const activeMethod = methods.find((item) => item.code === method)

  useEffect(() => {
    let active = true

    Promise.all([getChildren(), getParentPaymentMethods()])
      .then(([childList, methodList]) => {
        if (!active) return
        setChildren(childList)
        setMethods(methodList)
        if (childList.length === 1) reset((current) => ({ ...current, student_id: String(childList[0].id) }))
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load payment options."))
      })

    return () => {
      active = false
    }
  }, [reset])

  useEffect(() => {
    if (!studentId) {
      setInvoices([])
      return
    }

    const requestId = requestRef.current + 1
    requestRef.current = requestId

    listChildInvoices(studentId)
      .then((response) => {
        if (requestRef.current === requestId) setInvoices(response.data.filter((invoice) => invoice.balance > 0))
      })
      .catch(() => {
        if (requestRef.current === requestId) toast.error(t("Unable to load invoices."))
      })
  }, [studentId])

  useEffect(() => {
    if (!invoiceId) return

    const invoice = invoices.find((item) => String(item.id) === String(invoiceId))
    if (invoice) reset((current) => ({ ...current, amount: invoice.balance }))
  }, [invoiceId, invoices, reset])

  const handleGenerate = async (values) => {
    try {
      const result = await generateParentControlNumber({
        student_id: Number(values.student_id),
        invoice_id: Number(values.invoice_id),
        amount: Number(values.amount),
        payment_method: values.payment_method,
        description: values.description || null,
      })

      setPayment(result)
      setInstructions(result.payment_instructions?.[values.payment_method] ?? '')
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

  const handlePay = async () => {
    const phoneNumber = payment && activeMethod?.requires_phone ? watch('phone_number') : null

    if (activeMethod?.requires_phone && !phoneNumber) {
      toast.error(t("Enter the mobile money phone number."))
      return
    }

    setPaying(true)

    try {
      const result = await payParentPayment(payment.id, {
        payment_method: payment.payment_method,
        phone_number: phoneNumber || undefined,
      })

      setPayment(result)
      toast.success(t("Payment completed successfully"))
      onSaved()
    } catch (error) {
      toast.error(error.response?.data?.message ?? t("Unable to complete payment."))
    } finally {
      setPaying(false)
    }
  }

  if (payment?.status === 'completed') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-success-soft p-5 text-center">
          <p className="text-sm font-medium text-success">{t("Payment successful")}</p>
          <p className="mt-2 text-2xl font-bold text-emerald-900">{formatMoney(payment.amount)}</p>
          <p className="mt-1 text-sm text-success">{payment.control_number}</p>
          {payment.transaction_ref && <p className="mt-1 text-xs text-success">{t("Ref: ")}{payment.transaction_ref}</p>}
        </div>
        <div className="flex justify-end border-t border-border pt-4">
          <button type="button" onClick={onClose} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">{t("Done")}</button>
        </div>
      </div>
    )
  }

  if (payment) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-blue-200 bg-primary-soft p-4 text-center">
          <p className="text-sm text-primary">{t("Control number")}</p>
          <p className="mt-1 text-2xl font-bold tracking-wide text-blue-900">{payment.control_number}</p>
          <p className="mt-1 text-sm text-primary">{formatMoney(payment.amount)} · {t(payment.payment_method)}</p>
          {payment.expires_at && <p className="mt-1 text-xs text-primary">{t("Valid until ")}{new Date(payment.expires_at).toLocaleString()}</p>}
        </div>

        {instructions && (
          <div className="rounded-lg border border-border bg-muted p-3 text-sm text-foreground">
            <p className="font-medium text-foreground">{t("How to pay")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{instructions}</p>
          </div>
        )}

        {activeMethod?.requires_phone && (
          <div>
            <label htmlFor="phone_number" className={labelClass}>{t("Phone number ")}<span className="text-red-500">*</span></label>
            <input id="phone_number" className={`${inputClass} mt-1.5`} placeholder={t("+2557XXXXXXXX")} {...register('phone_number')} />
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
          <button type="button" onClick={() => setPayment(null)} disabled={paying} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60">{t("Back")}</button>
          <button type="button" onClick={handlePay} disabled={paying} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-emerald-700 disabled:opacity-60">
            {paying ? t("Processing...") : t("Pay now")}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleGenerate)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="student_id" className={labelClass}>{t("Child ")}<span className="text-red-500">*</span></label>
          <select id="student_id" className={`${inputClass} mt-1.5`} {...register('student_id', { required: t("Select a child.") })}>
            <option value="">{t("Select child")}</option>
            {children.map((child) => <option key={child.id} value={child.id}>{child.full_name} · {child.class ?? child.student_number}</option>)}
          </select>
          {errors.student_id && <p className={errorClass}>{errors.student_id.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="invoice_id" className={labelClass}>{t("Invoice ")}<span className="text-red-500">*</span></label>
          <select id="invoice_id" disabled={!studentId} className={`${inputClass} mt-1.5 disabled:bg-muted`} {...register('invoice_id', { required: t("Select an invoice.") })}>
            <option value="">{studentId ? t("Select invoice") : t("Select a child first")}</option>
            {invoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoice_number} · {formatMoney(invoice.balance)}</option>)}
          </select>
          {studentId && invoices.length === 0 && <p className="mt-1 text-xs text-success">{t("No outstanding invoices for this child.")}</p>}
          {errors.invoice_id && <p className={errorClass}>{errors.invoice_id.message}</p>}
        </div>

        <div>
          <label htmlFor="amount" className={labelClass}>{t("Amount (TZS) ")}<span className="text-red-500">*</span></label>
          <input id="amount" type="number" min="0.01" step="0.01" className={`${inputClass} mt-1.5`} {...register('amount', { required: t("Amount is required."), min: { value: 0.01, message: t("Must be greater than zero.") } })} />
          {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
        </div>

        <div>
          <label htmlFor="payment_method" className={labelClass}>{t("Method")}</label>
          <select id="payment_method" className={`${inputClass} mt-1.5`} {...register('payment_method')}>
            {methods.map((item) => <option key={item.code} value={item.code}>{item.name} · {item.processing_time}</option>)}
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
