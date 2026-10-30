import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { createAccountant, updateAccountant } from '../../api/people'

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

export function AccountantForm({ accountant, onClose, onSaved }) {
  const isEdit = Boolean(accountant)
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      username: accountant?.username ?? '',
      full_name: accountant?.full_name ?? '',
      email: accountant?.email ?? '',
      phone: accountant?.phone ?? '',
      nin_number: accountant?.nin_number ?? '',
      employment_id: accountant?.employment_id ?? '',
      password: '',
      is_active: accountant?.is_active ?? true,
    },
  })

  const onSubmit = async (values) => {
    const payload = { ...values, is_active: Boolean(values.is_active) }

    if (!payload.password) delete payload.password

    try {
      if (isEdit) {
        await updateAccountant(accountant.id, payload)
        toast.success('Accountant updated')
      } else {
        await createAccountant(payload)
        toast.success('Accountant created')
      }

      onSaved()
      onClose()
    } catch (error) {
      const data = error.response?.data
      const validationErrors = data?.errors ?? {}

      Object.entries(validationErrors).forEach(([field, messages]) => {
        setError(field, { type: 'server', message: messages[0] })
      })

      toast.error(data?.message ?? 'Unable to save accountant.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="username" className={labelClass}>Username <span className="text-red-500">*</span></label>
          <input id="username" className={`${inputClass} mt-1.5`} {...register('username', { required: 'Username is required.' })} />
          {errors.username && <p className={errorClass}>{errors.username.message}</p>}
        </div>

        <div>
          <label htmlFor="full_name" className={labelClass}>Full name <span className="text-red-500">*</span></label>
          <input id="full_name" className={`${inputClass} mt-1.5`} {...register('full_name', { required: 'Full name is required.' })} />
          {errors.full_name && <p className={errorClass}>{errors.full_name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input id="email" type="email" className={`${inputClass} mt-1.5`} {...register('email')} />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>Phone</label>
          <input id="phone" className={`${inputClass} mt-1.5`} {...register('phone')} />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="nin_number" className={labelClass}>NIN number</label>
          <input id="nin_number" className={`${inputClass} mt-1.5`} {...register('nin_number')} />
          {errors.nin_number && <p className={errorClass}>{errors.nin_number.message}</p>}
        </div>

        <div>
          <label htmlFor="employment_id" className={labelClass}>Employment ID</label>
          <input id="employment_id" className={`${inputClass} mt-1.5`} {...register('employment_id')} />
          {errors.employment_id && <p className={errorClass}>{errors.employment_id.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="password" className={labelClass}>
            Password {isEdit ? <span className="text-muted-foreground">(leave blank to keep current)</span> : <span className="text-red-500">*</span>}
          </label>
          <input
            id="password"
            type="password"
            className={`${inputClass} mt-1.5`}
            {...register('password', isEdit ? {} : { required: 'Password is required.', minLength: { value: 8, message: 'At least 8 characters.' } })}
          />
          {errors.password && <p className={errorClass}>{errors.password.message}</p>}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-blue-500" {...register('is_active')} />
        Active account
      </label>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
          {isSubmitting ? 'Saving...' : isEdit ? 'Update accountant' : 'Create accountant'}
        </button>
      </div>
    </form>
  )
}
