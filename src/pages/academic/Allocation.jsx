// src/pages/academic/Allocation.jsx
import { useEffect, useRef, useState } from 'react'
import { FiLayers, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const PAGE_SIZE = 20

export default function AcademicAllocation() {
  const [assignments, setAssignments] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [dropdownsLoading, setDropdownsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [page, setPage] = useState(1)
  const [form, setForm] = useState({
    teacher_id: '',
    subject_id: '',
    class_id: '',
    academic_year: new Date().getFullYear().toString(),
  })
  const [saving, setSaving] = useState(false)

  const dropdownsLoaded = useRef(false)

  // =========================================
  // 1. Load dropdowns MARA MOJA tu (per_page: 20)
  // =========================================
  useEffect(() => {
    if (dropdownsLoaded.current) return

    let active = true
    setDropdownsLoading(true)

    Promise.all([
      api.get('/academic/teachers', { params: { per_page: 20 } }).catch(() => ({ data: { data: [] } })),
      api.get('/academic/subjects', { params: { per_page: 20 } }).catch(() => ({ data: { data: [] } })),
      api.get('/academic/classes', { params: { per_page: 20 } }).catch(() => ({ data: { data: [] } })),
    ])
      .then(([teachersRes, subjectsRes, classesRes]) => {
        if (!active) return
        const toArray = (res) => {
          if (Array.isArray(res.data?.data)) return res.data.data
          if (Array.isArray(res.data)) return res.data
          return []
        }
        setTeachers(toArray(teachersRes))
        setSubjects(toArray(subjectsRes))
        setClasses(toArray(classesRes))
        dropdownsLoaded.current = true
      })
      .catch(() => {
        if (active) toast.error('Unable to load dropdowns.')
      })
      .finally(() => {
        if (active) setDropdownsLoading(false)
      })

    return () => { active = false }
  }, [])

  // =========================================
  // 2. Load allocations (pagination)
  // =========================================
  useEffect(() => {
    let active = true
    setLoading(true)

    const timer = setTimeout(() => {
      api.get('/academic/teacher-subjects', { params: { page, per_page: PAGE_SIZE } })
        .then((res) => {
          if (!active) return
          const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
          setAssignments(data)
          setMeta(res.data.meta || { current_page: page, per_page: PAGE_SIZE, total: data.length, last_page: 1 })
        })
        .catch(() => {
          if (active) toast.error('Unable to load allocations.')
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 200)

    return () => {
      clearTimeout(timer)
      active = false
    }
  }, [refreshKey, page])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.post('/academic/teacher-subjects', {
        teacher_id: Number(form.teacher_id),
        subject_id: Number(form.subject_id),
        class_id: Number(form.class_id),
        academic_year: form.academic_year,
      })
      toast.success('Subject allocated successfully')
      setForm({ teacher_id: '', subject_id: '', class_id: '', academic_year: new Date().getFullYear().toString() })
      setPage(1)
      setRefreshKey((key) => key + 1)
    } catch (error) {
      const errors = error.response?.data?.errors
      toast.error(
        errors
          ? Object.values(errors).flat()[0]
          : error.response?.data?.message ?? 'Unable to allocate subject.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this allocation?')) return

    try {
      await api.delete(`/academic/teacher-subjects/${id}`)
      toast.success('Allocation removed')
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to remove allocation.')
    }
  }

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const to = Math.min(meta.current_page * meta.per_page, meta.total)

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiLayers className="h-5 w-5 text-primary" /> Subject Allocation
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Assign subjects to teachers for each class.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </section>

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="font-semibold text-foreground">Assign new subject</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">Teacher</span>
            <select
              required
              value={form.teacher_id}
              onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
              disabled={dropdownsLoading}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary disabled:opacity-60"
            >
              <option value="">{dropdownsLoading ? 'Loading...' : 'Select teacher'}</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.full_name}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">Subject</span>
            <select
              required
              value={form.subject_id}
              onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
              disabled={dropdownsLoading}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary disabled:opacity-60"
            >
              <option value="">{dropdownsLoading ? 'Loading...' : 'Select subject'}</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">Class</span>
            <select
              required
              value={form.class_id}
              onChange={(e) => setForm({ ...form, class_id: e.target.value })}
              disabled={dropdownsLoading}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary disabled:opacity-60"
            >
              <option value="">{dropdownsLoading ? 'Loading...' : 'Select class'}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">Academic year</span>
            <input
              required
              value={form.academic_year}
              onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            <FiPlus className="h-4 w-4" /> {saving ? 'Assigning...' : 'Assign subject'}
          </button>
        </div>
      </form>

      {/* Table */}
      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold text-foreground">Current allocations</h3>
          <p className="text-sm text-muted-foreground">
            {meta.total} {meta.total === 1 ? 'allocation' : 'allocations'} found.
          </p>
        </div>

        {loading ? (
          <div className="p-14 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        ) : assignments.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            No subject allocations yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Academic year</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3 font-medium text-foreground">{a.teacher_name ?? a.teacher?.full_name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.subject_name ?? a.subject?.name ?? '—'} {a.subject_code ? `(${a.subject_code})` : ''}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.class_name ?? a.school_class?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.academic_year ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(a.id)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                        aria-label="Remove allocation"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && assignments.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <p>
              Showing <span className="font-medium text-foreground">{from}</span>–
              <span className="font-medium text-foreground">{to}</span> of{' '}
              <span className="font-medium text-foreground">{meta.total}</span> allocations
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.current_page <= 1}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-1">Page {meta.current_page} of {Math.max(meta.last_page, 1)}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={meta.current_page >= meta.last_page}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}