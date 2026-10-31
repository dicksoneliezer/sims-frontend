import { t as translateUI } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
// src/pages/matron/Leaves.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FiLogOut,
  FiRefreshCw,
  FiPlus,
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiFilter,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate } from '../../utils/format'

const PAGE_SIZE = 20

const LEAVE_TYPES = [
  { value: 'home', label: 'Home visit' },
  { value: 'sick', label: 'Sick leave' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'other', label: 'Other' },
]

const STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
]

export default function MatronLeaves() {
  useLanguage()
  const [leaves, setLeaves] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterOverdue, setFilterOverdue] = useState(false)

  const studentsLoaded = useRef(false)

  const [form, setForm] = useState({
    student_id: '',
    type: 'home',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date().toISOString().slice(0, 10),
    destination: '',
    reason: '',
  })

  // =========================================
  // 1. Load students MARA MOJA tu
  // =========================================
  useEffect(() => {
    if (studentsLoaded.current) return

    let active = true
    setStudentsLoading(true)

    api.get('/matron/students', { params: { per_page: 50 } })
      .then((res) => {
        if (!active) return
        const data = Array.isArray(res.data) ? res.data : res.data.data || []
        setStudents(data)
        studentsLoaded.current = true
      })
      .catch(() => {
        if (active) toast.error(translateUI("Unable to load students."))
      })
      .finally(() => {
        if (active) setStudentsLoading(false)
      })

    return () => { active = false }
  }, [])

  // =========================================
  // 2. Load leaves (pagination + filters + debounce)
  // =========================================
  useEffect(() => {
    let active = true
    setLoading(true)

    const params = { page, per_page: PAGE_SIZE }
    if (filterStatus) params.status = filterStatus
    if (filterOverdue) params.overdue = 1

    const timer = setTimeout(() => {
      api.get('/matron/leaves', { params })
        .then((res) => {
          if (!active) return
          const data = Array.isArray(res.data) ? res.data : res.data.data || []
          setLeaves(data)
          setMeta(res.data.meta || { current_page: page, per_page: PAGE_SIZE, total: data.length, last_page: 1 })
        })
        .catch(() => {
          if (active) toast.error(translateUI("Unable to load leaves."))
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 300)

    return () => {
      clearTimeout(timer)
      active = false
    }
  }, [refreshKey, page, filterStatus, filterOverdue])

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.student_id) {
      toast.error(translateUI("Please select a student."))
      return
    }
    try {
      setSaving(true)
      await api.post('/matron/leaves', form)
      toast.success(translateUI("Leave request submitted."))
      setShowForm(false)
      setForm({
        student_id: '',
        type: 'home',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date().toISOString().slice(0, 10),
        destination: '',
        reason: '',
      })
      setPage(1)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      toast.error(err?.response?.data?.message || translateUI("Unable to submit leave."))
    } finally {
      setSaving(false)
    }
  }

  const approve = async (id) => {
    try {
      await api.put(`/matron/leaves/${id}/approve`)
      toast.success(translateUI("Leave approved."))
      setRefreshKey((k) => k + 1)
    } catch {
      toast.error(translateUI("Unable to approve leave."))
    }
  }

  const reject = async (id) => {
    try {
      await api.put(`/matron/leaves/${id}/reject`)
      toast.success(translateUI("Leave rejected."))
      setRefreshKey((k) => k + 1)
    } catch {
      toast.error(translateUI("Unable to reject leave."))
    }
  }

  const checkIn = async (id) => {
    try {
      await api.put(`/matron/leaves/${id}/check-in`)
      toast.success(translateUI("Student checked in."))
      setRefreshKey((k) => k + 1)
    } catch {
      toast.error(translateUI("Unable to check in."))
    }
  }

  const statusBadge = (status) => {
    const map = {
      pending: 'bg-warning-soft text-warning',
      approved: 'bg-success-soft text-success',
      rejected: 'bg-danger-soft text-danger',
      completed: 'bg-primary-soft text-primary',
    }
    return map[status] || 'bg-muted text-muted-foreground'
  }

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const to = Math.min(meta.current_page * meta.per_page, meta.total)

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiLogOut className="h-5 w-5 text-primary" />{translateUI(" Student Leaves")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{translateUI("Record check-outs, check-ins, and track overdue returns.")}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{translateUI(" Refresh")}</button>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition"
          >
            {showForm ? <FiX className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
            {showForm ? translateUI("Close") : translateUI("New Leave")}
          </button>
        </div>
      </section>

      {/* Form */}
      {showForm && (
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h3 className="font-semibold text-foreground">{translateUI("Request a new leave")}</h3>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{translateUI("Student")}</span>
              <select
                name="student_id"
                value={form.student_id}
                onChange={handleChange}
                required
                disabled={studentsLoading}
                className="rounded-lg border border-border bg-surface px-3 py-2 disabled:opacity-60"
              >
                <option value="">{studentsLoading ? translateUI("Loading students...") : translateUI("Select student")}</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name} ({s.student_number})</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{translateUI("Type")}</span>
              <select name="type" value={form.type} onChange={handleChange} required className="rounded-lg border border-border bg-surface px-3 py-2">
                {LEAVE_TYPES.map((t) => <option key={t.value} value={t.value}>{translateUI(t.label)}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{translateUI("Start date")}</span>
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required className="rounded-lg border border-border bg-surface px-3 py-2" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{translateUI("End date")}</span>
              <input type="date" name="end_date" value={form.end_date} onChange={handleChange} required className="rounded-lg border border-border bg-surface px-3 py-2" />
            </label>
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="text-muted-foreground">{translateUI("Destination")}</span>
              <input type="text" name="destination" value={form.destination} onChange={handleChange} placeholder={translateUI("e.g. Dar es Salaam")} className="rounded-lg border border-border bg-surface px-3 py-2" />
            </label>
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="text-muted-foreground">{translateUI("Reason")}</span>
              <textarea name="reason" rows={2} value={form.reason} onChange={handleChange} className="rounded-lg border border-border bg-surface px-3 py-2" />
            </label>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
                {saving ? translateUI("Saving...") : translateUI("Submit leave")}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border bg-surface px-4 py-2 text-sm">{translateUI("Cancel")}</button>
            </div>
          </form>
        </section>
      )}

      {/* Filters */}
      <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground"><FiFilter className="h-4 w-4" />{translateUI(" Filters")}</span>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>{translateUI("Status")}</span>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm"
            >
              {STATUS_FILTERS.map((f) => <option key={f.value} value={f.value}>{translateUI(f.label)}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filterOverdue}
              onChange={(e) => { setFilterOverdue(e.target.checked); setPage(1) }}
              className="rounded border-border"
            />
            <span className="flex items-center gap-1 text-muted-foreground"><FiAlertTriangle className="h-3 w-3 text-danger" />{translateUI(" Overdue only")}</span>
          </label>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{translateUI("Student")}</th>
                <th className="px-4 py-3">{translateUI("Type")}</th>
                <th className="px-4 py-3">{translateUI("Start")}</th>
                <th className="px-4 py-3">{translateUI("End")}</th>
                <th className="px-4 py-3">{translateUI("Destination")}</th>
                <th className="px-4 py-3">{translateUI("Status")}</th>
                <th className="px-4 py-3 text-right">{translateUI("Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center"><div role="status" aria-label={translateUI("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-muted-foreground">{translateUI("No leaves recorded yet.")}</td></tr>
              ) : leaves.map((l) => {
                const isOverdue = l.status === 'approved' && l.end_date < today
                return (
                  <tr key={l.id} className={`hover:bg-muted/70 ${isOverdue ? 'bg-danger-soft/30' : ''}`}>
                    <td className="px-4 py-3 font-medium text-foreground">{l.student?.full_name ?? '—'}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{l.type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(l.start_date)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(l.end_date)}
                      {isOverdue && <span className="ml-2 rounded-full bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">{translateUI("Overdue")}</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{l.destination ?? '—'}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadge(l.status)}`}>{translateUI(l.status)}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {l.status === 'pending' && (
                          <>
                            <button onClick={() => approve(l.id)} className="rounded p-1 text-success hover:bg-success-soft" title={translateUI("Approve")}><FiCheckCircle className="h-4 w-4" /></button>
                            <button onClick={() => reject(l.id)} className="rounded p-1 text-danger hover:bg-danger-soft" title={translateUI("Reject")}><FiXCircle className="h-4 w-4" /></button>
                          </>
                        )}
                        {l.status === 'approved' && (
                          <button onClick={() => checkIn(l.id)} className="rounded p-1 text-primary hover:bg-primary-soft" title={translateUI("Check in")}><FiLogOut className="h-4 w-4 rotate-180" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && leaves.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <p>{translateUI("Showing")}<span className="font-medium text-foreground">{from}</span>–
              <span className="font-medium text-foreground">{to}</span>{translateUI(" of")}{' '}
              <span className="font-medium text-foreground">{meta.total}</span>{translateUI(" leaves")}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.current_page <= 1}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >{translateUI("Previous")}</button>
              <span className="px-1">{translateUI("Page ")}{meta.current_page}{translateUI(" of ")}{Math.max(meta.last_page, 1)}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={meta.current_page >= meta.last_page}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >{translateUI("Next")}</button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}