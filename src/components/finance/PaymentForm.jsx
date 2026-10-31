import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { recordPayment } from '../../api/finance'
import { formatMoney } from '../../utils/format'

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

const METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'tigopesa', label: 'Tigo Pesa' },
  { value: 'airtel', label: 'Airtel Money' },
  { value: 'bank', label: 'Bank transfer' },
]

export function PaymentForm({ invoice, onClose, onSaved }) {
  useLanguage()
  const { register, handleSubmit, watch, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      amount: invoice?.balance ?? '',
      payment_method: 'cash',
      description: '',
      phone_number: '',
    },
  })

  const method = watch('payment_method')
  const requiresPhone = ['mpesa', 'tigopesa', 'airtel'].includes(method)

  const onSubmit = async (values) => {
    try {
      await recordPayment({
        student_id: invoice.student_id,
        invoice_id: invoice.id,
        amount: Number(values.amount),
        payment_method: values.payment_method,
        description: values.description || null,
        phone_number: values.phone_number || null,
      })

      toast.success(t("Payment recorded"))
      onSaved()
      onClose()
    } catch (error) {
      const data = error.response?.data
      const validationErrors = data?.errors ?? {}

      Object.entries(validationErrors).forEach(([field, messages]) => {
        setError(field, { type: 'server', message: messages[0] })
      })

      toast.error(data?.message ?? t("Unable to record payment."))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm">
        <p className="font-medium text-foreground">{invoice.invoice_number}</p>
        <p className="text-muted-foreground">{invoice.student?.full_name ?? t("Student")}</p>
        <p className="mt-1 text-muted-foreground">{t("Outstanding balance: ")}<span className="font-semibold text-foreground">{formatMoney(invoice.balance)}</span></p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="amount" className={labelClass}>{t("Amount (TZS) ")}<span className="text-red-500">*</span></label>
          <input id="amount" type="number" min="0.01" step="0.01" className={`${inputClass} mt-1.5`} {...register('amount', { required: t("Amount is required."), min: { value: 0.01, message: t("Must be greater than zero.") } })} />
          {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
        </div>

        <div>
          <label htmlFor="payment_method" className={labelClass}>{t("Method")}</label>
          <select id="payment_method" className={`${inputClass} mt-1.5`} {...register('payment_method')}>
            {METHODS.map((methodItem) => <option key={methodItem.value} value={methodItem.value}>{t(methodItem.label)}</option>)}
          </select>
        </div>

        {requiresPhone && (
          <div className="sm:col-span-2">
            <label htmlFor="phone_number" className={labelClass}>{t("Phone number ")}<span className="text-red-500">*</span></label>
            <input id="phone_number" className={`${inputClass} mt-1.5`} placeholder={t("+2557XXXXXXXX")} {...register('phone_number', { required: t("Phone number is required for mobile money.") })} />
            {errors.phone_number && <p className={errorClass}>{errors.phone_number.message}</p>}
          </div>
        )}

        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelClass}>{t("Description")}</label>
          <input id="description" className={`${inputClass} mt-1.5`} {...register('description')} />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t("Cancel")}</button>
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-emerald-700 disabled:opacity-60">
          {isSubmitting ? t("Recording...") : t("Record payment")}
        </button>
      </div>
    </form>
  )
}
