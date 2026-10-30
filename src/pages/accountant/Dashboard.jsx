// src/pages/accountant/Dashboard.jsx
import { useEffect, useState } from 'react'
import {
  FiDollarSign,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiFileText,
  FiArrowRight,
  FiRepeat,
  FiUsers,
  FiPieChart,
  FiClock,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const STAT_META = [
  { key: 'total_collected', label: 'Total Collected', icon: FiCheckCircle, tone: 'bg-success-soft text-success', isCurrency: true },
  { key: 'total_invoiced', label: 'Total Invoiced', icon: FiDollarSign, tone: 'bg-primary-soft text-primary', isCurrency: true },
  { key: 'total_outstanding', label: 'Outstanding Debts', icon: FiAlertCircle, tone: 'bg-danger-soft text-danger', isCurrency: true },
  { key: 'total_expenses', label: 'Total Expenses', icon: FiTrendingUp, tone: 'bg-info-soft text-info', isCurrency: true },
]

export default function AccountantDashboard() {
  const [stats, setStats] = useState({
    total_collected: 0,
    total_invoiced: 0,
    total_outstanding: 0,
    total_expenses: 0,
    pending_payments: 0,
    overdue_invoices: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/accountant/dashboard')
      .then((res) => {
        if (!active) return
        const data = res.data?.data?.stats ?? res.data?.stats ?? {}
        setStats({
          total_collected: data.total_collected ?? 0,
          total_invoiced: data.total_invoiced ?? 0,
          total_outstanding: data.total_outstanding ?? 0,
          total_expenses: data.total_expenses ?? 0,
          pending_payments: data.pending_payments ?? 0,
          overdue_invoices: data.overdue_invoices ?? 0,
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
          Finance workspace
        </p>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Welcome back!</h2>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          Manage invoices, record payments, track debts, and reconcile bank statements.
        </p>
      </section>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-14">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_META.map((meta) => {
            const value = stats[meta.key] ?? 0
            return (
              <article key={meta.key} className="dashboard-stat-card">
                <div className={`inline-flex rounded-lg p-2.5 ${meta.tone}`}>
                  <meta.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-2xl font-semibold text-foreground">
                  {meta.isCurrency ? 'TZS ' : ''}
                  {Number(value).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">{meta.label}</p>
              </article>
            )
          })}
        </section>
      )}

      {/* Quick Actions */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="font-semibold text-foreground">Quick actions</h3>
        <p className="mt-1 text-sm text-muted-foreground">Jump to the most common finance tasks.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/accountant/invoices"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition"
          >
            <FiFileText className="h-4 w-4" /> Manage Invoices <FiArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/accountant/payments"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiDollarSign className="h-4 w-4" /> Record Payment
          </Link>
          <Link
            to="/accountant/control-numbers"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiTrendingUp className="h-4 w-4" /> Control Numbers
          </Link>
          <Link
            to="/accountant/expenses"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiDollarSign className="h-4 w-4" /> Expenses
          </Link>
          <Link
            to="/accountant/debts"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiAlertCircle className="h-4 w-4" /> Debts
          </Link>
          <Link
            to="/accountant/students"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiUsers className="h-4 w-4" /> Students
          </Link>
          <Link
            to="/accountant/reports"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiPieChart className="h-4 w-4" /> Reports
          </Link>
          <Link
            to="/accountant/reconciliation"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiRepeat className="h-4 w-4" /> Reconciliation
          </Link>
        </div>
      </section>
    </div>
  )
}