import { useEffect, useState } from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-toastify'
import {
  assignTeacherClass,
  assignTeacherSubject,
  getTeacher,
  listClasses,
  listSubjects,
  removeTeacherClass,
  removeTeacherSubject,
} from '../../api/academics'

const selectClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-xs font-semibold uppercase tracking-wide text-muted-foreground'

export function TeacherAssignments({ teacher, onClose, onChanged }) {
  const [detail, setDetail] = useState(null)
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [classId, setClassId] = useState('')
  const [classYear, setClassYear] = useState('2026')
  const [subjectId, setSubjectId] = useState('')
  const [subjectClassId, setSubjectClassId] = useState('')
  const [subjectYear, setSubjectYear] = useState('2026')

  const loadTeacher = () =>
    getTeacher(teacher.id)
      .then(setDetail)
      .catch(() => toast.error('Unable to load teacher assignments.'))

  useEffect(() => {
    let active = true

    Promise.all([getTeacher(teacher.id), listClasses({ per_page: 100 }), listSubjects({ per_page: 100 })])
      .then(([teacherDetail, classResponse, subjectResponse]) => {
        if (!active) return
        setDetail(teacherDetail)
        setClasses(classResponse.data)
        setSubjects(subjectResponse.data)
      })
      .catch(() => {
        if (active) toast.error('Unable to load assignment options.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [teacher.id])

  const addClass = async (event) => {
    event.preventDefault()

    if (!classId) {
      toast.error('Select a class first.')
      return
    }

    setSaving(true)

    try {
      await assignTeacherClass({
        teacher_id: teacher.id,
        class_id: Number(classId),
        academic_year: classYear || null,
      })
      toast.success('Class assigned')
      setClassId('')
      await loadTeacher()
      onChanged?.()
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to assign class.')
    } finally {
      setSaving(false)
    }
  }

  const addSubject = async (event) => {
    event.preventDefault()

    if (!subjectId) {
      toast.error('Select a subject first.')
      return
    }

    setSaving(true)

    try {
      await assignTeacherSubject({
        teacher_id: teacher.id,
        subject_id: Number(subjectId),
        class_id: subjectClassId ? Number(subjectClassId) : null,
        academic_year: subjectYear || null,
      })
      toast.success('Subject assigned')
      setSubjectId('')
      await loadTeacher()
      onChanged?.()
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to assign subject.')
    } finally {
      setSaving(false)
    }
  }

  const removeClass = async (assignment) => {
    try {
      await removeTeacherClass(assignment.id)
      toast.success('Class assignment removed')
      await loadTeacher()
      onChanged?.()
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to remove class assignment.')
    }
  }

  const removeSubject = async (assignment) => {
    try {
      await removeTeacherSubject(assignment.id)
      toast.success('Subject assignment removed')
      await loadTeacher()
      onChanged?.()
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to remove subject assignment.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-border">
          <div className="border-b border-border px-4 py-3">
            <h3 className="font-semibold text-foreground">Assigned classes</h3>
            <p className="text-xs text-muted-foreground">Classes this teacher can access.</p>
          </div>
          <ul className="divide-y divide-slate-100">
            {detail?.classes?.length ? (
              detail.classes.map((assignment) => (
                <li key={assignment.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">{assignment.class_name}</p>
                    <p className="text-xs text-muted-foreground">{assignment.academic_year ?? 'All years'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeClass(assignment)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                    aria-label={`Remove ${assignment.class_name}`}
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">No classes assigned.</li>
            )}
          </ul>
          <form onSubmit={addClass} className="space-y-2 border-t border-border p-4">
            <label className={labelClass} htmlFor="assign-class">
              Add class
            </label>
            <div className="flex gap-2">
              <select
                id="assign-class"
                value={classId}
                onChange={(event) => setClassId(event.target.value)}
                className={selectClass}
              >
                <option value="">Select class</option>
                {classes.map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    {schoolClass.name}
                  </option>
                ))}
              </select>
              <input
                value={classYear}
                onChange={(event) => setClassYear(event.target.value)}
                className={`${selectClass} max-w-28`}
                placeholder="Year"
                aria-label="Academic year"
              />
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-3 py-2 text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
                aria-label="Assign class"
              >
                <FiPlus className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-border">
          <div className="border-b border-border px-4 py-3">
            <h3 className="font-semibold text-foreground">Assigned subjects</h3>
            <p className="text-xs text-muted-foreground">Subjects and classes this teacher teaches.</p>
          </div>
          <ul className="divide-y divide-slate-100">
            {detail?.subjects?.length ? (
              detail.subjects.map((assignment) => (
                <li key={assignment.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {assignment.subject_name}{' '}
                      <span className="text-xs text-muted-foreground">({assignment.subject_code})</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {assignment.class_name ?? 'All classes'} - {assignment.academic_year ?? 'All years'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSubject(assignment)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                    aria-label={`Remove ${assignment.subject_name}`}
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">No subjects assigned.</li>
            )}
          </ul>
          <form onSubmit={addSubject} className="space-y-2 border-t border-border p-4">
            <label className={labelClass} htmlFor="assign-subject">
              Add subject
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                id="assign-subject"
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
                className={selectClass}
              >
                <option value="">Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
              </select>
              <select
                value={subjectClassId}
                onChange={(event) => setSubjectClassId(event.target.value)}
                className={selectClass}
                aria-label="Class"
              >
                <option value="">All classes</option>
                {classes.map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    {schoolClass.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                value={subjectYear}
                onChange={(event) => setSubjectYear(event.target.value)}
                className={`${selectClass} max-w-32`}
                placeholder="Year"
                aria-label="Academic year"
              />
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
              >
                Add subject
              </button>
            </div>
          </form>
        </section>
      </div>

      <div className="flex justify-end border-t border-border pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Done
        </button>
      </div>
    </div>
  )
}
