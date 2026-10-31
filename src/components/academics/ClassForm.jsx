import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { createClass, updateClass } from '../../api/academics'
import { SCHOOL_LEVELS } from '../../utils/constants'

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

export function ClassForm({ schoolClass, teachers, onClose, onSaved }) {
  useLanguage()
  const isEdit = Boolean(schoolClass)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: schoolClass?.name ?? '',
      level: schoolClass?.level ?? 'secondary',
      section: schoolClass?.section ?? '',
      capacity: schoolClass?.capacity ?? 40,
      class_teacher_id: schoolClass?.class_teacher_id ?? '',
      is_active: schoolClass?.is_active ?? true,
    },
  })

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      section: values.section || null,
      capacity: values.capacity === '' ? 0 : Number(values.capacity),
      class_teacher_id: values.class_teacher_id ? Number(values.class_teacher_id) : null,
      is_active: Boolean(values.is_active),
    }

    try {
      if (isEdit) {
        await updateClass(schoolClass.id, payload)
        toast.success(t("Class updated"))
      } else {
        await createClass(payload)
        toast.success(t("Class created"))
      }

      onSaved()
      onClose()
    } catch (error) {
      const data = error.response?.data
      Object.entries(data?.errors ?? {}).forEach(([field, messages]) => {
        setError(field, { type: 'server', message: messages[0] })
      })
      toast.error(data?.message ?? t("Unable to save class."))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>{t("Class name")}<span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            className={`${inputClass} mt-1.5`}
            placeholder={t("e.g. Form 1A")}
            {...register('name', { required: t("Class name is required.") })}
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="level" className={labelClass}>{t("Level")}<span className="text-red-500">*</span>
          </label>
          <select id="level" className={`${inputClass} mt-1.5`} {...register('level')}>
            {Object.entries(SCHOOL_LEVELS).map(([value, label]) => (
              <option key={value} value={value}>
                {t(label)}
              </option>
            ))}
          </select>
          {errors.level && <p className={errorClass}>{errors.level.message}</p>}
        </div>
        <div>
          <label htmlFor="section" className={labelClass}>{t("Section")}</label>
          <input id="section" className={`${inputClass} mt-1.5`} placeholder="e.g. A" {...register('section')} />
          {errors.section && <p className={errorClass}>{errors.section.message}</p>}
        </div>
        <div>
          <label htmlFor="capacity" className={labelClass}>{t("Capacity")}</label>
          <input
            id="capacity"
            type="number"
            min="0"
            max="500"
            className={`${inputClass} mt-1.5`}
            {...register('capacity', { min: { value: 0, message: t("Capacity cannot be negative.") } })}
          />
          {errors.capacity && <p className={errorClass}>{errors.capacity.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="class_teacher_id" className={labelClass}>{t("Class teacher")}</label>
          <select id="class_teacher_id" className={`${inputClass} mt-1.5`} {...register('class_teacher_id')}>
            <option value="">{t("Not assigned")}</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.full_name}
              </option>
            ))}
          </select>
          {errors.class_teacher_id && <p className={errorClass}>{errors.class_teacher_id.message}</p>}
        </div>
        <div className="flex items-end pb-2 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input type="checkbox" className="h-4 w-4 rounded border-border" {...register('is_active')} />{t("Active class")}</label>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >{t("Cancel")}</button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
        >
          {isSubmitting ? t("Saving...") : isEdit ? t("Save changes") : t("Create class")}
        </button>
      </div>
    </form>
  )
}
