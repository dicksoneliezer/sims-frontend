import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { getSchoolSettings, updateSchoolSettings } from '../../api/settings'

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

const FIELDS = [
  { name: 'school_name', label: 'School name', required: true },
  { name: 'school_motto', label: 'School motto' },
  { name: 'head_teacher_name', label: 'Head teacher' },
  { name: 'school_phone', label: 'Phone' },
  { name: 'school_email', label: 'Email', type: 'email' },
  { name: 'school_website', label: 'Website' },
  { name: 'academic_year', label: 'Academic year' },
  { name: 'current_term', label: 'Current term' },
  { name: 'currency', label: 'Currency' },
  { name: 'timezone', label: 'Timezone' },
]

export function SchoolProfilePanel() {
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {},
  })

  useEffect(() => {
    getSchoolSettings()
      .then((settings) => reset(settings ?? {}))
      .catch(() => toast.error('Unable to load school settings.'))
  }, [reset])

  const onSubmit = async (values) => {
    try {
      const updated = await updateSchoolSettings(values)
      reset(updated ?? values)
      toast.success('School profile saved')
    } catch (error) {
      const data = error.response?.data
      Object.entries(data?.errors ?? {}).forEach(([field, messages]) => {
        setError(field, { type: 'server', message: messages[0] })
      })
      toast.error(data?.message ?? 'Unable to save school profile.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.name} className={field.name === 'school_name' || field.name === 'school_motto' ? 'sm:col-span-2' : ''}>
            <label htmlFor={field.name} className={labelClass}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              id={field.name}
              type={field.type ?? 'text'}
              className={`${inputClass} mt-1.5`}
              {...register(field.name, field.required ? { required: `${field.label} is required.` } : {})}
            />
            {errors[field.name] && <p className={errorClass}>{errors[field.name].message}</p>}
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="school_address" className={labelClass}>Address</label>
        <textarea id="school_address" rows={3} className={`${inputClass} mt-1.5`} {...register('school_address')} />
        {errors.school_address && <p className={errorClass}>{errors.school_address.message}</p>}
      </div>

      <div className="flex justify-end border-t border-border pt-4">
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
          {isSubmitting ? 'Saving...' : 'Save school profile'}
        </button>
      </div>
    </form>
  )
}
