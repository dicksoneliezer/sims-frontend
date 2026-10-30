import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { createGrade, deleteGrade, listGrades, updateGrade } from '../../api/settings'
import { Modal } from '../common/Modal'

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

function GradeForm({ grade, onClose, onSaved }) {
  const isEdit = Boolean(grade)
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      grade: grade?.grade ?? '',
      min_marks: grade?.min_marks ?? 0,
      max_marks: grade?.max_marks ?? 100,
      points: grade?.points ?? '',
      remarks: grade?.remarks ?? '',
    },
  })

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await updateGrade(grade.id, values)
        toast.success('Grade updated')
      } else {
        await createGrade(values)
        toast.success('Grade added')
      }
      onSaved()
      onClose()
    } catch (error) {
      const data = error.response?.data
      Object.entries(data?.errors ?? {}).forEach(([field, messages]) => {
        setError(field, { type: 'server', message: messages[0] })
      })
      toast.error(data?.message ?? 'Unable to save grade.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="grade" className={labelClass}>Grade <span className="text-red-500">*</span></label>
          <input id="grade" className={`${inputClass} mt-1.5`} {...register('grade', { required: 'Grade is required.' })} />
          {errors.grade && <p className={errorClass}>{errors.grade.message}</p>}
        </div>
        <div>
          <label htmlFor="points" className={labelClass}>Points</label>
          <input id="points" type="number" min="0" className={`${inputClass} mt-1.5`} {...register('points')} />
          {errors.points && <p className={errorClass}>{errors.points.message}</p>}
        </div>
        <div>
          <label htmlFor="min_marks" className={labelClass}>Minimum marks <span className="text-red-500">*</span></label>
          <input id="min_marks" type="number" step="0.01" min="0" max="100" className={`${inputClass} mt-1.5`} {...register('min_marks', { required: 'Minimum marks are required.' })} />
          {errors.min_marks && <p className={errorClass}>{errors.min_marks.message}</p>}
        </div>
        <div>
          <label htmlFor="max_marks" className={labelClass}>Maximum marks <span className="text-red-500">*</span></label>
          <input id="max_marks" type="number" step="0.01" min="0" max="100" className={`${inputClass} mt-1.5`} {...register('max_marks', { required: 'Maximum marks are required.' })} />
          {errors.max_marks && <p className={errorClass}>{errors.max_marks.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="remarks" className={labelClass}>Remarks</label>
          <input id="remarks" className={`${inputClass} mt-1.5`} {...register('remarks')} />
          {errors.remarks && <p className={errorClass}>{errors.remarks.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
          {isSubmitting ? 'Saving...' : isEdit ? 'Update grade' : 'Add grade'}
        </button>
      </div>
    </form>
  )
}

export function GradingPanel() {
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)

  const load = () => {
    setLoading(true)
    listGrades()
      .then(setGrades)
      .catch(() => toast.error('Unable to load grading system.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (grade) => {
    if (!window.confirm(`Delete grade ${grade.grade}?`)) return

    try {
      await deleteGrade(grade.id)
      toast.success('Grade deleted')
      load()
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to delete grade.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Grade boundaries and points used for exam results.</p>
        <button type="button" onClick={() => setForm({ grade: null })} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
          <FiPlus className="h-4 w-4" /> Add grade
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Grade</th>
              <th className="px-4 py-3">Marks range</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Remarks</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
            ) : grades.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No grades configured.</td></tr>
            ) : grades.map((grade) => (
              <tr key={grade.id} className="hover:bg-muted/70">
                <td className="px-4 py-3 font-semibold text-foreground">{grade.grade}</td>
                <td className="px-4 py-3 text-muted-foreground">{grade.min_marks} - {grade.max_marks}</td>
                <td className="px-4 py-3 text-muted-foreground">{grade.points ?? '-'}</td>
                <td className="px-4 py-3 text-muted-foreground">{grade.remarks ?? '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={() => setForm({ grade })} className="rounded-lg p-2 text-muted-foreground hover:bg-warning-soft hover:text-warning" aria-label={`Edit grade ${grade.grade}`}><FiEdit2 className="h-4 w-4" /></button>
                    <button type="button" onClick={() => handleDelete(grade)} className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger" aria-label={`Delete grade ${grade.grade}`}><FiTrash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal title={form.grade ? 'Edit grade' : 'Add grade'} onClose={() => setForm(null)} width="max-w-xl">
          <GradeForm grade={form.grade} onClose={() => setForm(null)} onSaved={load} />
        </Modal>
      )}
    </div>
  )
}
