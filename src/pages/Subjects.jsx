import { t } from '../utils/i18n'
import { useLanguage } from '../hooks/useLanguage'
import { useEffect, useMemo, useState } from 'react'
import { FiBookOpen, FiEdit2, FiPlus, FiRefreshCw, FiSearch, FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { deleteSubject, listSubjects } from '../api/academics'
import { Modal } from '../components/common/Modal'
import { SubjectForm } from '../components/academics/SubjectForm'
import { AppLayout } from '../components/layouts/AppLayout'
import { useAuth } from '../hooks/useAuth'
import { MODULES_BY_ROLE, ROLE_LABELS, SCHOOL_LEVELS } from '../utils/constants'

const PAGE_SIZE = 10

export default function Subjects() {
  useLanguage()
  const { user } = useAuth()
  const prefix = user.role === 'academic_teacher' ? 'academic' : 'admin'
  const canManage = ['super_admin', 'academic_teacher'].includes(user.role)

  const modules = useMemo(() => {
    const roleModules = MODULES_BY_ROLE[user.role] ?? []
    return roleModules.includes('Subjects') ? roleModules : [...roleModules, 'Subjects']
  }, [user.role])

  const [subjects, setSubjects] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState({ search: '', level: '', is_active: '' })
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((current) => (current.search === search ? current : { ...current, search }))
      setPage(1)
    }, 350)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let active = true

    listSubjects({ ...query, page, per_page: PAGE_SIZE }, prefix)
      .then((response) => {
        if (!active) return
        setSubjects(response.data)
        setMeta(response.meta)
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load subjects."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [prefix, query, page, refreshKey])

  const updateFilter = (key, value) => {
    setQuery((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  const handleDelete = async (subject) => {
    if (!window.confirm(t("Delete {0}?", [subject.name]))) return

    try {
      await deleteSubject(subject.id, prefix)
      toast.success(t("Subject deleted"))
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? t("Unable to delete subject."))
    }
  }

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const to = Math.min(meta.current_page * meta.per_page, meta.total)

  return (
    <AppLayout modules={modules} title={t("Subjects")}>
      <div className="space-y-5">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <FiBookOpen className="h-5 w-5 text-primary" />{t(" Subjects")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(ROLE_LABELS[user.role])}{t(" - manage the subject catalogue used for results and timetables.")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setLoading(true)
                setRefreshKey((key) => key + 1)
              }}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
            {canManage && (
              <button
                type="button"
                onClick={() => setForm({ subject: null })}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                <FiPlus className="h-4 w-4" />{t(" Add subject")}</button>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="grid gap-3 border-b border-border p-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative xl:col-span-2">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("Search code or name")}
                className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={query.level}
              onChange={(event) => updateFilter('level', event.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">{t("All levels")}</option>
              {Object.entries(SCHOOL_LEVELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {t(label)}
                </option>
              ))}
            </select>
            <select
              value={query.is_active}
              onChange={(event) => updateFilter('is_active', event.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">{t("All statuses")}</option>
              <option value="1">{t("Active")}</option>
              <option value="0">{t("Inactive")}</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{t("Code")}</th>
                  <th className="px-4 py-3">{t("Subject")}</th>
                  <th className="px-4 py-3">{t("Level")}</th>
                  <th className="px-4 py-3 text-right">{t("Results")}</th>
                  <th className="px-4 py-3">{t("Status")}</th>
                  {canManage && <th className="px-4 py-3 text-right">{t("Actions")}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={canManage ? 6 : 5} className="px-4 py-14 text-center">
                      <div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
                    </td>
                  </tr>
                ) : subjects.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 6 : 5} className="px-4 py-14 text-center text-muted-foreground">{t("No subjects match the current filters.")}</td>
                  </tr>
                ) : (
                  subjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-muted/70">
                      <td className="px-4 py-3 font-semibold text-foreground">{subject.code}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{subject.name}</p>
                        {subject.description && (
                          <p className="max-w-md truncate text-xs text-muted-foreground">{subject.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {SCHOOL_LEVELS[subject.level] ?? t("All levels")}
                      </td>
                      <td className="px-4 py-3 text-right text-foreground">{subject.results_count ?? 0}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            subject.is_active
                              ? 'bg-success-soft text-success'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {subject.is_active ? t("Active") : t("Inactive")}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setForm({ subject })}
                              className="rounded-lg p-2 text-muted-foreground hover:bg-warning-soft hover:text-warning"
                              aria-label={t("Edit {0}", [subject.name])}
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(subject)}
                              className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                              aria-label={t("Delete {0}", [subject.name])}
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <p>{t("Showing")}<span className="font-medium text-foreground">{from}</span>-
              <span className="font-medium text-foreground">{to}</span>{t(" of")}{' '}
              <span className="font-medium text-foreground">{meta.total}</span>{t(" subjects")}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={meta.current_page <= 1 || loading}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >{t("Previous")}</button>
              <span className="px-1">{t("Page")}{meta.current_page}{t(" of ")}{Math.max(meta.last_page, 1)}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))}
                disabled={meta.current_page >= meta.last_page || loading}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >{t("Next")}</button>
            </div>
          </div>
        </section>
      </div>

      {form && (
        <Modal
          title={form.subject ? t("Edit subject") : t("Add subject")}
          description={t("Subjects are shared across classes, results and timetables.")}
          onClose={() => setForm(null)}
        >
          <SubjectForm
            subject={form.subject}
            prefix={prefix}
            onClose={() => setForm(null)}
            onSaved={() => setRefreshKey((key) => key + 1)}
          />
        </Modal>
      )}
    </AppLayout>
  )
}
