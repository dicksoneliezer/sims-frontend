import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiRefreshCw, FiSearch, FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { deleteClass, listClasses } from '../../api/academics'
import { Modal } from '../common/Modal'
import { ClassForm } from './ClassForm'
import { SCHOOL_LEVELS } from '../../utils/constants'

const PAGE_SIZE = 10

export function ClassManager({ teachers, onChanged }) {
  useLanguage()
  const [classes, setClasses] = useState([])
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

    listClasses({ ...query, page, per_page: PAGE_SIZE })
      .then((response) => {
        if (!active) return
        setClasses(response.data)
        setMeta(response.meta)
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load classes."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [query, page, refreshKey])

  const refresh = () => {
    setRefreshKey((key) => key + 1)
    onChanged?.()
  }

  const updateFilter = (key, value) => {
    setQuery((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  const handleDelete = async (schoolClass) => {
    if (!window.confirm(t("Delete {0}?", [schoolClass.name]))) return

    try {
      await deleteClass(schoolClass.id)
      toast.success(t("Class deleted"))
      refresh()
    } catch (error) {
      toast.error(error.response?.data?.message ?? t("Unable to delete class."))
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("Search class or section")}
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              setRefreshKey((key) => key + 1)
            }}
            className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted"
            aria-label={t("Refresh classes")}
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setForm({ schoolClass: null })}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <FiPlus className="h-4 w-4" />{t(" Add class")}</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">{t("Class")}</th>
              <th className="px-4 py-3">{t("Level")}</th>
              <th className="px-4 py-3">{t("Section")}</th>
              <th className="px-4 py-3">{t("Class teacher")}</th>
              <th className="px-4 py-3 text-right">{t("Students")}</th>
              <th className="px-4 py-3">{t("Status")}</th>
              <th className="px-4 py-3 text-right">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
                </td>
              </tr>
            ) : classes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">{t("No classes match the current filters.")}</td>
              </tr>
            ) : (
              classes.map((schoolClass) => (
                <tr key={schoolClass.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3 font-medium text-foreground">{schoolClass.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {SCHOOL_LEVELS[schoolClass.level] ?? schoolClass.level}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{schoolClass.section ?? '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {schoolClass.class_teacher?.full_name ?? t("Not assigned")}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">{schoolClass.students_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        schoolClass.is_active
                          ? 'bg-success-soft text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {schoolClass.is_active ? t("Active") : t("Inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setForm({ schoolClass })}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-warning-soft hover:text-warning"
                        aria-label={t("Edit {0}", [schoolClass.name])}
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(schoolClass)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                        aria-label={t("Delete {0}", [schoolClass.name])}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <p>
          {meta.total}{t(" classes - page ")}{meta.current_page}{t(" of ")}{Math.max(meta.last_page, 1)}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={meta.current_page <= 1 || loading}
            className="rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >{t("Previous")}</button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))}
            disabled={meta.current_page >= meta.last_page || loading}
            className="rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >{t("Next")}</button>
        </div>
      </div>

      {form && (
        <Modal
          title={form.schoolClass ? t("Edit class") : t("Add class")}
          description={t("Class names are used on student records and timetables.")}
          onClose={() => setForm(null)}
        >
          <ClassForm
            schoolClass={form.schoolClass}
            teachers={teachers}
            onClose={() => setForm(null)}
            onSaved={refresh}
          />
        </Modal>
      )}
    </section>
  )
}
