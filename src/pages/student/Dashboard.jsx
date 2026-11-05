import { FinancialSummary } from '../../components/finance/FinancialSummary'
import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
// src/pages/student/Dashboard.jsx
import { useEffect, useState } from 'react'
import {
  FiAward,
  FiCheckSquare,
  FiBookOpen,
  FiCalendar,
  FiArrowRight,
  FiUsers,
  FiFileText,
  FiClipboard,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const STAT_META = [
  { key: 'average_marks', label: 'Average Score', icon: FiAward, tone: 'bg-primary-soft text-primary', suffix: '%' },
  { key: 'attendance_rate', label: 'Attendance', icon: FiCheckSquare, tone: 'bg-success-soft text-success', suffix: '%' },
  { key: 'results', label: 'Results', icon: FiBookOpen, tone: 'bg-warning-soft text-warning', suffix: '', isNumber: true },
  { key: 'unread_notes', label: 'Unread Notes', icon: FiFileText, tone: 'bg-info-soft text-info', suffix: '', isNumber: true },
]

export default function StudentDashboard() {
  useLanguage()
  const [stats, setStats] = useState({
    average_marks: 0,
    attendance_rate: 0,
    results: 0,
    unread_notes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [financialSummary, setFinancialSummary] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/student/dashboard')
      .then((res) => {
        if (!active) return
        const data = res.data?.data?.stats ?? res.data?.stats ?? {}
        setFinancialSummary(res.data?.data?.financial_summary)
        setStats({
          average_marks: data.average_marks ?? 0,
          attendance_rate: data.attendance_rate ?? 0,
          results: data.results ?? 0,
          unread_notes: data.unread_notes ?? 0,
        })
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load dashboard data."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  const formatValue = (meta) => {
    const value = stats[meta.key] ?? 0
    if (meta.suffix === '%') return `${Number(value).toFixed(1)}${meta.suffix}`
    if (meta.isNumber) return Number(value).toLocaleString()
    return value
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand to-primary px-6 py-7 text-brand-foreground sm:px-8">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-muted">{t("Student workspace")}</p>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{t("Welcome back!")}</h2>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">{t("View your results, attendance, timetable, and more.")}</p>
      </section>

      {financialSummary && <FinancialSummary summary={financialSummary} />}

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
              <p className="mt-4 text-2xl font-semibold text-foreground">{formatValue(meta)}</p>
              <p className="text-sm text-muted-foreground">{t(meta.label)}</p>
            </article>
          ))}
        </section>
      )}

      {/* Quick Links */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="font-semibold text-foreground">{t("Quick actions")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("Jump to the most common student tasks.")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/student/results"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition"
          >
            <FiAward className="h-4 w-4" />{t(" View results ")}<FiArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/student/attendance"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiCheckSquare className="h-4 w-4" />{t(" View attendance")}</Link>
          <Link
            to="/student/timetable"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiCalendar className="h-4 w-4" />{t(" View timetable")}</Link>
          <Link
            to="/student/assignments"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiClipboard className="h-4 w-4" />{t(" View assignments")}</Link>
          <Link
            to="/student/notes"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiFileText className="h-4 w-4" />{t(" My Notes")}</Link>
          <Link
            to="/student/report-card"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiFileText className="h-4 w-4" />{t(" Report Card")}</Link>
          <Link
            to="/student/certificates"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiAward className="h-4 w-4" />{t(" Certificates")}</Link>
        </div>
      </section>
    </div>
  )
}