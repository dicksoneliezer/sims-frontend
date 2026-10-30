import { useEffect, useMemo, useState } from 'react'
import {
  FiEdit2,
  FiLink,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUserCheck,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import { deleteTeacher, listTeachers } from '../api/academics'
import { Modal } from '../components/common/Modal'
import { TeacherAssignments } from '../components/academics/TeacherAssignments'
import { TeacherForm } from '../components/academics/TeacherForm'
import { AppLayout } from '../components/layouts/AppLayout'
import { useAuth } from '../hooks/useAuth'
import { MODULES_BY_ROLE } from '../utils/constants'

const PAGE_SIZE = 10

export default function Teachers() {
  const { user } = useAuth()
  const modules = useMemo(() => {
    const roleModules = MODULES_BY_ROLE[user.role] ?? []
    return roleModules.includes('Teachers') ? roleModules : [...roleModules, 'Teachers']
  }, [user.role])

  const [teachers, setTeachers] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState({ search: '', is_active: '' })
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)
  const [assignments, setAssignments] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((current) => (current.search === search ? current : { ...current, search }))
      setPage(1)
    }, 350)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let active = true

    listTeachers({ ...query, page, per_page: PAGE_SIZE })
      .then((response) => {
        if (!active) return
        setTeachers(response.data)
        setMeta(response.meta)
      })
      .catch(() => {
        if (active) toast.error('Unable to load teachers.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [query, page, refreshKey])

  const updateFilter = (key, value) => {
    setQuery((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  const handleDelete = async (teacher) => {
    if (!window.confirm(`Delete ${teacher.full_name}? This removes their login and assignments.`)) return

    try {
      await deleteTeacher(teacher.id)
      toast.success('Teacher deleted')
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to delete teacher.')
    }
  }

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const to = Math.min(meta.current_page * meta.per_page, meta.total)

  return (
    <AppLayout modules={modules} title="Teachers">
      <div className="space-y-5">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <FiUserCheck className="h-5 w-5 text-primary" /> Teachers
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage teacher accounts, class assignments and subject allocations.
            </p>
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
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              type="button"
              onClick={() => setForm({ teacher: null })}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              <FiPlus className="h-4 w-4" /> Add teacher
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="grid gap-3 border-b border-border p-4 md:grid-cols-2">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, username, email or employment ID"
                className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={query.is_active}
              onChange={(event) => updateFilter('is_active', event.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 md:max-w-48"
            >
              <option value="">All statuses</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Employment ID</th>
                  <th className="px-4 py-3 text-right">Classes</th>
                  <th className="px-4 py-3 text-right">Subjects</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center text-muted-foreground">
                      No teachers match the current filters.
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-muted/70">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-primary">
                            {teacher.full_name
                              .split(' ')
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{teacher.full_name}</p>
                            <p className="text-xs text-muted-foreground">@{teacher.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <p>{teacher.email ?? '-'}</p>
                        <p className="text-xs text-muted-foreground">{teacher.phone ?? '-'}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{teacher.employment_id ?? '-'}</td>
                      <td className="px-4 py-3 text-right text-foreground">{teacher.classes_count ?? 0}</td>
                      <td className="px-4 py-3 text-right text-foreground">{teacher.subjects_count ?? 0}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            teacher.is_active
                              ? 'bg-success-soft text-success'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {teacher.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setAssignments(teacher)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-primary-soft hover:text-primary"
                            aria-label={`Assign ${teacher.full_name}`}
                          >
                            <FiLink className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm({ teacher })}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-warning-soft hover:text-warning"
                            aria-label={`Edit ${teacher.full_name}`}
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(teacher)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                            aria-label={`Delete ${teacher.full_name}`}
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
              Showing <span className="font-medium text-foreground">{from}</span>-
              <span className="font-medium text-foreground">{to}</span> of{' '}
              <span className="font-medium text-foreground">{meta.total}</span> teachers
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={meta.current_page <= 1 || loading}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-1">
                Page {meta.current_page} of {Math.max(meta.last_page, 1)}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))}
                disabled={meta.current_page >= meta.last_page || loading}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>

      {form && (
        <Modal
          title={form.teacher ? 'Edit teacher' : 'Add teacher'}
          description="Teacher accounts can sign in and see only their assigned classes."
          onClose={() => setForm(null)}
        >
          <TeacherForm
            teacher={form.teacher}
            onClose={() => setForm(null)}
            onSaved={() => setRefreshKey((key) => key + 1)}
          />
        </Modal>
      )}

      {assignments && (
        <Modal
          title={`Assignments - ${assignments.full_name}`}
          description="Assign classes and subjects to scope this teacher's access."
          width="max-w-4xl"
          onClose={() => {
            setAssignments(null)
            setRefreshKey((key) => key + 1)
          }}
        >
          <TeacherAssignments
            teacher={assignments}
            onClose={() => {
              setAssignments(null)
              setRefreshKey((key) => key + 1)
            }}
            onChanged={() => setRefreshKey((key) => key + 1)}
          />
        </Modal>
      )}
    </AppLayout>
  )
}
