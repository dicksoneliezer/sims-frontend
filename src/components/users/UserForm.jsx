import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { createUser, updateUser } from '../../api/users'
import { ROLE_LABELS } from '../../utils/constants'

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

const ROLE_OPTIONS = Object.entries(ROLE_LABELS)

export function UserForm({ user, onClose, onSaved }) {
  useLanguage()
  const isEdit = Boolean(user)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: user?.username ?? '',
      full_name: user?.full_name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      nin_number: user?.nin_number ?? '',
      employment_id: user?.employment_id ?? '',
      role: user?.role ?? 'teacher',
      password: '',
      is_active: user?.is_active ?? true,
    },
  })

  const onSubmit = async (values) => {
    const payload = { ...values, is_active: Boolean(values.is_active) }

    if (!payload.password) delete payload.password

    try {
      if (isEdit) {
        await updateUser(user.id, payload)
        toast.success(t("User updated"))
      } else {
        await createUser(payload)
        toast.success(t("User created"))
      }

      onSaved()
      onClose()
    } catch (error) {
      const data = error.response?.data
      const validationErrors = data?.errors ?? {}

      Object.entries(validationErrors).forEach(([field, messages]) => {
        setError(field, { type: 'server', message: messages[0] })
      })

      toast.error(data?.message ?? t("Unable to save user."))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="username" className={labelClass}>{t("Username ")}<span className="text-red-500">*</span></label>
          <input id="username" className={`${inputClass} mt-1.5`} {...register('username', { required: t("Username is required.") })} />
          {errors.username && <p className={errorClass}>{errors.username.message}</p>}
        </div>

        <div>
          <label htmlFor="full_name" className={labelClass}>{t("Full name ")}<span className="text-red-500">*</span></label>
          <input id="full_name" className={`${inputClass} mt-1.5`} {...register('full_name', { required: t("Full name is required.") })} />
          {errors.full_name && <p className={errorClass}>{errors.full_name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>{t("Email")}</label>
          <input id="email" type="email" className={`${inputClass} mt-1.5`} {...register('email')} />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>{t("Phone")}</label>
          <input id="phone" className={`${inputClass} mt-1.5`} {...register('phone')} />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="role" className={labelClass}>{t("Role ")}<span className="text-red-500">*</span></label>
          <select id="role" className={`${inputClass} mt-1.5`} {...register('role', { required: t("Role is required.") })}>
            {ROLE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>{t(label)}</option>
            ))}
          </select>
          {errors.role && <p className={errorClass}>{errors.role.message}</p>}
        </div>

        <div>
          <label htmlFor="employment_id" className={labelClass}>{t("Employment ID")}</label>
          <input id="employment_id" className={`${inputClass} mt-1.5`} {...register('employment_id')} />
          {errors.employment_id && <p className={errorClass}>{errors.employment_id.message}</p>}
        </div>

        <div>
          <label htmlFor="nin_number" className={labelClass}>{t("NIN number")}</label>
          <input id="nin_number" className={`${inputClass} mt-1.5`} {...register('nin_number')} />
          {errors.nin_number && <p className={errorClass}>{errors.nin_number.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>{t("Password")}{isEdit ? <span className="text-muted-foreground">{t("(leave blank to keep current)")}</span> : <span className="text-red-500">*</span>}
          </label>
          <input
            id="password"
            type="password"
            className={`${inputClass} mt-1.5`}
            {...register('password', isEdit ? {} : { required: t("Password is required."), minLength: { value: 8, message: t("At least 8 characters.") } })}
          />
          {errors.password && <p className={errorClass}>{errors.password.message}</p>}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-blue-500" {...register('is_active')} />{t("Active account")}</label>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t("Cancel")}</button>
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
          {isSubmitting ? t("Saving...") : isEdit ? t("Update user") : t("Create user")}
        </button>
      </div>
    </form>
  )
}
