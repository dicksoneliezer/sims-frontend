import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { listClasses } from '../../api/academics'
import { createFeeStructure, updateFeeStructure } from '../../api/finance'
import { SCHOOL_LEVELS } from '../../utils/constants'

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

export function FeeStructureForm({ fee, onClose, onSaved }) {
  useLanguage()
  const isEdit = Boolean(fee)
  const [classes, setClasses] = useState([])
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: fee?.name ?? '',
      class_id: fee?.class_id ?? '',
      school_level: fee?.school_level ?? 'secondary',
      term: fee?.term ?? 'Term 1',
      academic_year: fee?.academic_year ?? String(new Date().getFullYear()),
      amount: fee?.amount ?? '',
      description: fee?.description ?? '',
      is_active: fee?.is_active ?? true,
    },
  })

  useEffect(() => {
    let active = true

    listClasses({ per_page: 100 })
      .then((response) => {
        if (active) setClasses(response.data)
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load classes."))
      })

    return () => {
      active = false
    }
  }, [])

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      class_id: values.class_id === '' ? null : Number(values.class_id),
      amount: Number(values.amount),
      is_active: Boolean(values.is_active),
    }

    try {
      if (isEdit) {
        await updateFeeStructure(fee.id, payload)
        toast.success(t("Fee structure updated"))
      } else {
        await createFeeStructure(payload)
        toast.success(t("Fee structure created"))
      }

      onSaved()
      onClose()
    } catch (error) {
      const data = error.response?.data
      const validationErrors = data?.errors ?? {}

      Object.entries(validationErrors).forEach(([field, messages]) => {
        setError(field, { type: 'server', message: messages[0] })
      })

      toast.error(data?.message ?? t("Unable to save fee structure."))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className={labelClass}>{t("Name ")}<span className="text-red-500">*</span></label>
          <input id="name" className={`${inputClass} mt-1.5`} placeholder={t("e.g. Form 1A Term 1 Tuition")} {...register('name', { required: t("Name is required.") })} />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="class_id" className={labelClass}>{t("Class")}</label>
          <select id="class_id" className={`${inputClass} mt-1.5`} {...register('class_id')}>
            <option value="">{t("All classes in level")}</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          {errors.class_id && <p className={errorClass}>{errors.class_id.message}</p>}
        </div>

        <div>
          <label htmlFor="school_level" className={labelClass}>{t("School level")}</label>
          <select id="school_level" className={`${inputClass} mt-1.5`} {...register('school_level')}>
            {Object.entries(SCHOOL_LEVELS).map(([value, label]) => (
              <option key={value} value={value}>{t(label)}</option>
            ))}
          </select>
          {errors.school_level && <p className={errorClass}>{errors.school_level.message}</p>}
        </div>

        <div>
          <label htmlFor="term" className={labelClass}>{t("Term")}</label>
          <input id="term" className={`${inputClass} mt-1.5`} {...register('term')} />
          {errors.term && <p className={errorClass}>{errors.term.message}</p>}
        </div>

        <div>
          <label htmlFor="academic_year" className={labelClass}>{t("Academic year")}</label>
          <input id="academic_year" className={`${inputClass} mt-1.5`} {...register('academic_year')} />
          {errors.academic_year && <p className={errorClass}>{errors.academic_year.message}</p>}
        </div>

        <div>
          <label htmlFor="amount" className={labelClass}>{t("Amount (TZS) ")}<span className="text-red-500">*</span></label>
          <input id="amount" type="number" min="0" step="0.01" className={`${inputClass} mt-1.5`} {...register('amount', { required: t("Amount is required."), min: { value: 0, message: t("Cannot be negative.") } })} />
          {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelClass}>{t("Description")}</label>
          <textarea id="description" rows={3} className={`${inputClass} mt-1.5`} {...register('description')} />
          {errors.description && <p className={errorClass}>{errors.description.message}</p>}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-blue-500" {...register('is_active')} />{t("Active fee structure")}</label>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t("Cancel")}</button>
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
          {isSubmitting ? t("Saving...") : isEdit ? t("Update fee") : t("Create fee")}
        </button>
      </div>
    </form>
  )
}
