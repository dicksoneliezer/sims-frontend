import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import {
  FiActivity,
  FiAlertTriangle,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiLayers,
  FiTrendingDown,
  FiUser,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api/axios'
import { AppLayout } from '../components/layouts/AppLayout'
import { useAuth } from '../hooks/useAuth'
import { getModulePath, ROLE_LABELS, ROLE_PREFIX } from '../utils/constants'
import { formatMoney } from '../utils/format'

const ADMIN_STATS = [
  { key: 'total_users', label: 'Total users', icon: FiUser, tone: 'bg-primary-soft text-primary', money: false },
  { key: 'active_users', label: 'Active users', icon: FiActivity, tone: 'bg-success-soft text-success', money: false },
  { key: 'total_students', label: 'Total students', icon: FiUsers, tone: 'bg-warning-soft text-warning', money: false },
  { key: 'active_students', label: 'Active students', icon: FiUserCheck, tone: 'bg-info-soft text-info', money: false },
]

const ACCOUNTANT_STATS = [
  { key: 'total_invoiced', label: 'Total invoiced', icon: FiDollarSign, tone: 'bg-primary-soft text-primary', money: true },
  { key: 'total_collected', label: 'Total collected', icon: FiActivity, tone: 'bg-success-soft text-success', money: true },
  { key: 'total_outstanding', label: 'Outstanding', icon: FiTrendingDown, tone: 'bg-warning-soft text-warning', money: true },
  { key: 'total_expenses', label: 'Expenses', icon: FiTrendingDown, tone: 'bg-danger-soft text-danger', money: true },
  { key: 'pending_payments', label: 'Pending payments', icon: FiCreditCard, tone: 'bg-info-soft text-info', money: false },
  { key: 'overdue_invoices', label: 'Overdue invoices', icon: FiAlertTriangle, tone: 'bg-danger-soft text-danger', money: false },
]

const PARENT_STATS = [
  { key: 'children_count', label: 'Children', icon: FiUsers, tone: 'bg-primary-soft text-primary', money: false },
  { key: 'total_outstanding', label: 'Outstanding fees', icon: FiTrendingDown, tone: 'bg-danger-soft text-danger', money: true },
  { key: 'pending_payments', label: 'Pending payments', icon: FiCreditCard, tone: 'bg-warning-soft text-warning', money: false },
  { key: 'total_paid', label: 'Total paid', icon: FiActivity, tone: 'bg-success-soft text-success', money: true },
]

const STAT_META = {
  super_admin: ADMIN_STATS,
  system_admin: ADMIN_STATS,
  accountant: ACCOUNTANT_STATS,
  parent: PARENT_STATS,
}

export default function Dashboard() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    api
      .get(`/${ROLE_PREFIX[user.role]}/dashboard`)
      .then(({ data }) => {
        if (active) setDashboard(data.data)
      })
      .catch(() => {
        if (active) toast.error('Unable to load dashboard data.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user.role])

  const modules = dashboard?.modules ?? []
  const stats = dashboard?.stats
  const statMeta = STAT_META[user.role] ?? []
  const roleCount = stats?.by_role ? Object.keys(stats.by_role).length : null

  return (
    <AppLayout modules={modules}>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand to-primary px-6 py-7 text-primary-foreground sm:px-8">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-muted">
            {ROLE_LABELS[user.role] ?? user.role} workspace
          </p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
            Welcome back, {user.full_name?.split(' ')[0]}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-brand-muted">
            Your account is active and secure. The dashboard below is the starting point for the
            modules being built in this milestone.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-brand-muted">
            <span className="flex items-center gap-2">
              <FiClock className="h-4 w-4" />
              {dayjs().format('dddd, D MMMM YYYY')}
            </span>
            <span className="flex items-center gap-2">
              <FiUser className="h-4 w-4" />
              @{user.username}
            </span>
          </div>
        </section>

        {stats && statMeta.length > 0 && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statMeta.map((meta) => (
              <article
                key={meta.key}
                className="dashboard-stat-card"
              >
                <div className={`inline-flex rounded-lg p-2.5 ${meta.tone}`}>
                  <meta.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-2xl font-semibold text-foreground">
                  {meta.money ? formatMoney(stats[meta.key] ?? 0) : (stats[meta.key] ?? 0)}
                </p>
                <p className="text-sm text-muted-foreground">{meta.label}</p>
              </article>
            ))}
            {roleCount !== null && (
              <article className="dashboard-stat-card">
                <div className="inline-flex rounded-lg bg-info-soft p-2.5 text-info">
                  <FiLayers className="h-5 w-5" />
                </div>
                <p className="mt-4 text-2xl font-semibold text-foreground">{roleCount}</p>
                <p className="text-sm text-muted-foreground">User roles</p>
              </article>
            )}
          </section>
        )}

        <section className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h3 className="font-semibold text-foreground">Your modules</h3>
              <p className="text-sm text-muted-foreground">
                Modules assigned to the {ROLE_LABELS[user.role] ?? user.role} role.
              </p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {modules.length} modules
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
            </div>
          ) : modules.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              No modules have been assigned to this role yet.
            </p>
          ) : (
            <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => {
                const path = getModulePath(user.role, module)

                if (path) {
                  return (
                    <Link
                      key={module}
                      to={path}
                      className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition hover:border-primary/40 hover:bg-primary-soft/50"
                    >
                      <span className="text-sm font-medium text-foreground">{module}</span>
                      <span className="rounded bg-success-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
                        Open
                      </span>
                    </Link>
                  )
                }

                return (
                  <div
                    key={module}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                  >
                    <span className="text-sm font-medium text-foreground">{module}</span>
                    <span className="rounded bg-warning-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
                      Soon
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-xl border border-border bg-surface p-5 shadow-sm lg:col-span-2">
            <h3 className="font-semibold text-foreground">Account details</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Full name</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{user.full_name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Username</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">@{user.username}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Email</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{user.email ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Phone</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{user.phone ?? '—'}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <h3 className="font-semibold text-foreground">Milestone 6</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Teaching and academic workflows are now live, with attendance, marks, results,
              behavior, syllabus tracking and a shared profile page.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Teacher attendance, marks, notes and behavior records</li>
              <li>Academic exams, results analysis and syllabus progress</li>
              <li>Student and parent read-only academic views</li>
              <li>Profile management with photo and password updates</li>
            </ul>
          </article>
        </section>
      </div>
    </AppLayout>
  )
}
