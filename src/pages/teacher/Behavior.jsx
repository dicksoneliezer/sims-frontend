import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { FiAlertTriangle, FiEdit2, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { listStudentsFor } from '../../api/students'
import { createBehaviorRecord, deleteBehaviorRecord, getBehaviorRecords, updateBehaviorRecord } from '../../api/teaching'
import { Modal } from '../../components/common/Modal'
import { formatDate } from '../../utils/format'

const SEVERITIES = ['low', 'medium', 'high']

const severityTone = {
  low: 'bg-success-soft text-success',
  medium: 'bg-warning-soft text-warning',
  high: 'bg-danger-soft text-danger',
}

const emptyForm = {
  id: null,
  student_id: '',
  date: dayjs().format('YYYY-MM-DD'),
  category: '',
  severity: 'low',
  description: '',
  action_taken: '',
}

export default function TeacherBehavior() {
  useLanguage()
  const [records, setRecords] = useState([])
  const [students, setStudents] = useState([])
  const [severity, setSeverity] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState(null)

  useEffect(() => {
    let active = true

    listStudentsFor('teacher', { per_page: 100 })
      .then((response) => {
        if (active) setStudents(response.data ?? [])
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load your students."))
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)

    getBehaviorRecords({ severity: severity || undefined, per_page: 100 })
      .then((response) => {
        if (active) setRecords(response.data ?? [])
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load behavior records."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [severity, refreshKey])

  const openCreate = () => setForm({ ...emptyForm })

  const openEdit = (record) => {
    setForm({
      id: record.id,
      student_id: record.student_id,
      date: record.date,
      category: record.category,
      severity: record.severity,
      description: record.description,
      action_taken: record.action_taken ?? '',
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    const payload = {
      student_id: Number(form.student_id),
      date: form.date,
      category: form.category,
      severity: form.severity,
      description: form.description,
      action_taken: form.action_taken || null,
    }

    try {
      if (form.id) {
        await updateBehaviorRecord(form.id, payload)
        toast.success(t("Behavior record updated"))
      } else {
        await createBehaviorRecord(payload)
        toast.success(t("Behavior record created"))
      }

      setForm(null)
      setRefreshKey((key) => key + 1)
    } catch (error) {
      const errors = error.response?.data?.errors
      toast.error(errors ? Object.values(errors).flat()[0] : error.response?.data?.message ?? t("Unable to save behavior record."))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (record) => {
    if (!window.confirm(t("Delete this {0} severity record for {1}?", [record.severity, record.student?.full_name]))) return

    try {
      await deleteBehaviorRecord(record.id)
      toast.success(t("Behavior record deleted"))
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? t("Unable to delete record."))
    }
  }

  return (
    // Hapa tunaondoa AppLayout na MODULES_BY_ROLE kabisa. Tunabaki na div ya maudhui pekee.
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiAlertTriangle className="h-5 w-5 text-warning" />{t(" Student behavior")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Log behavior incidents, actions taken and severity for your students.")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
          <button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
            <FiPlus className="h-4 w-4" />{t(" Record incident")}</button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("Severity")}</span>
            <select value={severity} onChange={(event) => setSeverity(event.target.value)} className="min-w-40 rounded-lg border border-border px-3 py-2 outline-none focus:border-primary">
              <option value="">{t("All severities")}</option>
              {SEVERITIES.map((item) => <option key={item} value={item} className="capitalize">{item}</option>)}
            </select>
          </label>
          <p className="ml-auto text-sm text-muted-foreground">{records.length}{t(" record(s)")}</p>
        </div>

        {loading ? (
          <div className="py-14 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
        ) : records.length === 0 ? (
          <p className="px-4 py-14 text-center text-muted-foreground">{t("No behavior records found.")}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {records.map((record) => (
              <article key={record.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{record.student?.full_name ?? t("Student")}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${severityTone[record.severity] ?? 'bg-muted text-muted-foreground'}`}>{t(record.severity)}</span>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{record.category}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {record.student?.student_number} · {formatDate(record.date)}{t(" · Recorded by ")}{record.teacher_name ?? t("you")}
                  </p>
                  <p className="mt-2 text-sm text-foreground">{record.description}</p>
                  {record.action_taken && <p className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-muted-foreground">{t("Action taken:")}</span> {record.action_taken}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => openEdit(record)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-primary" aria-label={t("Edit record")}><FiEdit2 className="h-4 w-4" /></button>
                  <button type="button" onClick={() => handleDelete(record)} className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger" aria-label={t("Delete record")}><FiTrash2 className="h-4 w-4" /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {form && (
        <Modal title={form.id ? t("Edit behavior record") : t("Record behavior incident")} onClose={() => setForm(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Student")}</span>
                <select required disabled={Boolean(form.id)} value={form.student_id} onChange={(event) => setForm({ ...form, student_id: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary disabled:bg-muted disabled:text-muted-foreground">
                  <option value="">{t("Select a student")}</option>
                  {students.map((student) => <option key={student.id} value={student.id}>{student.full_name} ({student.student_number})</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Date")}</span>
                <input type="date" required max={dayjs().format('YYYY-MM-DD')} value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Category")}</span>
                <input required maxLength={100} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder={t("e.g. Disruption, Late arrival")} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Severity")}</span>
                <select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 capitalize outline-none focus:border-primary">
                  {SEVERITIES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-foreground">{t("Description")}</span>
              <textarea required rows={4} maxLength={2000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-foreground">{t("Action taken (optional)")}</span>
              <textarea rows={3} maxLength={2000} value={form.action_taken} onChange={(event) => setForm({ ...form, action_taken: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
            </label>
            {form.id && <p className="rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">{t("The student on an existing behavior record cannot be changed.")}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t("Cancel")}</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">{saving ? t("Saving...") : t("Save record")}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}