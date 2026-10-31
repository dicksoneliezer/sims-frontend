import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
// src/pages/matron/Dashboard.jsx
import { useEffect, useState } from 'react'
import {
  FiHome,
  FiUsers,
  FiHeart,
  FiAlertTriangle,
  FiCheckSquare,
  FiFileText,
  FiArrowRight,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const STAT_META = [
  { key: 'dormitories_count', label: 'Dormitories', icon: FiHome, tone: 'bg-primary-soft text-primary' },
  { key: 'boarding_students', label: 'Boarding Students', icon: FiUsers, tone: 'bg-success-soft text-success' },
  { key: 'sick_students', label: 'Sick Bay Patients', icon: FiHeart, tone: 'bg-danger-soft text-danger' },
  { key: 'open_incidents', label: 'Open Incidents', icon: FiAlertTriangle, tone: 'bg-warning-soft text-warning' },
]

export default function MatronDashboard() {
  useLanguage()
  const [stats, setStats] = useState({
    dormitories_count: 0,
    boarding_students: 0,
    sick_students: 0,
    open_incidents: 0,
    students_on_leave: 0,
    overdue_returns: 0,
    beds_count: 0,
    available_beds: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/matron/dashboard')
      .then((res) => {
        if (!active) return
        const data = res.data?.data ?? res.data ?? {}
        setStats({
          dormitories_count: data.dormitories_count ?? 0,
          boarding_students: data.boarding_students ?? 0,
          sick_students: data.sick_students ?? 0,
          open_incidents: data.open_incidents ?? 0,
          students_on_leave: data.students_on_leave ?? 0,
          overdue_returns: data.overdue_returns ?? 0,
          beds_count: data.beds_count ?? 0,
          available_beds: data.available_beds ?? 0,
        })
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load boarding data."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand to-primary px-6 py-7 text-brand-foreground sm:px-8">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-muted">{t("Boarding workspace")}</p>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{t("Welcome back!")}</h2>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">{t("Manage dormitories, roll calls, sick bay, incidents, and student welfare.")}</p>
      </section>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-14">
          <div role="status" aria-label={t("Loading data")} className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_META.map((meta) => (
            <article key={meta.key} className="dashboard-stat-card">
              <div className={`inline-flex rounded-lg p-2.5 ${meta.tone}`}>
                <meta.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">{stats[meta.key] ?? 0}</p>
              <p className="text-sm text-muted-foreground">{t(meta.label)}</p>
            </article>
          ))}
        </section>
      )}

      {/* Quick Actions */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="font-semibold text-foreground">{t("Quick actions")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("Jump to the most common boarding tasks.")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/matron/roll-call"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition"
          >
            <FiCheckSquare className="h-4 w-4" />{t(" Take Roll Call ")}<FiArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/matron/dormitories"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiHome className="h-4 w-4" />{t(" Manage Dormitories")}</Link>
          <Link
            to="/matron/beds"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiUsers className="h-4 w-4" />{t(" Bed Assignments")}</Link>
          <Link
            to="/matron/leaves"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiUsers className="h-4 w-4" />{t(" Student Leaves")}</Link>
          <Link
            to="/matron/sick-bay"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiHeart className="h-4 w-4" />{t(" Sick Bay")}</Link>
          <Link
            to="/matron/incidents"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiAlertTriangle className="h-4 w-4" />{t(" Incidents")}</Link>
          <Link
            to="/matron/reports"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiFileText className="h-4 w-4" />{t(" Reports")}</Link>
        </div>
      </section>
    </div>
  )
}