import { useEffect, useState } from 'react'
import { FiUsers, FiRefreshCw, FiSearch } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'

export default function AcademicStudents() {
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [classId, setClassId] = useState('')
  const [schoolLevel, setSchoolLevel] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  // Load classes (kwa filter ya class)
  useEffect(() => {
    let active = true
    api.get('/academic/classes', { params: { per_page: 100 } })
      .then((res) => {
        if (active) {
          const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
          setClasses(data)
        }
      })
      .catch(() => {
        if (active) toast.error('Unable to load classes.')
      })
    return () => { active = false }
  }, [])

  // Load students kwa filters
  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      setLoading(true)

      const params = { search, per_page: 100 }
      if (classId) params.class_id = classId
      if (schoolLevel) params.school_level = schoolLevel

      api.get('/academic/students', { params })
        .then((res) => {
          if (active) {
            const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
            setStudents(data)
          }
        })
        .catch(() => {
          if (active) toast.error('Unable to load students.')
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 350)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [search, classId, schoolLevel, refreshKey])

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiUsers className="h-5 w-5 text-primary" /> All Students
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">View all students by class and level.</p>
        </div>
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student by name or number"
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={classId}
            onChange={(event) => setClassId(event.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-3">
          <select
            value={schoolLevel}
            onChange={(event) => setSchoolLevel(event.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">All levels</option>
            <option value="pre_primary">Pre-primary</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
          </select>
          <p className="ml-auto text-sm text-muted-foreground md:col-span-2 self-center">
            Showing <span className="font-semibold text-foreground">{students.length}</span> student(s)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Student No</th>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Parent Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-14 text-center text-muted-foreground">No students found.</td></tr>
              ) : students.map((student) => (
                <tr key={student.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3 font-medium text-foreground">{student.student_number}</td>
                  <td className="px-4 py-3 text-foreground">{student.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{student.class ?? student.school_class?.name ?? '—'}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{student.school_level ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{student.parent_phone ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}