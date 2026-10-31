import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
// src/pages/matron/Inspections.jsx
import { useEffect, useRef, useState } from 'react'
import {
  FiClipboard,
  FiRefreshCw,
  FiPlus,
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiFilter,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate } from '../../utils/format'

const PAGE_SIZE = 20

const STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending', label: 'Pending' },
]

export default function MatronInspections() {
  useLanguage()
  const [inspections, setInspections] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [dormitories, setDormitories] = useState([])
  const [loading, setLoading] = useState(true)
  const [dormsLoading, setDormsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [filterDormitory, setFilterDormitory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const dormsLoaded = useRef(false)

  const [form, setForm] = useState({
    dormitory_id: '',
    inspection_date: new Date().toISOString().slice(0, 10),
    hygiene_score: 70,
    cleanliness_score: 70,
    issues_found: '',
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
        if (active) toast.error(t("Unable to load dormitories."))
      })
      .finally(() => {
        if (active) setDormsLoading(false)
      })

    return () => { active = false }
  }, [])

  // =========================================
  // 2. Load inspections (pagination + filters)
  // =========================================
  useEffect(() => {
    let active = true
    setLoading(true)

    const params = { page, per_page: PAGE_SIZE }
    if (filterDormitory) params.dormitory_id = filterDormitory
    if (filterStatus) params.status = filterStatus

    const timer = setTimeout(() => {
      api.get('/matron/inspections', { params })
        .then((res) => {
          if (!active) return
          const data = Array.isArray(res.data) ? res.data : res.data.data || []
          setInspections(data)
          setMeta(res.data.meta || { current_page: page, per_page: PAGE_SIZE, total: data.length, last_page: 1 })
        })
        .catch(() => {
          if (active) toast.error(t("Unable to load inspections."))
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 250)

    return () => {
      clearTimeout(timer)
      active = false
    }
  }, [refreshKey, page, filterDormitory, filterStatus])

  // Summary (kutoka meta — sio kutoka inspections zote)
  const summary = {
    total: meta.total ?? 0,
    passed: inspections.filter((i) => i.status === 'passed').length,
    failed: inspections.filter((i) => i.status === 'failed').length,
    avgHygiene:
      inspections.length > 0
        ? Math.round(
            inspections.reduce((acc, i) => acc + (Number(i.hygiene_score) || 0), 0) / inspections.length
          )
        : 0,
    avgCleanliness:
      inspections.length > 0
        ? Math.round(
            inspections.reduce((acc, i) => acc + (Number(i.cleanliness_score) || 0), 0) / inspections.length
          )
        : 0,
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.dormitory_id) {
      toast.error(t("Please select a dormitory."))
      return
    }

    try {
      setSaving(true)
      await api.post('/matron/inspections', {
        dormitory_id: Number(form.dormitory_id),
        inspection_date: form.inspection_date,
        hygiene_score: Number(form.hygiene_score),
        cleanliness_score: Number(form.cleanliness_score),
        issues_found: form.issues_found || null,
        notes: form.notes || null,
      })
      toast.success(t("Inspection recorded."))
      setShowForm(false)
      setForm({
        dormitory_id: '',
        inspection_date: new Date().toISOString().slice(0, 10),
        hygiene_score: 70,
        cleanliness_score: 70,
        issues_found: '',
        notes: '',
      })
      setPage(1)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      toast.error(err?.response?.data?.message || t("Unable to save inspection."))
    } finally {
      setSaving(false)
    }
  }

  const statusBadge = (status) => {
    if (status === 'passed') return 'bg-success-soft text-success'
    if (status === 'failed') return 'bg-danger-soft text-danger'
    return 'bg-warning-soft text-warning'
  }

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const to = Math.min(meta.current_page * meta.per_page, meta.total)

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiClipboard className="h-5 w-5 text-primary" />{t(" Dormitory Inspections")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Record hygiene and cleanliness checks for dormitories.")}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition"
          >
            {showForm ? <FiX className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
            {showForm ? t("Close") : t("New Inspection")}
          </button>
        </div>
      </section>

      {/* Summary — inatumia meta + page ya sasa */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-primary-soft p-2.5 text-primary">
            <FiClipboard className="h-5 w-5" />
          </div>
          <p className="mt-4 text-2xl font-semibold text-foreground">{summary.total}</p>
          <p className="text-sm text-muted-foreground">{t("Total inspections")}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-success-soft p-2.5 text-success">
            <FiCheckCircle className="h-5 w-5" />
          </div>
          <p className="mt-4 text-2xl font-semibold text-foreground">{summary.passed}</p>
          <p className="text-sm text-muted-foreground">{t("Passed (this page)")}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-danger-soft p-2.5 text-danger">
            <FiXCircle className="h-5 w-5" />
          </div>
          <p className="mt-4 text-2xl font-semibold text-foreground">{summary.failed}</p>
          <p className="text-sm text-muted-foreground">{t("Failed (this page)")}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-warning-soft p-2.5 text-warning">
            <FiClipboard className="h-5 w-5" />
          </div>
          <p className="mt-4 text-2xl font-semibold text-foreground">
            {summary.avgHygiene}% / {summary.avgCleanliness}%
          </p>
          <p className="text-sm text-muted-foreground">{t("Avg hygiene / cleanliness (this page)")}</p>
        </article>
      </section>

      {/* Form */}
      {showForm && (
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h3 className="font-semibold text-foreground">{t("Record new inspection")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("Status is automatically set based on the average score (≥70 passed, &lt;70 failed).")}</p>

          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{t("Dormitory")}</span>
              <select
                name="dormitory_id"
                value={form.dormitory_id}
                onChange={handleChange}
                required
                disabled={dormsLoading}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary disabled:opacity-60"
              >
                <option value="">{dormsLoading ? t("Loading...") : t("Select dormitory")}</option>
                {dormitories.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{t("Inspection date")}</span>
              <input
                type="date"
                name="inspection_date"
                value={form.inspection_date}
                onChange={handleChange}
                required
                className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{t("Hygiene score (0–100)")}</span>
              <input
                type="number"
                name="hygiene_score"
                min="0"
                max="100"
                value={form.hygiene_score}
                onChange={handleChange}
                required
                className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{t("Cleanliness score (0–100)")}</span>
              <input
                type="number"
                name="cleanliness_score"
                min="0"
                max="100"
                value={form.cleanliness_score}
                onChange={handleChange}
                required
                className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="text-muted-foreground">{t("Issues found (optional)")}</span>
              <textarea
                name="issues_found"
                rows={2}
                value={form.issues_found}
                onChange={handleChange}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
                placeholder={t("e.g. Broken window, dirty floor...")}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="text-muted-foreground">{t("Notes (optional)")}</span>
              <textarea
                name="notes"
                rows={2}
                value={form.notes}
                onChange={handleChange}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
              />
            </label>

            <div className="sm:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition disabled:opacity-60"
              >
                <FiCheckCircle className="h-4 w-4" /> {saving ? t("Saving...") : t("Save inspection")}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >{t("Cancel")}</button>
            </div>
          </form>
        </section>
      )}

      {/* Filters */}
      <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FiFilter className="h-4 w-4" />{t(" Filters")}</div>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>{t("Dormitory")}</span>
            <select
              value={filterDormitory}
              onChange={(e) => { setFilterDormitory(e.target.value); setPage(1) }}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="">{t("All dormitories")}</option>
              {dormitories.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>{t("Status")}</span>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{t(f.label)}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => { setFilterDormitory(''); setFilterStatus(''); setPage(1) }}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
          >{t("Clear")}</button>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Date")}</th>
                <th className="px-4 py-3">{t("Dormitory")}</th>
                <th className="px-4 py-3 text-right">{t("Hygiene")}</th>
                <th className="px-4 py-3 text-right">{t("Cleanliness")}</th>
                <th className="px-4 py-3">{t("Status")}</th>
                <th className="px-4 py-3">{t("Inspector")}</th>
                <th className="px-4 py-3">{t("Issues")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
                  </td>
                </tr>
              ) : inspections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-muted-foreground">{t("No inspections recorded yet.")}</td>
                </tr>
              ) : (
                inspections.map((i) => (
                  <tr key={i.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3 font-medium text-foreground">{formatDate(i.inspection_date)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{i.dormitory?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{i.hygiene_score}%</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{i.cleanliness_score}%</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadge(i.status)}`}>
                        {t(i.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{i.inspector?.full_name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                      {i.issues_found ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && inspections.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <p>{t("Showing")}<span className="font-medium text-foreground">{from}</span>–
              <span className="font-medium text-foreground">{to}</span>{t(" of")}{' '}
              <span className="font-medium text-foreground">{meta.total}</span>{t(" inspections")}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.current_page <= 1}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >{t("Previous")}</button>
              <span className="px-1">{t("Page")}{meta.current_page}{t(" of ")}{Math.max(meta.last_page, 1)}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={meta.current_page >= meta.last_page}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >{t("Next")}</button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}