import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { createCalendarEvent, deleteCalendarEvent, listCalendarEvents, updateCalendarEvent } from '../../api/settings'
import { formatDate } from '../../utils/format'
import { Modal } from '../common/Modal'

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

const TYPES = ['event', 'holiday', 'term', 'exam', 'meeting']

const TYPE_STYLES = {
  event: 'bg-primary-soft text-primary',
  holiday: 'bg-warning-soft text-warning',
  term: 'bg-success-soft text-success',
  exam: 'bg-danger-soft text-danger',
  meeting: 'bg-info-soft text-violet-700',
}

function CalendarEventForm({ event, onClose, onSaved }) {
  const isEdit = Boolean(event)
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: event?.title ?? '',
      description: event?.description ?? '',
      start_date: event?.start_date ?? '',
      end_date: event?.end_date ?? '',
      type: event?.type ?? 'event',
    },
  })

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await updateCalendarEvent(event.id, values)
        toast.success('Calendar event updated')
      } else {
        await createCalendarEvent(values)
        toast.success('Calendar event added')
      }
      onSaved()
      onClose()
    } catch (error) {
      const data = error.response?.data
      Object.entries(data?.errors ?? {}).forEach(([field, messages]) => {
        setError(field, { type: 'server', message: messages[0] })
      })
      toast.error(data?.message ?? 'Unable to save calendar event.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="title" className={labelClass}>Title <span className="text-red-500">*</span></label>
        <input id="title" className={`${inputClass} mt-1.5`} {...register('title', { required: 'Title is required.' })} />
        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>Description</label>
        <textarea id="description" rows={3} className={`${inputClass} mt-1.5`} {...register('description')} />
        {errors.description && <p className={errorClass}>{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="start_date" className={labelClass}>Start date <span className="text-red-500">*</span></label>
          <input id="start_date" type="date" className={`${inputClass} mt-1.5`} {...register('start_date', { required: 'Start date is required.' })} />
          {errors.start_date && <p className={errorClass}>{errors.start_date.message}</p>}
        </div>
        <div>
          <label htmlFor="end_date" className={labelClass}>End date <span className="text-red-500">*</span></label>
          <input id="end_date" type="date" className={`${inputClass} mt-1.5`} {...register('end_date', { required: 'End date is required.' })} />
          {errors.end_date && <p className={errorClass}>{errors.end_date.message}</p>}
        </div>
        <div>
          <label htmlFor="type" className={labelClass}>Type</label>
          <select id="type" className={`${inputClass} mt-1.5`} {...register('type')}>
            {TYPES.map((type) => <option key={type} value={type} className="capitalize">{type}</option>)}
          </select>
          {errors.type && <p className={errorClass}>{errors.type.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
          {isSubmitting ? 'Saving...' : isEdit ? 'Update event' : 'Add event'}
        </button>
      </div>
    </form>
  )
}

export function CalendarPanel() {
  const [events, setEvents] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: 25, total: 0, last_page: 1 })
  const [type, setType] = useState('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)

  const load = () => {
    setLoading(true)
    listCalendarEvents({ type, per_page: 50 })
      .then((response) => {
        setEvents(response.data)
        setMeta(response.meta)
      })
      .catch(() => toast.error('Unable to load academic calendar.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [type])

  const handleDelete = async (event) => {
    if (!window.confirm(`Delete "${event.title}"?`)) return

    try {
      await deleteCalendarEvent(event.id)
      toast.success('Calendar event deleted')
      load()
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to delete calendar event.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">School terms, holidays, exams and meetings.</p>
          <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">All types</option>
            {TYPES.map((item) => <option key={item} value={item} className="capitalize">{item}</option>)}
          </select>
        </div>
        <button type="button" onClick={() => setForm({ event: null })} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
          <FiPlus className="h-4 w-4" /> Add event
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
            ) : events.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No calendar events found.</td></tr>
            ) : events.map((event) => (
              <tr key={event.id} className="hover:bg-muted/70">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{event.title}</p>
                  {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${TYPE_STYLES[event.type] ?? 'bg-muted text-muted-foreground'}`}>{event.type}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(event.start_date)}
                  {event.end_date && event.end_date !== event.start_date && ` - ${formatDate(event.end_date)}`}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={() => setForm({ event })} className="rounded-lg p-2 text-muted-foreground hover:bg-warning-soft hover:text-warning" aria-label={`Edit ${event.title}`}><FiEdit2 className="h-4 w-4" /></button>
                    <button type="button" onClick={() => handleDelete(event)} className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger" aria-label={`Delete ${event.title}`}><FiTrash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{meta.total} event(s) configured.</p>

      {form && (
        <Modal title={form.event ? 'Edit calendar event' : 'Add calendar event'} onClose={() => setForm(null)}>
          <CalendarEventForm event={form.event} onClose={() => setForm(null)} onSaved={load} />
        </Modal>
      )}
    </div>
  )
}
