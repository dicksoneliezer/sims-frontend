import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { FiCalendar, FiEdit2, FiPlus, FiRefreshCw, FiSearch, FiTrash2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createExam, deleteExam, listExams, updateExam } from '../../api/academic'
import { Modal } from '../../components/common/Modal'
import { formatDate } from '../../utils/format'

const EXAM_TYPES = ['exam', 'ca']
const STATUSES = ['draft', 'active', 'completed', 'published']
const TERMS = ['Term 1', 'Term 2', 'Term 3']

const statusTone = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-primary-soft text-primary',
  completed: 'bg-warning-soft text-warning',
  published: 'bg-success-soft text-success',
}

const emptyForm = {
  id: null,
  name: '',
  type: 'exam',
  term: 'Term 1',
  academic_year: dayjs().format('YYYY'),
  start_date: '',
  end_date: '',
  status: 'active',
}

export default function AcademicExams() {
  const [exams, setExams] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, total: 0, last_page: 1 })
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState({ type: '', status: '', term: '', academic_year: '' })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((current) => ({ ...current, search }))
      setPage(1)
    }, 350)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let active = true
    setLoading(true)

    listExams({ ...query, page, per_page: 20 })
      .then((response) => {
        if (!active) return
        setExams(response.data ?? [])
        setMeta(response.meta)
      })
      .catch(() => {
        if (active) toast.error('Unable to load exams.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [query, page, refreshKey])

  const openCreate = () => setForm({ ...emptyForm })

  const openEdit = (exam) => {
    setForm({
      id: exam.id,
      name: exam.name,
      type: exam.type,
      term: exam.term ?? '',
      academic_year: exam.academic_year ?? '',
      start_date: exam.start_date ?? '',
      end_date: exam.end_date ?? '',
      status: exam.status,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    const payload = {
      name: form.name,
      type: form.type,
      term: form.term || null,
      academic_year: form.academic_year || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      status: form.status,
    }

    try {
      if (form.id) {
        await updateExam(form.id, payload)
        toast.success('Exam updated')
      } else {
        await createExam(payload)
        toast.success('Exam created')
      }

      setForm(null)
      setRefreshKey((key) => key + 1)
    } catch (error) {
      const errors = error.response?.data?.errors
      toast.error(errors ? Object.values(errors).flat()[0] : error.response?.data?.message ?? 'Unable to save exam.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (exam) => {
    if (!window.confirm(`Delete ${exam.name}?`)) return

    try {
      await deleteExam(exam.id)
      toast.success('Exam deleted')
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to delete exam.')
    }
  }

  const updateFilter = (field, value) => {
    setQuery((current) => ({ ...current, [field]: value }))
    setPage(1)
  }

  return (
    // Hapa tunaondoa AppLayout na MODULES_BY_ROLE kabisa. Tunabaki na div ya maudhui pekee.
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiCalendar className="h-5 w-5 text-primary" /> Exams and assessments
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Create exam periods and continuous assessment schedules.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
            <FiPlus className="h-4 w-4" /> New exam
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search exams" className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <select value={query.type} onChange={(event) => updateFilter('type', event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">All types</option>
            <option value="exam">Exam</option>
            <option value="ca">Continuous assessment</option>
          </select>
          <select value={query.status} onChange={(event) => updateFilter('status', event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm capitalize outline-none focus:border-primary">
            <option value="">All statuses</option>
            {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select value={query.term} onChange={(event) => updateFilter('term', event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">All terms</option>
            {TERMS.map((term) => <option key={term} value={term}>{term}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Exam</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Term</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Results</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : exams.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-muted-foreground">No exams match your filters.</td></tr>
              ) : exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{exam.name}</p>
                    <p className="text-xs text-muted-foreground">{exam.academic_year ?? 'No academic year'}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{exam.type === 'ca' ? 'CA' : 'Exam'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{exam.term ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {exam.start_date ? formatDate(exam.start_date) : '—'}
                    {exam.end_date ? ` – ${formatDate(exam.end_date)}` : ''}
                  </td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusTone[exam.status] ?? 'bg-muted text-muted-foreground'}`}>{exam.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/academic/results?exam=${exam.id}`} className="font-semibold text-primary hover:text-primary">{exam.results_count ?? 0}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => openEdit(exam)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary" aria-label="Edit exam"><FiEdit2 className="h-4 w-4" /></button>
                      <button type="button" onClick={() => handleDelete(exam)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-danger-soft hover:text-danger" aria-label="Delete exam"><FiTrash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border p-4 text-sm">
          <p className="text-muted-foreground">{meta.total ?? 0} exam(s)</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-border px-3 py-1.5 font-medium text-foreground disabled:opacity-40">Previous</button>
            <span className="text-muted-foreground">Page {meta.current_page ?? 1} of {meta.last_page ?? 1}</span>
            <button type="button" disabled={page >= (meta.last_page ?? 1)} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-border px-3 py-1.5 font-medium text-foreground disabled:opacity-40">Next</button>
          </div>
        </div>
      </section>

      {form && (
        <Modal title={form.id ? 'Edit exam' : 'Create exam'} onClose={() => setForm(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-foreground">Exam name</span>
              <input required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Midterm Examination" className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Type</span>
                <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary">
                  {EXAM_TYPES.map((type) => <option key={type} value={type}>{type === 'ca' ? 'Continuous assessment' : 'Exam'}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Status</span>
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 capitalize outline-none focus:border-primary">
                  {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Term</span>
                <select value={form.term} onChange={(event) => setForm({ ...form, term: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary">
                  <option value="">No term</option>
                  {TERMS.map((term) => <option key={term} value={term}>{term}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Academic year</span>
                <input maxLength={9} value={form.academic_year} onChange={(event) => setForm({ ...form, academic_year: event.target.value })} placeholder="2026" className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Start date</span>
                <input type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">End date</span>
                <input type="date" min={form.start_date || undefined} value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">{saving ? 'Saving...' : 'Save exam'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}