import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { createTeacher, updateTeacher } from '../../api/academics'

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

export function TeacherForm({ teacher, onClose, onSaved }) {
  const isEdit = Boolean(teacher)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: teacher?.username ?? '',
      full_name: teacher?.full_name ?? '',
      email: teacher?.email ?? '',
      phone: teacher?.phone ?? '',
      employment_id: teacher?.employment_id ?? '',
      password: '',
      is_active: teacher?.is_active ?? true,
    },
  })

  const onSubmit = async (values) => {
    const payload = {
      username: values.username,
      full_name: values.full_name,
      email: values.email || null,
      phone: values.phone || null,
      employment_id: values.employment_id || null,
      is_active: Boolean(values.is_active),
    }

    if (values.password) payload.password = values.password

    try {
      if (isEdit) {
        await updateTeacher(teacher.id, payload)
        toast.success('Teacher updated')
      } else {
        await createTeacher(payload)
        toast.success('Teacher created')
      }

      onSaved()
      onClose()
    } catch (error) {
      const data = error.response?.data
      Object.entries(data?.errors ?? {}).forEach(([field, messages]) => {
        setError(field, { type: 'server', message: messages[0] })
      })
      toast.error(data?.message ?? 'Unable to save teacher.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="full_name" className={labelClass}>
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            id="full_name"
            className={`${inputClass} mt-1.5`}
            placeholder="e.g. John Mushi"
            {...register('full_name', { required: 'Full name is required.' })}
          />
          {errors.full_name && <p className={errorClass}>{errors.full_name.message}</p>}
        </div>
        <div>
          <label htmlFor="username" className={labelClass}>
            Username <span className="text-red-500">*</span>
          </label>
          <input
            id="username"
            className={`${inputClass} mt-1.5`}
            placeholder="e.g. jmushi"
            {...register('username', {
              required: 'Username is required.',
              pattern: { value: /^[a-zA-Z0-9_-]+$/, message: 'Use letters, numbers, dashes or underscores.' },
            })}
          />
          {errors.username && <p className={errorClass}>{errors.username.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input id="email" type="email" className={`${inputClass} mt-1.5`} {...register('email')} />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
          </label>
          <input id="phone" className={`${inputClass} mt-1.5`} {...register('phone')} />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>
        <div>
          <label htmlFor="employment_id" className={labelClass}>
            Employment ID
          </label>
          <input id="employment_id" className={`${inputClass} mt-1.5`} {...register('employment_id')} />
          {errors.employment_id && <p className={errorClass}>{errors.employment_id.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>
            Password {!isEdit && <span className="text-red-500">*</span>}
          </label>
          <input
            id="password"
            type="password"
            className={`${inputClass} mt-1.5`}
            placeholder={isEdit ? 'Leave blank to keep current password' : 'At least 8 characters'}
            {...register('password', {
              required: isEdit ? false : 'Password is required.',
              minLength: { value: 8, message: 'Password must be at least 8 characters.' },
            })}
          />
          {errors.password && <p className={errorClass}>{errors.password.message}</p>}
        </div>
        <div className="flex items-end pb-2 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input type="checkbox" className="h-4 w-4 rounded border-border" {...register('is_active')} />
            Active teacher
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create teacher'}
        </button>
      </div>
    </form>
  )
}
