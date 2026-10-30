import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { listStudents } from '../../api/students'
import { createParent, updateParent } from '../../api/people'

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

export function ParentForm({ parent, onClose, onSaved }) {
  const isEdit = Boolean(parent)
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      username: parent?.username ?? '',
      full_name: parent?.full_name ?? '',
      email: parent?.email ?? '',
      phone: parent?.phone ?? '',
      password: '',
      is_active: parent?.is_active ?? true,
    },
  })

  const [students, setStudents] = useState([])
  const [children, setChildren] = useState(
    (parent?.children ?? []).map((child) => ({
      student_id: child.id,
      full_name: child.full_name,
      student_number: child.student_number,
      relationship: child.relationship ?? '',
      is_primary: Boolean(child.is_primary),
    })),
  )

  useEffect(() => {
    let active = true

    listStudents({ per_page: 100 })
      .then((response) => {
        if (active) setStudents(response.data)
      })
      .catch(() => {
        if (active) toast.error('Unable to load students.')
      })

    return () => {
      active = false
    }
  }, [])

  const toggleStudent = (student) => {
    setChildren((current) => {
      const exists = current.some((child) => child.student_id === student.id)

      if (exists) {
        return current.filter((child) => child.student_id !== student.id)
      }

      return [
        ...current,
        {
          student_id: student.id,
          full_name: student.full_name,
          student_number: student.student_number,
          relationship: 'parent',
          is_primary: false,
        },
      ]
    })
  }

  const updateChild = (studentId, patch) => {
    setChildren((current) =>
      current.map((child) => (child.student_id === studentId ? { ...child, ...patch } : child)),
    )
  }

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      is_active: Boolean(values.is_active),
      children: children.map(({ student_id, relationship, is_primary }) => ({
        student_id,
        relationship,
        is_primary: Boolean(is_primary),
      })),
    }

    if (!payload.password) delete payload.password

    try {
      if (isEdit) {
        await updateParent(parent.id, payload)
        toast.success('Parent updated')
      } else {
        await createParent(payload)
        toast.success('Parent created')
      }

      onSaved()
      onClose()
    } catch (error) {
      const data = error.response?.data
      const validationErrors = data?.errors ?? {}

      Object.entries(validationErrors).forEach(([field, messages]) => {
        setError(field, { type: 'server', message: messages[0] })
      })

      toast.error(data?.message ?? 'Unable to save parent.')
    }
  }

  const selectedIds = new Set(children.map((child) => child.student_id))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
          <input id="phone" className={`${inputClass} mt-1.5`} placeholder="+2557XXXXXXXX" {...register('phone')} />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
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

      <section className="rounded-xl border border-border">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Linked children</h3>
          <p className="text-xs text-muted-foreground">Select the students this parent can view and pay for.</p>
        </div>

        <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
          {students.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">No students available.</p>
          ) : (
            students.map((student) => (
              <div key={student.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
                <label className="flex items-center gap-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(student.id)}
                    onChange={() => toggleStudent(student)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-blue-500"
                  />
                  <span>
                    <span className="font-medium text-foreground">{student.full_name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{student.student_number}</span>
                  </span>
                </label>

                {selectedIds.has(student.id) && (
                  <div className="flex items-center gap-3">
                    <input
                      value={children.find((child) => child.student_id === student.id)?.relationship ?? ''}
                      onChange={(event) => updateChild(student.id, { relationship: event.target.value })}
                      placeholder="Relationship"
                      className="w-32 rounded-lg border border-border px-2 py-1 text-xs outline-none focus:border-primary"
                    />
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={Boolean(children.find((child) => child.student_id === student.id)?.is_primary)}
                        onChange={(event) => updateChild(student.id, { is_primary: event.target.checked })}
                        className="h-3.5 w-3.5 rounded border-border text-primary"
                      />
                      Primary
                    </label>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
          {isSubmitting ? 'Saving...' : isEdit ? 'Update parent' : 'Create parent'}
        </button>
      </div>
    </form>
  )
}
