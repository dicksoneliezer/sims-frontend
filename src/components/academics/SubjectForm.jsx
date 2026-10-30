import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { createSubject, updateSubject } from '../../api/academics'
import { SCHOOL_LEVELS } from '../../utils/constants'

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

export function SubjectForm({ subject, prefix, onClose, onSaved }) {
  const isEdit = Boolean(subject)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      code: subject?.code ?? '',
      name: subject?.name ?? '',
      level: subject?.level ?? '',
      description: subject?.description ?? '',
      is_active: subject?.is_active ?? true,
    },
  })

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      level: values.level || null,
      description: values.description || null,
      is_active: Boolean(values.is_active),
    }

    try {
      if (isEdit) {
        await updateSubject(subject.id, payload, prefix)
        toast.success('Subject updated')
      } else {
        await createSubject(payload, prefix)
        toast.success('Subject created')
      }

      onSaved()
      onClose()
    } catch (error) {
      const data = error.response?.data
      Object.entries(data?.errors ?? {}).forEach(([field, messages]) => {
        setError(field, { type: 'server', message: messages[0] })
      })
      toast.error(data?.message ?? 'Unable to save subject.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="code" className={labelClass}>
            Code <span className="text-red-500">*</span>
          </label>
          <input
            id="code"
            className={`${inputClass} mt-1.5 uppercase`}
            placeholder="e.g. MATH"
            {...register('code', { required: 'Code is required.' })}
          />
          {errors.code && <p className={errorClass}>{errors.code.message}</p>}
        </div>
        <div>
          <label htmlFor="name" className={labelClass}>
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            className={`${inputClass} mt-1.5`}
            placeholder="e.g. Mathematics"
            {...register('name', { required: 'Name is required.' })}
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="level" className={labelClass}>
            Level
          </label>
          <select id="level" className={`${inputClass} mt-1.5`} {...register('level')}>
            <option value="">All levels</option>
            {Object.entries(SCHOOL_LEVELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.level && <p className={errorClass}>{errors.level.message}</p>}
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input type="checkbox" className="h-4 w-4 rounded border-border" {...register('is_active')} />
            Active subject
          </label>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className={`${inputClass} mt-1.5`}
            placeholder="Optional notes about this subject"
            {...register('description')}
          />
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
          {isSubmitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create subject'}
        </button>
      </div>
    </form>
  )
}
