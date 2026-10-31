import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { createStudent, updateStudent } from '../../api/students'

const LEVELS = [
  { value: 'pre_primary', label: 'Pre-primary' },
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
]

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'

const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

export function StudentForm({ student, onClose, onSaved }) {
  useLanguage()
  const isEdit = Boolean(student)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      full_name: student?.full_name ?? '',
      student_number: student?.student_number ?? '',
      class: student?.class ?? '',
      school_level: student?.school_level ?? 'secondary',
      gender: student?.gender ?? 'male',
      date_of_birth: student?.date_of_birth ?? '',
      parent_phone: student?.parent_phone ?? '',
      email: student?.email ?? '',
      residence: student?.residence ?? '',
      opening_balance: student?.opening_balance ?? 0,
      as_of_date: student?.as_of_date ?? '',
      is_active: student?.is_active ?? true,
    },
  })

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      opening_balance: values.opening_balance === '' ? 0 : Number(values.opening_balance),
      // HAKIKISHA is_active ni boolean halisi (true / false)
      is_active: values.is_active === true || values.is_active === 'true' || values.is_active === 'on' || values.is_active === 1 || values.is_active === '1',
    }

    if (!values.photo?.[0]) {
      delete payload.photo
    } else {
      payload.photo = values.photo[0]
    }

    if (isEdit) delete payload.student_number
    if (!payload.student_number) delete payload.student_number

    try {
      if (isEdit) {
        await updateStudent(student.id, payload)
        toast.success(t("Student updated"))
      } else {
        await createStudent(payload)
        toast.success(t("Student created"))
      }

      onSaved()
      onClose()
    } catch (error) {
      const data = error.response?.data
      const validationErrors = data?.errors ?? {}

      Object.entries(validationErrors).forEach(([field, messages]) => {
        setError(field, { type: 'server', message: messages[0] })
      })

      toast.error(data?.message ?? t("Unable to save student."))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="full_name" className={labelClass}>{t("Full name")}<span className="text-red-500">*</span>
          </label>
          <input
            id="full_name"
            className={`${inputClass} mt-1.5`}
            placeholder={t("e.g. Amina Hassan")}
            {...register('full_name', { required: t("Full name is required.") })}
          />
          {errors.full_name && <p className={errorClass}>{errors.full_name.message}</p>}
        </div>

        <div>
          <label htmlFor="student_number" className={labelClass}>{t("Student number")}</label>
          <input
            id="student_number"
            className={`${inputClass} mt-1.5 disabled:bg-muted disabled:text-muted-foreground`}
            placeholder={t("Auto-generated if empty")}
            disabled={isEdit}
            {...register('student_number')}
          />
          {errors.student_number && <p className={errorClass}>{errors.student_number.message}</p>}
        </div>

        <div>
          <label htmlFor="class" className={labelClass}>{t("Class")}</label>
          <input
            id="class"
            className={`${inputClass} mt-1.5`}
            placeholder={t("e.g. Form 1A")}
            {...register('class')}
          />
          {errors.class && <p className={errorClass}>{errors.class.message}</p>}
        </div>

        <div>
          <label htmlFor="school_level" className={labelClass}>{t("School level")}</label>
          <select id="school_level" className={`${inputClass} mt-1.5`} {...register('school_level')}>
            {LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {t(level.label)}
              </option>
            ))}
          </select>
          {errors.school_level && <p className={errorClass}>{errors.school_level.message}</p>}
        </div>

        <div>
          <label htmlFor="gender" className={labelClass}>{t("Gender")}</label>
          <select id="gender" className={`${inputClass} mt-1.5`} {...register('gender')}>
            <option value="male">{t("Male")}</option>
            <option value="female">{t("Female")}</option>
          </select>
          {errors.gender && <p className={errorClass}>{errors.gender.message}</p>}
        </div>

        <div>
          <label htmlFor="date_of_birth" className={labelClass}>{t("Date of birth")}</label>
          <input
            id="date_of_birth"
            type="date"
            className={`${inputClass} mt-1.5`}
            {...register('date_of_birth')}
          />
          {errors.date_of_birth && <p className={errorClass}>{errors.date_of_birth.message}</p>}
        </div>

        <div>
          <label htmlFor="parent_phone" className={labelClass}>{t("Parent phone")}</label>
          <input
            id="parent_phone"
            className={`${inputClass} mt-1.5`}
            placeholder={t("+2557XXXXXXXX")}
            {...register('parent_phone')}
          />
          {errors.parent_phone && <p className={errorClass}>{errors.parent_phone.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>{t("Email")}</label>
          <input
            id="email"
            type="email"
            className={`${inputClass} mt-1.5`}
            placeholder="student@school.ac.tz"
            {...register('email')}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="residence" className={labelClass}>{t("Residence")}</label>
          <input
            id="residence"
            className={`${inputClass} mt-1.5`}
            placeholder={t("e.g. Mikocheni")}
            {...register('residence')}
          />
          {errors.residence && <p className={errorClass}>{errors.residence.message}</p>}
        </div>

        <div>
          <label htmlFor="opening_balance" className={labelClass}>{t("Opening balance (TZS)")}</label>
          <input
            id="opening_balance"
            type="number"
            min="0"
            step="0.01"
            className={`${inputClass} mt-1.5`}
            {...register('opening_balance', { min: { value: 0, message: t("Cannot be negative.") } })}
          />
          {errors.opening_balance && <p className={errorClass}>{errors.opening_balance.message}</p>}
        </div>

        <div>
          <label htmlFor="as_of_date" className={labelClass}>{t("Balance as of")}</label>
          <input
            id="as_of_date"
            type="date"
            className={`${inputClass} mt-1.5`}
            {...register('as_of_date')}
          />
          {errors.as_of_date && <p className={errorClass}>{errors.as_of_date.message}</p>}
        </div>

        <div>
          <label htmlFor="photo" className={labelClass}>{t("Photo")}</label>
          <input
            id="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-1.5 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-slate-200"
            {...register('photo')}
          />
          {errors.photo && <p className={errorClass}>{errors.photo.message}</p>}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border text-primary focus:ring-blue-500"
          {...register('is_active')}
        />{t("Active student")}</label>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
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
          {isSubmitting ? t("Saving...") : isEdit ? t("Update student") : t("Create student")}
        </button>
      </div>
    </form>
  )
}