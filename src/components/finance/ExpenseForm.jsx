import { SchoolFileLink } from '../common/SchoolFileLink'
import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { createExpense, updateExpense } from '../../api/finance'

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

const CATEGORIES = ['Salaries', 'Utilities', 'Supplies', 'Maintenance', 'Transport', 'Food', 'Medical', 'Other']
const METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'tigopesa', label: 'Tigo Pesa' },
  { value: 'airtel', label: 'Airtel Money' },
  { value: 'bank', label: 'Bank transfer' },
]

export function ExpenseForm({ expense, onClose, onSaved }) {
  useLanguage()
  const isEdit = Boolean(expense)
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      category: expense?.category ?? 'Supplies',
      description: expense?.description ?? '',
      amount: expense?.amount ?? '',
      expense_date: expense?.expense_date ?? new Date().toISOString().slice(0, 10),
      paid_to: expense?.paid_to ?? '',
      payment_method: expense?.payment_method ?? 'cash',
    },
  })

  const onSubmit = async (values) => {
    const formData = new FormData()
    formData.append('category', values.category)
    formData.append('description', values.description ?? '')
    formData.append('amount', values.amount)
    formData.append('expense_date', values.expense_date)
    formData.append('paid_to', values.paid_to ?? '')
    formData.append('payment_method', values.payment_method ?? '')

    if (values.receipt?.[0]) formData.append('receipt', values.receipt[0])
    if (isEdit && values.remove_receipt) formData.append('remove_receipt', '1')

    try {
      if (isEdit) {
        formData.append('_method', 'PUT')
        await updateExpense(expense.id, formData)
        toast.success(t("Expense updated"))
      } else {
        await createExpense(formData)
        toast.success(t("Expense recorded"))
      }

      onSaved()
      onClose()
    } catch (error) {
      const data = error.response?.data
      const validationErrors = data?.errors ?? {}

      Object.entries(validationErrors).forEach(([field, messages]) => {
        setError(field, { type: 'server', message: messages[0] })
      })

      toast.error(data?.message ?? t("Unable to save expense."))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={labelClass}>{t("Category ")}<span className="text-red-500">*</span></label>
          <select id="category" className={`${inputClass} mt-1.5`} {...register('category', { required: t("Category is required.") })}>
            {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          {errors.category && <p className={errorClass}>{errors.category.message}</p>}
        </div>

        <div>
          <label htmlFor="amount" className={labelClass}>{t("Amount (TZS) ")}<span className="text-red-500">*</span></label>
          <input id="amount" type="number" min="0.01" step="0.01" className={`${inputClass} mt-1.5`} {...register('amount', { required: t("Amount is required."), min: { value: 0.01, message: t("Must be greater than zero.") } })} />
          {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
        </div>

        <div>
          <label htmlFor="expense_date" className={labelClass}>{t("Expense date ")}<span className="text-red-500">*</span></label>
          <input id="expense_date" type="date" className={`${inputClass} mt-1.5`} {...register('expense_date', { required: t("Date is required.") })} />
          {errors.expense_date && <p className={errorClass}>{errors.expense_date.message}</p>}
        </div>

        <div>
          <label htmlFor="payment_method" className={labelClass}>{t("Payment method")}</label>
          <select id="payment_method" className={`${inputClass} mt-1.5`} {...register('payment_method')}>
            {METHODS.map((method) => <option key={method.value} value={method.value}>{t(method.label)}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="paid_to" className={labelClass}>{t("Paid to")}</label>
          <input id="paid_to" className={`${inputClass} mt-1.5`} placeholder={t("Vendor or person")} {...register('paid_to')} />
          {errors.paid_to && <p className={errorClass}>{errors.paid_to.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelClass}>{t("Description")}</label>
          <textarea id="description" rows={3} className={`${inputClass} mt-1.5`} {...register('description')} />
          {errors.description && <p className={errorClass}>{errors.description.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="receipt" className={labelClass}>{t("Receipt")}</label>
          <input id="receipt" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" className={`${inputClass} mt-1.5 file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs`} {...register('receipt')} />
          {expense?.receipt_url && (
            <div className="mt-2 flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              <SchoolFileLink href={expense.receipt_url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">{t("View current receipt")}</SchoolFileLink>
              <label className="flex items-center gap-1.5"><input type="checkbox" className="h-3.5 w-3.5" {...register('remove_receipt')} />{t(" Remove")}</label>
            </div>
          )}
          {errors.receipt && <p className={errorClass}>{errors.receipt.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t("Cancel")}</button>
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
          {isSubmitting ? t("Saving...") : isEdit ? t("Update expense") : t("Record expense")}
        </button>
      </div>
    </form>
  )
}
