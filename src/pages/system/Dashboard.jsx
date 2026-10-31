import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
// src/pages/system/Dashboard.jsx
import { useEffect, useState } from 'react'
import {
  FiUsers,
  FiUserCheck,
  FiActivity,
  FiDatabase,
  FiFileText,
  FiAlertCircle,
  FiList,
  FiArrowRight,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const STAT_META = [
  { key: 'usersCount', label: 'Total Users', icon: FiUsers, tone: 'bg-primary-soft text-primary' },
  { key: 'activeUsers', label: 'Active Users', icon: FiUserCheck, tone: 'bg-success-soft text-success' },
  { key: 'studentsCount', label: 'Total Students', icon: FiUsers, tone: 'bg-info-soft text-info' },
  { key: 'logsCount', label: 'System Logs', icon: FiFileText, tone: 'bg-warning-soft text-warning' },
  { key: 'backupsCount', label: 'Database Backups', icon: FiDatabase, tone: 'bg-primary-soft text-primary' },
  { key: 'errorsCount', label: 'Error Logs', icon: FiAlertCircle, tone: 'bg-danger-soft text-danger' },
]

export default function SystemAdminDashboard() {
  useLanguage()
  const [stats, setStats] = useState({
    usersCount: 0,
    activeUsers: 0,
    studentsCount: 0,
    logsCount: 0,
    backupsCount: 0,
    errorsCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const [dashboardRes, studentsRes] = await Promise.all([
          api.get('/system/dashboard').catch(() => ({ data: { data: {} } })),
          api.get('/system/students').catch(() => ({ data: { data: [] } })),
        ])

        const data = dashboardRes.data.data || {}
        const students = Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data.data || []

        setStats({
          usersCount: data.users_count ?? data.total_users ?? 0,
          activeUsers: data.active_users ?? 0,
          studentsCount: students.length || data.students_count || 0,
          logsCount: data.logs_count ?? 0,
          backupsCount: data.backups_count ?? 0,
          errorsCount: data.errors_count ?? 0,
        })
      } catch (err) {
        toast.error(t("Unable to load dashboard data."))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand to-primary px-6 py-7 text-brand-foreground sm:px-8">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-muted">{t("System workspace")}</p>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{t("Welcome back!")}</h2>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">{t("Monitor server health, manage sessions, review logs, and maintain the platform.")}</p>
      </section>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-14">
          <div role="status" aria-label={t("Loading data")} className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <p className="mt-1 text-sm text-muted-foreground">{t("Jump to the most common system tasks.")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/system/settings"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition"
          >
            <FiActivity className="h-4 w-4" />{t(" System Settings ")}<FiArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/system/sessions"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiUsers className="h-4 w-4" />{t(" User Sessions")}</Link>
          <Link
            to="/system/logs"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiFileText className="h-4 w-4" />{t(" System Logs")}</Link>
          <Link
            to="/system/errors"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiAlertCircle className="h-4 w-4" />{t(" Error Logs")}</Link>
          <Link
            to="/system/cache"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiDatabase className="h-4 w-4" />{t(" Cache Management")}</Link>
          <Link
            to="/system/backup"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiList className="h-4 w-4" />{t(" Database Backup")}</Link>
          <Link
            to="/system/queue"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiActivity className="h-4 w-4" />{t(" Queue Monitor")}</Link>
          <Link
            to="/system/api-keys"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiFileText className="h-4 w-4" />{t(" API Keys")}</Link>
        </div>
      </section>
    </div>
  )
}