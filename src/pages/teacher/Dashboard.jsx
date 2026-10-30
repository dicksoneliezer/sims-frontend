// src/pages/teacher/Dashboard.jsx
import { useEffect, useState } from 'react'
import {
  FiUsers,
  FiBookOpen,
  FiLayers,
  FiEdit3,
  FiCheckSquare,
  FiFileText,
  FiArrowRight,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const STAT_META = [
  { key: 'students', label: 'My Students', icon: FiUsers, tone: 'bg-primary-soft text-primary' },
  { key: 'subjects', label: 'My Subjects', icon: FiBookOpen, tone: 'bg-success-soft text-success' },
  { key: 'classes', label: 'My Classes', icon: FiLayers, tone: 'bg-warning-soft text-warning' },
]

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    subjects: 0,
    classes: 0,
    attendance_today: 0,
    marks_entered: 0,
    notes: 0,
    behavior_records: 0,
    active_exams: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/teacher/dashboard')
      .then((res) => {
        if (!active) return
        const data = res.data?.data?.stats ?? res.data?.stats ?? {}
        setStats({
          students: data.students ?? 0,
          subjects: data.subjects ?? 0,
          classes: data.classes ?? 0,
          attendance_today: data.attendance_today ?? 0,
          marks_entered: data.marks_entered ?? 0,
          notes: data.notes ?? 0,
          behavior_records: data.behavior_records ?? 0,
          active_exams: data.active_exams ?? 0,
        })
      })
      .catch(() => {
        if (active) toast.error('Unable to load dashboard data.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand to-primary px-6 py-7 text-primary-foreground sm:px-8">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-muted">
          Teacher workspace
        </p>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Welcome back!</h2>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          Manage your students, subjects, marks, attendance, and more.
        </p>
      </section>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-14">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STAT_META.map((meta) => (
            <article key={meta.key} className="dashboard-stat-card">
              <div className={`inline-flex rounded-lg p-2.5 ${meta.tone}`}>
                <meta.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">{stats[meta.key] ?? 0}</p>
              <p className="text-sm text-muted-foreground">{meta.label}</p>
            </article>
          ))}
        </section>
      )}

      {/* Quick Actions */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="font-semibold text-foreground">Quick actions</h3>
        <p className="mt-1 text-sm text-muted-foreground">Jump to the most common teacher tasks.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/teacher/marks"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition"
          >
            <FiEdit3 className="h-4 w-4" /> Enter marks <FiArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/teacher/attendance"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiCheckSquare className="h-4 w-4" /> Mark attendance
          </Link>
          <Link
            to="/teacher/notes"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiFileText className="h-4 w-4" /> Send note
          </Link>
          <Link
            to="/teacher/behavior"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiUsers className="h-4 w-4" /> Record behavior
          </Link>
          <Link
            to="/teacher/students"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiUsers className="h-4 w-4" /> My Students
          </Link>
          <Link
            to="/teacher/subjects"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiBookOpen className="h-4 w-4" /> My Subjects
          </Link>
          <Link
            to="/teacher/timetable"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiLayers className="h-4 w-4" /> Timetable
          </Link>
        </div>
      </section>
    </div>
  )
}