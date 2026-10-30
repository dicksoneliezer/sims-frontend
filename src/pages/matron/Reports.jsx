// src/pages/matron/Reports.jsx
import { useEffect, useMemo, useState } from 'react'
import {
  FiFileText,
  FiRefreshCw,
  FiCalendar,
  FiCheckSquare,
  FiHeart,
  FiAlertTriangle,
  FiLogOut,
  FiUsers,
  FiUserX,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate } from '../../utils/format'

const SESSION_LABELS = {
  morning: 'Morning',
  evening: 'Evening',
  night: 'Night',
}

export default function MatronReports() {
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    from: thirtyDaysAgo.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  })

  useEffect(() => {
    let active = true
    setLoading(true)

    api
      .get('/matron/reports', {
        params: {
          from: filters.from || undefined,
          to: filters.to || undefined,
        },
      })
      .then((res) => {
        if (!active) return
        const data = res.data?.data ?? res.data ?? null
        setReport(data)
      })
      .catch(() => {
        if (active) toast.error('Unable to load reports.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [filters.from, filters.to])

  const attendanceTotals = useMemo(() => {
    if (!report?.attendance) return { present: 0, absent: 0, total: 0 }
    return report.attendance.reduce(
      (acc, row) => {
        const present = Number(row.present) || 0
        const absent = Number(row.absent) || 0
        acc.present += present
        acc.absent += absent
        acc.total += present + absent
        return acc
      },
      { present: 0, absent: 0, total: 0 }
    )
  }, [report])

  const attendanceRate = attendanceTotals.total > 0
    ? Math.round((attendanceTotals.present / attendanceTotals.total) * 100)
    : 0

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const quickRange = (days) => {
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - days)
    setFilters({
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    })
  }

  const SUMMARY_CARDS = [
    {
      key: 'rollCalls',
      label: 'Roll call entries',
      value: report?.attendance?.length ?? 0,
      icon: FiCheckSquare,
      tone: 'bg-primary-soft text-primary',
    },
    {
      key: 'sickBay',
      label: 'Sick bay cases',
      value: report?.sick_bay ?? 0,
      icon: FiHeart,
      tone: 'bg-danger-soft text-danger',
    },
    {
      key: 'incidents',
      label: 'Incidents reported',
      value: report?.incidents ?? 0,
      icon: FiAlertTriangle,
      tone: 'bg-warning-soft text-warning',
    },
    {
      key: 'leaves',
      label: 'Leaves in period',
      value: report?.leaves ?? 0,
      icon: FiLogOut,
      tone: 'bg-info-soft text-info',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiFileText className="h-5 w-5 text-primary" /> Boarding Reports
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View attendance, health, incidents, and leave reports.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFilters((p) => ({ ...p }))}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </section>

      {/* Filters */}
      <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FiCalendar className="h-4 w-4" /> Period
          </div>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>From</span>
            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>To</span>
            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => quickRange(7)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              Last 7 days
            </button>
            <button
              type="button"
              onClick={() => quickRange(30)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              Last 30 days
            </button>
            <button
              type="button"
              onClick={() => quickRange(90)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              Last 90 days
            </button>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-14">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SUMMARY_CARDS.map((card) => (
              <article
                key={card.key}
                className="rounded-xl border border-border bg-surface p-5 shadow-sm"
              >
                <div className={`inline-flex rounded-lg p-2.5 ${card.tone}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-2xl font-semibold text-foreground">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </article>
            ))}
          </section>

          {/* Attendance Breakdown */}
          <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="font-semibold text-foreground">Attendance breakdown</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Roll call totals grouped by session for the selected period.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {/* Sessions */}
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  By session
                </p>
                <ul className="mt-3 space-y-2">
                  {(report?.attendance ?? []).length === 0 ? (
                    <li className="text-sm text-muted-foreground">No roll calls in this period.</li>
                  ) : (
                    report.attendance.map((row) => (
                      <li
                        key={row.session}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium text-foreground">
                          {SESSION_LABELS[row.session] ?? row.session}
                        </span>
                        <span className="text-muted-foreground">
                          <span className="text-success font-semibold">{row.present ?? 0}</span>
                          {' / '}
                          <span className="text-danger font-semibold">{row.absent ?? 0}</span>
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Totals */}
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Overall
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <FiUsers className="h-4 w-4 text-success" /> Present
                    </span>
                    <span className="font-semibold text-foreground">{attendanceTotals.present}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <FiUserX className="h-4 w-4 text-danger" /> Absent
                    </span>
                    <span className="font-semibold text-foreground">{attendanceTotals.absent}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground">Attendance rate</span>
                    <span className={`font-semibold ${attendanceRate >= 90 ? 'text-success' : attendanceRate >= 75 ? 'text-warning' : 'text-danger'}`}>
                      {attendanceRate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Period Info */}
          <section className="rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground shadow-sm">
            Showing data from{' '}
            <span className="font-medium text-foreground">
              {report?.period?.from ? formatDate(report.period.from) : '—'}
            </span>{' '}
            to{' '}
            <span className="font-medium text-foreground">
              {report?.period?.to ? formatDate(report.period.to) : '—'}
            </span>
            .
          </section>
        </>
      )}
    </div>
  )
}