// src/pages/parent/Dashboard.jsx
import { useEffect, useState } from 'react'
import {
  FiUsers,
  FiDollarSign,
  FiAlertCircle,
  FiClock,
  FiArrowRight,
  FiBell,
  FiAward,
  FiCheckCircle,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate, formatMoney } from '../../utils/format'

const STAT_META = [
  { key: 'children_count', label: 'My Children', icon: FiUsers, tone: 'bg-primary-soft text-primary', money: false },
  { key: 'total_outstanding', label: 'Outstanding Fees', icon: FiAlertCircle, tone: 'bg-danger-soft text-danger', money: true },
  { key: 'total_paid', label: 'Total Paid', icon: FiDollarSign, tone: 'bg-success-soft text-success', money: true },
  { key: 'pending_payments', label: 'Pending Payments', icon: FiClock, tone: 'bg-warning-soft text-warning', money: false },
]

export default function ParentDashboard() {
  const [stats, setStats] = useState({
    children_count: 0,
    total_outstanding: 0,
    total_paid: 0,
    pending_payments: 0,
  })
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)

    Promise.all([
      api.get('/parent/dashboard').catch(() => ({ data: { data: { stats: {} } } })),
      api.get('/parent/announcements', { params: { per_page: 3 } }).catch(() => ({ data: { data: [] } })),
    ])
      .then(([dashboardRes, annRes]) => {
        if (!active) return

        const statsData = dashboardRes.data?.data?.stats ?? dashboardRes.data?.stats ?? {}
        setStats({
          children_count: statsData.children_count ?? 0,
          total_outstanding: statsData.total_outstanding ?? 0,
          total_paid: statsData.total_paid ?? 0,
          pending_payments: statsData.pending_payments ?? 0,
        })

        const annData = Array.isArray(annRes.data?.data)
          ? annRes.data.data
          : Array.isArray(annRes.data)
          ? annRes.data
          : []
        setAnnouncements(annData.slice(0, 3))
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
          Parent workspace
        </p>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Welcome back!</h2>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          View your children's progress, fees, and payments all in one place.
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
              <p className="mt-4 text-2xl font-semibold text-foreground">
                {meta.money ? formatMoney(stats[meta.key] ?? 0) : (stats[meta.key] ?? 0)}
              </p>
              <p className="text-sm text-muted-foreground">{meta.label}</p>
            </article>
          ))}
        </section>
      )}

      {/* Announcements */}
      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-foreground">
              <FiBell className="h-4 w-4 text-primary" /> Recent announcements
            </h3>
            <p className="text-sm text-muted-foreground">School notices and important dates.</p>
          </div>
          <Link to="/parent/announcements" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        ) : announcements.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            No announcements yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {announcements.map((item) => (
              <article key={item.id} className="px-6 py-4">
                <h4 className="font-medium text-foreground">{item.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(item.published_at)}</p>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="font-semibold text-foreground">Quick actions</h3>
        <p className="mt-1 text-sm text-muted-foreground">Jump to the most common parent tasks.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/parent/payments"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition"
          >
            Make a payment <FiArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/parent/children"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiUsers className="h-4 w-4" /> My Children
          </Link>
          <Link
            to="/parent/balance"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiAlertCircle className="h-4 w-4" /> View balance
          </Link>
          <Link
            to="/parent/history"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiClock className="h-4 w-4" /> Payment history
          </Link>
          <Link
            to="/parent/statement"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiDollarSign className="h-4 w-4" /> Statement of account
          </Link>
          <Link
            to="/parent/messages"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiBell className="h-4 w-4" /> Messages
          </Link>
        </div>
      </section>
    </div>
  )
}