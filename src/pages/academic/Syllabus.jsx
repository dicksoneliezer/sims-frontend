import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { FiBookOpen, FiCheckCircle, FiEdit2, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-toastify'
import {
  createSyllabusTopic,
  deleteSyllabusTopic,
  listSyllabus,
  listSyllabusProgress,
  saveSyllabusProgress,
  updateSyllabusTopic,
} from '../../api/academic'
import { Modal } from '../../components/common/Modal'
import { formatDate } from '../../utils/format'

const PROGRESS_STATUSES = ['not_started', 'in_progress', 'completed']

const progressTone = {
  not_started: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary-soft text-primary',
  completed: 'bg-success-soft text-success',
}

const emptyForm = {
  id: null,
  subject_id: '',
  class_id: '',
  title: '',
  description: '',
  term: 'Term 1',
  week: '',
  sort_order: '0',
}

export default function AcademicSyllabus() {
  useLanguage()
  const [tab, setTab] = useState('topics')
  const [topics, setTopics] = useState([])
  const [progressRecords, setProgressRecords] = useState([])
  const [filters, setFilters] = useState({ subjects: [], classes: [] })
  const [query, setQuery] = useState({ subject_id: '', class_id: '', term: '', search: '' })
  const [progressQuery, setProgressQuery] = useState({ subject_id: '', class_id: '', status: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState(null)
  const [progressForm, setProgressForm] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)

    listSyllabus({ ...query, per_page: 100 })
      .then((response) => {
        if (!active) return
        setTopics(response.data ?? [])
        setFilters(response.filters ?? { subjects: [], classes: [] })
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load syllabus topics."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [query, refreshKey])

  useEffect(() => {
    if (tab !== 'progress') return undefined

    let active = true
    setLoading(true)

    listSyllabusProgress({ ...progressQuery, per_page: 100 })
      .then((response) => {
        if (active) setProgressRecords(response.data ?? [])
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load syllabus progress."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [tab, progressQuery, refreshKey])

  const openCreate = () => setForm({ ...emptyForm })

  const openEdit = (topic) => {
    setForm({
      id: topic.id,
      subject_id: topic.subject_id,
      class_id: topic.class_id,
      title: topic.title,
      description: topic.description ?? '',
      term: topic.term,
      week: topic.week ?? '',
      sort_order: topic.sort_order ?? 0,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    const payload = {
      subject_id: Number(form.subject_id),
      class_id: Number(form.class_id),
      title: form.title,
      description: form.description || null,
      term: form.term,
      week: form.week ? Number(form.week) : null,
      sort_order: form.sort_order ? Number(form.sort_order) : 0,
    }

    try {
      if (form.id) {
        await updateSyllabusTopic(form.id, payload)
        toast.success(t("Syllabus topic updated"))
      } else {
        await createSyllabusTopic(payload)
        toast.success(t("Syllabus topic created"))
      }

      setForm(null)
      setRefreshKey((key) => key + 1)
    } catch (error) {
      const errors = error.response?.data?.errors
      toast.error(errors ? Object.values(errors).flat()[0] : error.response?.data?.message ?? t("Unable to save syllabus topic."))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (topic) => {
    if (!window.confirm(t("Delete syllabus topic \"{0}\"?", [topic.title]))) return

    try {
      await deleteSyllabusTopic(topic.id)
      toast.success(t("Syllabus topic deleted"))
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? t("Unable to delete syllabus topic."))
    }
  }

  const openProgress = (topic) => {
    setProgressForm({
      syllabus_topic_id: topic.id,
      title: topic.title,
      status: 'in_progress',
      completion_date: '',
      remarks: '',
    })
  }

  const handleProgressSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      await saveSyllabusProgress({
        syllabus_topic_id: progressForm.syllabus_topic_id,
        status: progressForm.status,
        completion_date: progressForm.completion_date || null,
        remarks: progressForm.remarks || null,
      })
      toast.success(t("Syllabus progress saved"))
      setProgressForm(null)
      setRefreshKey((key) => key + 1)
    } catch (error) {
      const errors = error.response?.data?.errors
      toast.error(errors ? Object.values(errors).flat()[0] : error.response?.data?.message ?? t("Unable to save progress."))
    } finally {
      setSaving(false)
    }
  }

  const updateQuery = (field, value) => setQuery((current) => ({ ...current, [field]: value }))
  const updateProgressQuery = (field, value) => setProgressQuery((current) => ({ ...current, [field]: value }))

  return (
    // Hapa tunaondoa AppLayout na MODULES_BY_ROLE kabisa. Tunabaki na div ya maudhui pekee.
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiBookOpen className="h-5 w-5 text-primary" />{t(" Syllabus and coverage")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Manage curriculum topics and track teaching progress by class.")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {[['topics', 'Topics'], ['progress', 'Progress']].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setTab(value)} className={`rounded-md px-3 py-1.5 text-sm font-medium ${tab === value ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground'}`}>{t(label)}</button>
            ))}
          </div>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
          <button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
            <FiPlus className="h-4 w-4" />{t(" New topic")}</button>
        </div>
      </section>

      {tab === 'topics' ? (
        <section className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="grid gap-3 border-b border-border p-4 md:grid-cols-4">
            <input type="search" value={query.search} onChange={(event) => updateQuery('search', event.target.value)} placeholder={t("Search topics")} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            <select value={query.subject_id} onChange={(event) => updateQuery('subject_id', event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">{t("All subjects")}</option>
              {filters.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
            <select value={query.class_id} onChange={(event) => updateQuery('class_id', event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">{t("All classes")}</option>
              {filters.classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <input value={query.term} onChange={(event) => updateQuery('term', event.target.value)} placeholder={t("Term")} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{t("Topic")}</th>
                  <th className="px-4 py-3">{t("Subject")}</th>
                  <th className="px-4 py-3">{t("Class")}</th>
                  <th className="px-4 py-3">{t("Term / week")}</th>
                  <th className="px-4 py-3 text-right">{t("Progress entries")}</th>
                  <th className="px-4 py-3 text-right">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-14 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
                ) : topics.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-14 text-center text-muted-foreground">{t("No syllabus topics match your filters.")}</td></tr>
                ) : topics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{topic.title}</p>
                      {topic.description && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{topic.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{topic.subject?.name} <span className="text-xs text-muted-foreground">({topic.subject?.code})</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{topic.class_name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{topic.term} {topic.week ? t("· Week {0}", [topic.week]) : ''}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{topic.progress_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => openProgress(topic)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-success-soft hover:text-success" aria-label={t("Record progress")}><FiCheckCircle className="h-4 w-4" /></button>
                        <button type="button" onClick={() => openEdit(topic)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary" aria-label={t("Edit topic")}><FiEdit2 className="h-4 w-4" /></button>
                        <button type="button" onClick={() => handleDelete(topic)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-danger-soft hover:text-danger" aria-label={t("Delete topic")}><FiTrash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="grid gap-3 border-b border-border p-4 md:grid-cols-3">
            <select value={progressQuery.subject_id} onChange={(event) => updateProgressQuery('subject_id', event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">{t("All subjects")}</option>
              {filters.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
            <select value={progressQuery.class_id} onChange={(event) => updateProgressQuery('class_id', event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">{t("All classes")}</option>
              {filters.classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select value={progressQuery.status} onChange={(event) => updateProgressQuery('status', event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">{t("All statuses")}</option>
              {PROGRESS_STATUSES.map((status) => <option key={status} value={status}>{t(status.replace('_', ' '))}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="py-14 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : progressRecords.length === 0 ? (
            <p className="px-4 py-14 text-center text-muted-foreground">{t("No progress records found. Record progress from the Topics tab.")}</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {progressRecords.map((record) => (
                <div key={record.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{record.topic?.title}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${progressTone[record.status] ?? 'bg-muted text-muted-foreground'}`}>{t(record.status.replace('_', ' '))}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {record.topic?.subject ?? t("Subject")} · {record.topic?.term ?? t("No term")} · {record.topic?.week ? t("Week {0}", [record.topic.week]) : t("No week")} · {record.teacher_name}
                    </p>
                    {record.remarks && <p className="mt-1 text-sm text-muted-foreground">{record.remarks}</p>}
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">{record.completion_date ? t("Completed {0}", [formatDate(record.completion_date)]) : t("Updated {0}", [formatDate(record.updated_at)])}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {form && (
        <Modal title={form.id ? t("Edit syllabus topic") : t("New syllabus topic")} onClose={() => setForm(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-foreground">{t("Topic title")}</span>
              <input required maxLength={200} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Subject")}</span>
                <select required value={form.subject_id} onChange={(event) => setForm({ ...form, subject_id: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary">
                  <option value="">{t("Select a subject")}</option>
                  {filters.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Class")}</span>
                <select required value={form.class_id} onChange={(event) => setForm({ ...form, class_id: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary">
                  <option value="">{t("Select a class")}</option>
                  {filters.classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Term")}</span>
                <input required value={form.term} onChange={(event) => setForm({ ...form, term: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Week")}</span>
                <input type="number" min="1" max="52" value={form.week} onChange={(event) => setForm({ ...form, week: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-foreground">{t("Description (optional)")}</span>
              <textarea rows={4} maxLength={3000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t("Cancel")}</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">{saving ? t("Saving...") : t("Save topic")}</button>
            </div>
          </form>
        </Modal>
      )}

      {progressForm && (
        <Modal title={t("Record syllabus progress")} description={progressForm.title} onClose={() => setProgressForm(null)}>
          <form onSubmit={handleProgressSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Status")}</span>
                <select value={progressForm.status} onChange={(event) => setProgressForm({ ...progressForm, status: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 capitalize outline-none focus:border-primary">
                  {PROGRESS_STATUSES.map((status) => <option key={status} value={status}>{t(status.replace('_', ' '))}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Completion date (optional)")}</span>
                <input type="date" max={dayjs().format('YYYY-MM-DD')} value={progressForm.completion_date} onChange={(event) => setProgressForm({ ...progressForm, completion_date: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-foreground">{t("Remarks (optional)")}</span>
              <textarea rows={3} maxLength={2000} value={progressForm.remarks} onChange={(event) => setProgressForm({ ...progressForm, remarks: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setProgressForm(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t("Cancel")}</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">{saving ? t("Saving...") : t("Save progress")}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}