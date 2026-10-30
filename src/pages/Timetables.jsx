import { useEffect, useMemo, useState } from 'react'
import {
  FiCalendar,
  FiGrid,
  FiPlus,
  FiRefreshCw,
  FiUsers,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import {
  deleteTimetable,
  getChildTimetable,
  listChildren,
  listMasterTimetable,
  listTimetables,
} from '../api/academics'
import { Modal } from '../components/common/Modal'
import { ClassManager } from '../components/academics/ClassManager'
import { TimetableForm } from '../components/academics/TimetableForm'
import { TimetableGrid } from '../components/academics/TimetableGrid'
import { AppLayout } from '../components/layouts/AppLayout'
import { useAuth } from '../hooks/useAuth'
import { MODULES_BY_ROLE, ROLE_LABELS } from '../utils/constants'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const EMPTY_FILTERS = { classes: [], subjects: [], teachers: [], terms: [], years: [] }

export default function Timetables() {
  const { user } = useAuth()
  const isAdmin = user.role === 'super_admin'
  const isAcademic = user.role === 'academic_teacher'
  const isParent = user.role === 'parent'
  const canFilter = isAdmin || isAcademic
  const prefix = isAdmin ? 'admin' : isAcademic ? 'academic' : user.role

  const modules = useMemo(() => {
    const roleModules = MODULES_BY_ROLE[user.role] ?? []
    const hasModule = roleModules.some((module) => module === 'Timetables' || module === 'Timetable')
    return hasModule ? roleModules : [...roleModules, 'Timetables']
  }, [user.role])

  const [view, setView] = useState('timetable')
  const [slots, setSlots] = useState([])
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [query, setQuery] = useState({
    class_id: '',
    teacher_id: '',
    subject_id: '',
    day_of_week: '',
    term: '',
  })
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (!isParent) return

    let active = true

    listChildren()
      .then((response) => {
        if (!active) return
        setChildren(response.data)
        setSelectedChild((current) => current || response.data[0]?.id || '')
      })
      .catch(() => {
        if (active) toast.error('Unable to load linked children.')
      })

    return () => {
      active = false
    }
  }, [isParent])

  useEffect(() => {
    if (view === 'classes') return

    let active = true

    const request = isParent
      ? selectedChild
        ? getChildTimetable(selectedChild)
        : Promise.resolve({ data: [] })
      : isAdmin
        ? listMasterTimetable(query)
        : listTimetables(prefix, query)

    request
      .then((response) => {
        if (!active) return
        setSlots(response.data)
        if (response.filters) setFilters(response.filters)
      })
      .catch(() => {
        if (active) toast.error('Unable to load timetable.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [isAdmin, isParent, prefix, query, refreshKey, selectedChild, view])

  const updateFilter = (key, value) => {
    setQuery((current) => ({ ...current, [key]: value }))
  }

  const handleDelete = async (slot) => {
    if (!window.confirm('Delete this timetable slot?')) return

    try {
      await deleteTimetable(slot.id)
      toast.success('Timetable slot deleted')
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to delete timetable slot.')
    }
  }

  const title = user.role === 'teacher' || user.role === 'student' ? 'Timetable' : 'Timetables'

  return (
    <AppLayout modules={modules} title={title}>
      <div className="space-y-5">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <FiCalendar className="h-5 w-5 text-primary" /> {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAdmin
                ? 'Build the master timetable and manage the school class list.'
                : isAcademic
                  ? 'Review the master timetable across classes and teachers.'
                  : `Weekly schedule for ${ROLE_LABELS[user.role]?.toLowerCase() ?? 'you'}.`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <div className="flex rounded-lg border border-border bg-surface p-1">
                <button
                  type="button"
                  onClick={() => setView('timetable')}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium ${
                    view === 'timetable' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <FiGrid className="h-4 w-4" /> Timetable
                </button>
                <button
                  type="button"
                  onClick={() => setView('classes')}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium ${
                    view === 'classes' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <FiUsers className="h-4 w-4" /> Classes
                </button>
              </div>
            )}
            {view === 'timetable' && (
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
            )}
            {isAdmin && view === 'timetable' && (
              <button
                type="button"
                onClick={() => setForm({ slot: null })}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                <FiPlus className="h-4 w-4" /> Add slot
              </button>
            )}
          </div>
        </section>

        {isParent && (
          <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <label htmlFor="child" className="text-sm font-medium text-foreground">
              Child
            </label>
            <select
              id="child"
              value={selectedChild}
              onChange={(event) => setSelectedChild(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:max-w-sm"
            >
              {children.length === 0 ? (
                <option value="">No linked children</option>
              ) : (
                children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.full_name} - {child.class ?? 'No class'}
                  </option>
                ))
              )}
            </select>
          </section>
        )}

        {isAdmin && view === 'classes' ? (
          <ClassManager
            teachers={filters.teachers}
            onChanged={() => setRefreshKey((key) => key + 1)}
          />
        ) : (
          <section className="rounded-xl border border-border bg-surface shadow-sm">
            {canFilter && (
              <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 xl:grid-cols-5">
                <select
                  value={query.class_id}
                  onChange={(event) => updateFilter('class_id', event.target.value)}
                  className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  aria-label="Filter by class"
                >
                  <option value="">All classes</option>
                  {filters.classes.map((schoolClass) => (
                    <option key={schoolClass.id} value={schoolClass.id}>
                      {schoolClass.name}
                    </option>
                  ))}
                </select>
                <select
                  value={query.teacher_id}
                  onChange={(event) => updateFilter('teacher_id', event.target.value)}
                  className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  aria-label="Filter by teacher"
                >
                  <option value="">All teachers</option>
                  {filters.teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </option>
                  ))}
                </select>
                <select
                  value={query.subject_id}
                  onChange={(event) => updateFilter('subject_id', event.target.value)}
                  className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  aria-label="Filter by subject"
                >
                  <option value="">All subjects</option>
                  {filters.subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
                <select
                  value={query.day_of_week}
                  onChange={(event) => updateFilter('day_of_week', event.target.value)}
                  className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  aria-label="Filter by day"
                >
                  <option value="">All days</option>
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <select
                  value={query.term}
                  onChange={(event) => updateFilter('term', event.target.value)}
                  className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  aria-label="Filter by term"
                >
                  <option value="">All terms</option>
                  {filters.terms.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
              </div>
            ) : isParent && !selectedChild ? (
              <div className="px-6 py-14 text-center text-sm text-muted-foreground">
                No child is linked to this account yet.
              </div>
            ) : (
              <TimetableGrid
                slots={slots}
                onEdit={isAdmin ? (slot) => setForm({ slot }) : undefined}
                onDelete={isAdmin ? handleDelete : undefined}
              />
            )}
          </section>
        )}
      </div>

      {form && (
        <Modal
          title={form.slot ? 'Edit timetable slot' : 'Add timetable slot'}
          description="Class and teacher conflicts are blocked automatically."
          onClose={() => setForm(null)}
        >
          <TimetableForm
            slot={form.slot}
            options={filters}
            onClose={() => setForm(null)}
            onSaved={() => setRefreshKey((key) => key + 1)}
          />
        </Modal>
      )}
    </AppLayout>
  )
}
