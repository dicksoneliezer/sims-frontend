// src/pages/matron/RollCall.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FiCheckSquare,
  FiRefreshCw,
  FiPlus,
  FiX,
  FiFilter,
  FiUsers,
  FiUserX,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate } from '../../utils/format'

const PAGE_SIZE = 20

const SESSIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' },
]

export default function MatronRollCall() {
  const [rollCalls, setRollCalls] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [dormitories, setDormitories] = useState([])
  const [loading, setLoading] = useState(true)
  const [dormsLoading, setDormsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({ date: '', session: '', dormitory_id: '' })

  const dormsLoaded = useRef(false)

  const [form, setForm] = useState({
    dormitory_id: '',
    session: 'morning',
    date: new Date().toISOString().slice(0, 10),
    total_present: '',
    total_absent: '',
    notes: '',
  })

  // =========================================
  // 1. Load dormitories MARA MOJA tu
  // =========================================
  useEffect(() => {
    if (dormsLoaded.current) return

    let active = true
    setDormsLoading(true)

    api.get('/matron/dormitories')
      .then((res) => {
        if (!active) return
        const data = Array.isArray(res.data) ? res.data : res.data.data || []
        setDormitories(data)
        dormsLoaded.current = true
      })
      .catch(() => {
        if (active) toast.error('Unable to load dormitories.')
      })
      .finally(() => {
        if (active) setDormsLoading(false)
      })

    return () => { active = false }
  }, [])

  // =========================================
  // 2. Load roll calls (pagination + filters + debounce)
  // =========================================
  useEffect(() => {
    let active = true
    setLoading(true)

    const params = { page, per_page: PAGE_SIZE }
    if (filters.date) params.date = filters.date
    if (filters.session) params.session = filters.session
    if (filters.dormitory_id) params.dormitory_id = filters.dormitory_id

    const timer = setTimeout(() => {
      api.get('/matron/roll-call', { params })
        .then((res) => {
          if (!active) return
          const data = Array.isArray(res.data) ? res.data : res.data.data || []
          setRollCalls(data)
          setMeta(res.data.meta || { current_page: page, per_page: PAGE_SIZE, total: data.length, last_page: 1 })
        })
        .catch(() => {
          if (active) toast.error('Unable to load roll call data.')
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 300)

    return () => {
      clearTimeout(timer)
      active = false
    }
  }, [refreshKey, page, filters.date, filters.session, filters.dormitory_id])

  // Summary (kutoka page ya sasa — sio zote)
  const summary = useMemo(() => {
    return rollCalls.reduce(
      (acc, rc) => {
        acc.present += Number(rc.total_present) || 0
        acc.absent += Number(rc.total_absent) || 0
        return acc
      },
      { present: 0, absent: 0 }
    )
  }, [rollCalls])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.dormitory_id) {
      toast.error('Please select a dormitory.')
      return
    }
    if (!form.date) {
      toast.error('Please select a date.')
      return
    }
    if (form.total_present === '' || form.total_absent === '') {
      toast.error('Please enter present and absent counts.')
      return
    }

    try {
      setSaving(true)
      await api.post('/matron/roll-call', {
        dormitory_id: Number(form.dormitory_id),
        session: form.session,
        date: form.date,
        total_present: Number(form.total_present),
        total_absent: Number(form.total_absent),
        notes: form.notes || null,
      })
      toast.success('Roll call recorded.')
      setShowForm(false)
      setForm({
        dormitory_id: '',
        session: 'morning',
        date: new Date().toISOString().slice(0, 10),
        total_present: '',
        total_absent: '',
        notes: '',
      })
      setPage(1)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Unable to save roll call.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const clearFilters = () => {
    setFilters({ date: '', session: '', dormitory_id: '' })
    setPage(1)
  }

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const to = Math.min(meta.current_page * meta.per_page, meta.total)

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiCheckSquare className="h-5 w-5 text-primary" /> Roll Call
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Take morning, evening, and night roll calls for the dormitories.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition"
          >
            {showForm ? <FiX className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
            {showForm ? 'Close' : 'New Roll Call'}
          </button>
        </div>
      </section>

      {/* Summary cards — kutoka page ya sasa */}
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-primary-soft p-2.5 text-primary">
            <FiCheckSquare className="h-5 w-5" />
          </div>
          <p className="mt-4 text-2xl font-semibold text-foreground">{meta.total ?? 0}</p>
          <p className="text-sm text-muted-foreground">Total entries</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-success-soft p-2.5 text-success">
            <FiUsers className="h-5 w-5" />
          </div>
          <p className="mt-4 text-2xl font-semibold text-foreground">{summary.present}</p>
          <p className="text-sm text-muted-foreground">Present (this page)</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-danger-soft p-2.5 text-danger">
            <FiUserX className="h-5 w-5" />
          </div>
          <p className="mt-4 text-2xl font-semibold text-foreground">{summary.absent}</p>
          <p className="text-sm text-muted-foreground">Absent (this page)</p>
        </article>
      </section>

      {/* Form */}
      {showForm && (
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h3 className="font-semibold text-foreground">Record new roll call</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a dormitory, session and date, then enter the counts.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Dormitory</span>
              <select
                name="dormitory_id"
                value={form.dormitory_id}
                onChange={handleChange}
                disabled={dormsLoading}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary disabled:opacity-60"
                required
              >
                <option value="">{dormsLoading ? 'Loading...' : 'Select dormitory'}</option>
                {dormitories.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Session</span>
              <select
                name="session"
                value={form.session}
                onChange={handleChange}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
                required
              >
                {SESSIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Date</span>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Total present</span>
              <input
                type="number"
                name="total_present"
                min="0"
                value={form.total_present}
                onChange={handleChange}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Total absent</span>
              <input
                type="number"
                name="total_absent"
                min="0"
                value={form.total_absent}
                onChange={handleChange}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm sm:col-span-2 lg:col-span-3">
              <span className="text-muted-foreground">Notes (optional)</span>
              <textarea
                name="notes"
                rows={2}
                value={form.notes}
                onChange={handleChange}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
                placeholder="Any remarks..."
              />
            </label>

            <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition disabled:opacity-60"
              >
                <FiCheckSquare className="h-4 w-4" /> {saving ? 'Saving...' : 'Save roll call'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Filters */}
      <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FiFilter className="h-4 w-4" /> Filters
          </div>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>Date</span>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => { setFilters((p) => ({ ...p, date: e.target.value })); setPage(1) }}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>Session</span>
            <select
              value={filters.session}
              onChange={(e) => { setFilters((p) => ({ ...p, session: e.target.value })); setPage(1) }}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="">All sessions</option>
              {SESSIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>Dormitory</span>
            <select
              value={filters.dormitory_id}
              onChange={(e) => { setFilters((p) => ({ ...p, dormitory_id: e.target.value })); setPage(1) }}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="">All dormitories</option>
              {dormitories.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            Clear
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Dormitory</th>
                <th className="px-4 py-3 text-right">Present</th>
                <th className="px-4 py-3 text-right">Absent</th>
                <th className="px-4 py-3">Taken by</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
                  </td>
                </tr>
              ) : rollCalls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-muted-foreground">
                    No roll calls recorded yet.
                  </td>
                </tr>
              ) : (
                rollCalls.map((rc) => (
                  <tr key={rc.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3 font-medium text-foreground">{formatDate(rc.date)}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{rc.session}</td>
                    <td className="px-4 py-3 text-muted-foreground">{rc.dormitory?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-success">{rc.total_present ?? 0}</td>
                    <td className="px-4 py-3 text-right font-semibold text-danger">{rc.total_absent ?? 0}</td>
                    <td className="px-4 py-3 text-muted-foreground">{rc.taken_by?.full_name ?? rc.taken_by?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{rc.notes ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && rollCalls.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <p>
              Showing <span className="font-medium text-foreground">{from}</span>–
              <span className="font-medium text-foreground">{to}</span> of{' '}
              <span className="font-medium text-foreground">{meta.total}</span> roll calls
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