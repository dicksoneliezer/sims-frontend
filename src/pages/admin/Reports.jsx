import { useCallback, useEffect, useState } from 'react'
import { FiBarChart2, FiDownload, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { getAdminReportOverview } from '../../api/reports'
import { AppLayout } from '../../components/layouts/AppLayout'
import { MODULES_BY_ROLE } from '../../utils/constants'
import { formatMoney, formatNumber } from '../../utils/format'

function monthStart() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function StatCard({ label, value, tone = 'text-foreground' }) {
  return (
    <div className="rounded-lg border border-border bg-muted/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p>
    </div>
  )
}

export default function Reports() {
  const [range, setRange] = useState({ from: monthStart(), to: today() })
  const [query, setQuery] = useState(range)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadReport = useCallback(() => {
    setLoading(true)

    getAdminReportOverview(query)
      .then(setReport)
      .catch(() => toast.error('Unable to generate report.'))
      .finally(() => setLoading(false))
  }, [query])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  const applyRange = (event) => {
    event.preventDefault()
    setQuery(range)
  }

  const exportCsv = () => {
    if (!report) return

    const rows = [['Section', 'Metric', 'Value']]
    const add = (section, metrics) => {
      Object.entries(metrics).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((entry) => rows.push([section, key, JSON.stringify(entry)]))
        } else if (value && typeof value === 'object') {
          rows.push([section, key, JSON.stringify(value)])
        } else {
          rows.push([section, key, value])
        }
      })
    }

    add('Period', report.period)
    add('Enrollment', report.enrollment)
    add('Attendance', report.attendance)
    add('Academics', report.academics)
    add('Finance', report.finance)
    add('Inventory', report.inventory)
    add('Users', report.users)

    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sims-report-${report.period.from}-to-${report.period.to}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppLayout modules={MODULES_BY_ROLE.super_admin} title="Reports">
      <div className="space-y-5">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <FiBarChart2 className="h-5 w-5 text-primary" /> Reports
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Cross-domain school performance and operations overview.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={applyRange} className="flex flex-wrap items-end gap-2">
              <label className="text-xs font-medium text-muted-foreground">
                From
                <input type="date" value={range.from} onChange={(event) => setRange((current) => ({ ...current, from: event.target.value }))} className="mt-1 block rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                To
                <input type="date" value={range.to} onChange={(event) => setRange((current) => ({ ...current, to: event.target.value }))} className="mt-1 block rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
              </label>
              <button type="submit" className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
                <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Generate
              </button>
            </form>
            <button type="button" onClick={exportCsv} disabled={!report} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50">
              <FiDownload className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </section>

        {loading && !report ? (
          <div className="flex items-center justify-center rounded-xl border border-border bg-surface py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        ) : report ? (
          <div className="space-y-5">
            <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-foreground">Enrollment</h3>
                <p className="text-xs text-muted-foreground">{report.period.from} to {report.period.to}</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <StatCard label="Total students" value={formatNumber(report.enrollment.total_students)} />
                <StatCard label="Active students" value={formatNumber(report.enrollment.active_students)} tone="text-success" />
                <StatCard label="New admissions" value={formatNumber(report.enrollment.new_students)} tone="text-primary" />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">By class</h4>
                  <div className="mt-2 space-y-1.5">
                    {(report.enrollment.by_class ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No data.</p> : report.enrollment.by_class.map((item) => (
                      <div key={item.class} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.class || 'Unassigned'}</span>
                        <span className="font-medium text-foreground">{item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">By gender</h4>
                  <div className="mt-2 space-y-1.5">
                    {Object.entries(report.enrollment.by_gender ?? {}).map(([gender, total]) => (
                      <div key={gender} className="flex items-center justify-between text-sm">
                        <span className="capitalize text-muted-foreground">{gender || 'Unknown'}</span>
                        <span className="font-medium text-foreground">{total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <h3 className="font-semibold text-foreground">Attendance</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <StatCard label="Attendance rate" value={`${report.attendance.attendance_rate}%`} tone="text-success" />
                  <StatCard label="Total records" value={formatNumber(report.attendance.total_records)} />
                  <StatCard label="Present" value={formatNumber(report.attendance.present)} tone="text-success" />
                  <StatCard label="Absent" value={formatNumber(report.attendance.absent)} tone="text-danger" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Late arrivals: {formatNumber(report.attendance.late)}</p>
              </article>

              <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <h3 className="font-semibold text-foreground">Finance</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <StatCard label="Invoiced" value={formatMoney(report.finance.invoiced)} />
                  <StatCard label="Collected" value={formatMoney(report.finance.collected)} tone="text-success" />
                  <StatCard label="Expenses" value={formatMoney(report.finance.expenses)} tone="text-danger" />
                  <StatCard label="Outstanding" value={formatMoney(report.finance.outstanding)} tone="text-warning" />
                </div>
              </article>

              <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <h3 className="font-semibold text-foreground">Inventory</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <StatCard label="Assets" value={formatNumber(report.inventory.total_assets)} />
                  <StatCard label="Asset value" value={formatMoney(report.inventory.asset_value)} />
                  <StatCard label="Stock items" value={formatNumber(report.inventory.total_items)} />
                  <StatCard label="Stock value" value={formatMoney(report.inventory.stock_value)} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{report.inventory.low_stock_items} low stock item(s), {report.inventory.open_alerts} open alert(s).</p>
              </article>

              <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <h3 className="font-semibold text-foreground">Users</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <StatCard label="Total users" value={formatNumber(report.users.total)} />
                  <StatCard label="Active users" value={formatNumber(report.users.active)} tone="text-success" />
                </div>
                <div className="mt-4 space-y-1.5">
                  {Object.entries(report.users.by_role ?? {}).map(([role, total]) => (
                    <div key={role} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-muted-foreground">{role.replaceAll('_', ' ')}</span>
                      <span className="font-medium text-foreground">{total}</span>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="font-semibold text-foreground">Academic performance</h3>
              {(report.academics.results ?? []).length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No exam results recorded.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Term</th>
                        <th className="px-3 py-2">Academic year</th>
                        <th className="px-3 py-2 text-right">Entries</th>
                        <th className="px-3 py-2 text-right">Average marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.academics.results.map((row) => (
                        <tr key={`${row.term}-${row.academic_year}`}>
                          <td className="px-3 py-2 text-foreground">{row.term ?? '-'}</td>
                          <td className="px-3 py-2 text-muted-foreground">{row.academic_year ?? '-'}</td>
                          <td className="px-3 py-2 text-right text-foreground">{row.entries}</td>
                          <td className="px-3 py-2 text-right font-semibold text-foreground">{row.average_marks}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </AppLayout>
  )
}
