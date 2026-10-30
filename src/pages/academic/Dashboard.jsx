// src/pages/academic/Dashboard.jsx
import { useEffect, useState } from 'react'
import {
  FiUsers,
  FiUserCheck,
  FiBookOpen,
  FiAward,
  FiBarChart2,
  FiCalendar,
  FiArrowRight,
  FiLayers,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const STAT_META = [
  { key: 'students', label: 'All Students', icon: FiUsers, tone: 'bg-success-soft text-success' },
  { key: 'exams', label: 'Exams', icon: FiAward, tone: 'bg-info-soft text-info' },
  { key: 'results', label: 'Results', icon: FiBarChart2, tone: 'bg-primary-soft text-primary' },
  { key: 'syllabus_topics', label: 'Syllabus Topics', icon: FiBookOpen, tone: 'bg-warning-soft text-warning' },
]

export default function AcademicDashboard() {
  const [stats, setStats] = useState({
    exams: 0,
    active_exams: 0,
    results: 0,
    students: 0,
    syllabus_topics: 0,
    completed_progress: 0,
    average_marks: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/academic/dashboard')
      .then((res) => {
        if (!active) return
        const data = res.data?.data?.stats ?? res.data?.stats ?? {}
        setStats({
          exams: data.exams ?? 0,
          active_exams: data.active_exams ?? 0,
          results: data.results ?? 0,
          students: data.students ?? 0,
          syllabus_topics: data.syllabus_topics ?? 0,
          completed_progress: data.completed_progress ?? 0,
          average_marks: data.average_marks ?? 0,
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
          Academic workspace
        </p>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Welcome back!</h2>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          Manage teachers, students, subjects, exams, results, and syllabus.
        </p>
      </section>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-14">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <p className="mt-1 text-sm text-muted-foreground">Jump to the most common academic tasks.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/academic/exams"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition"
          >
            Manage exams <FiArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/academic/students"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiUsers className="h-4 w-4" /> All Students
          </Link>
          <Link
            to="/academic/teachers"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiUserCheck className="h-4 w-4" /> All Teachers
          </Link>
          <Link
            to="/academic/allocation"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiLayers className="h-4 w-4" /> Subject Allocation
          </Link>
          <Link
            to="/academic/results"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiBarChart2 className="h-4 w-4" /> Results analysis
          </Link>
          <Link
            to="/academic/syllabus"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiBookOpen className="h-4 w-4" /> Syllabus tracker
          </Link>
          <Link
            to="/academic/timetable"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiCalendar className="h-4 w-4" /> Timetable
          </Link>
          <Link
            to="/academic/announcements"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            Announcements
          </Link>
        </div>
      </section>
    </div>
  )
}