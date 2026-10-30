import { useEffect, useState } from 'react'
import { FiCheckCircle, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { getOwnAttendance } from '../../api/self'
import { formatDate } from '../../utils/format'

const tone = {
  present: 'bg-success-soft text-success',
  absent: 'bg-danger-soft text-danger',
  late: 'bg-warning-soft text-warning',
  excused: 'bg-primary-soft text-primary',
}

export default function StudentAttendance() {
  const [data, setData] = useState(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)

    getOwnAttendance({ from: from || undefined, to: to || undefined })
      .then((response) => {
        if (active) setData(response)
      })
      .catch(() => {
        if (active) toast.error('Unable to load your attendance.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [from, to, refreshKey])

  const records = data?.records ?? []
  const summary = data?.summary ?? {}

  return (
    // Hapa tunaondoa AppLayout na MODULES_BY_ROLE kabisa. Tunabaki na div ya maudhui pekee.
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiCheckCircle className="h-5 w-5 text-success" /> My attendance
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{data?.student ? `${data.student.full_name} · ${data.student.student_number}` : 'View your attendance history.'}</p>
        </div>
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </section>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">From</span>
          <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">To</span>
          <input type="date" min={from || undefined} value={to} onChange={(event) => setTo(event.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        {[
          ['Total', summary.total],
          ['Present', summary.present],
          ['Absent', summary.absent],
          ['Late', summary.late],
          ['Excused', summary.excused],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{value ?? 0}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Remarks</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={3} className="px-4 py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-14 text-center text-muted-foreground">No attendance records found for this period.</td></tr>
              ) : records.map((record) => (
                <tr key={record.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3 font-medium text-foreground">{formatDate(record.date)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${tone[record.status] ?? 'bg-muted text-muted-foreground'}`}>{record.status}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{record.remarks ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}