import { t } from '../utils/i18n'
import { useLanguage } from '../hooks/useLanguage'
import { useEffect, useMemo, useState } from 'react'
import {
  FiEdit2,
  FiEye,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUsers,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import { deleteStudent, listStudentsFor } from '../api/students'
import { AppLayout } from '../components/layouts/AppLayout'
import { Modal } from '../components/common/Modal'
import { StudentDetails } from '../components/students/StudentDetails'
import { StudentForm } from '../components/students/StudentForm'
import { useAuth } from '../hooks/useAuth'
import { MODULES_BY_ROLE, ROLE_PREFIX, SCHOOL_LEVELS } from '../utils/constants'

const PAGE_SIZE = 10

function formatMoney(value) {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0))
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function StudentAvatar({ student }) {
  useLanguage()
  if (student.photo_url) {
    return (
      <img
        src={student.photo_url}
        alt={student.full_name}
        className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
      />
    )
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-primary">
      {initials(student.full_name)}
    </div>
  )
}

export default function Students() {
  useLanguage()
  const { user } = useAuth()
  const role = user.role
  const prefix = ROLE_PREFIX[role]
  const canManage = role === 'super_admin'
  const canViewReports = role !== 'accountant'

  const modules = useMemo(() => {
    const roleModules = MODULES_BY_ROLE[role] ?? []
    return roleModules.includes('Students') ? roleModules : [...roleModules, 'Students']
  }, [role])

  const [students, setStudents] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [classes, setClasses] = useState([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState({ search: '', class: '', school_level: '', is_active: '' })
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [detailId, setDetailId] = useState(null)
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
    setLoading(true)

    listStudentsFor(prefix, { ...query, page, per_page: PAGE_SIZE })
      .then((response) => {
        if (!active) return
        setStudents(response.data)
        setMeta(response.meta)
        setClasses(response.filters?.classes ?? [])
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load students."))
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

  const handleDelete = async (student) => {
    if (!window.confirm(t("Delete {0}? This cannot be undone.", [student.full_name]))) return

    try {
      await deleteStudent(student.id)
      toast.success(t("Student deleted"))
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? t("Unable to delete student."))
    }
  }

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const to = Math.min(meta.current_page * meta.per_page, meta.total)

  return (
    <AppLayout modules={modules} title={t("Students")}>
      <div className="space-y-5">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <FiUsers className="h-5 w-5 text-primary" />{t(" Students")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {canManage
                ? t("Manage student records, classes and balances.")
                : t("Browse student records and academic history.")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
            {canManage && (
              <button
                type="button"
                onClick={() => setForm({ student: null })}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                <FiPlus className="h-4 w-4" />{t(" Add student")}</button>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="grid gap-3 border-b border-border p-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative xl:col-span-2">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("Search name, number, phone or email")}
                className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <select
              value={query.class}
              onChange={(event) => updateFilter('class', event.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">{t("All classes")}</option>
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>

            <select
              value={query.school_level}
              onChange={(event) => updateFilter('school_level', event.target.value)}
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
                  <th className="px-4 py-3">{t("Student")}</th>
                  <th className="px-4 py-3">{t("Class")}</th>
                  <th className="px-4 py-3">{t("Level")}</th>
                  <th className="px-4 py-3">{t("Parent phone")}</th>
                  <th className="px-4 py-3 text-right">{t("Opening balance")}</th>
                  <th className="px-4 py-3">{t("Status")}</th>
                  <th className="px-4 py-3 text-right">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center">
                      <div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center text-muted-foreground">{t("No students match the current filters.")}</td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-muted/70">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <StudentAvatar student={student} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{student.full_name}</p>
                            <p className="text-xs text-muted-foreground">{student.student_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{student.class ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {SCHOOL_LEVELS[student.school_level] ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{student.parent_phone ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-foreground">
                        {formatMoney(student.opening_balance)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            student.is_active
                              ? 'bg-success-soft text-success'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {student.is_active ? t("Active") : t("Inactive")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailId(student.id)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-primary-soft hover:text-primary"
                            aria-label={t("View {0}", [student.full_name])}
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          {canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => setForm({ student })}
                                className="rounded-lg p-2 text-muted-foreground hover:bg-warning-soft hover:text-warning"
                                aria-label={t("Edit {0}", [student.full_name])}
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(student)}
                                className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                                aria-label={t("Delete {0}", [student.full_name])}
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <p>{t("Showing")}<span className="font-medium text-foreground">{from}</span>–
              <span className="font-medium text-foreground">{to}</span>{t(" of")}{' '}
              <span className="font-medium text-foreground">{meta.total}</span>{t(" students")}</p>
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
          title={form.student ? t("Edit student") : t("Add student")}
          description={
            form.student
              ? t("Update the record for {0}.", [form.student.full_name])
              : t("Student numbers are generated automatically when left blank.")
          }
          onClose={() => setForm(null)}
        >
          <StudentForm
            student={form.student}
            onClose={() => setForm(null)}
            onSaved={() => setRefreshKey((key) => key + 1)}
          />
        </Modal>
      )}

      {detailId && (
        <StudentDetails
          studentId={detailId}
          rolePrefix={prefix}
          canViewReports={canViewReports}
          showFinance={role === 'accountant' || role === 'super_admin'}
          onClose={() => setDetailId(null)}
        />
      )}
    </AppLayout>
  )
}
