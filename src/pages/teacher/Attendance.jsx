import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { FiCheckCircle, FiClipboard, FiRefreshCw, FiSave } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { getAttendance, getAttendanceReport, saveAttendance } from '../../api/teaching'
import { formatDate } from '../../utils/format'

const STATUSES = ['present', 'absent', 'late', 'excused']

function statusTone(status) {
  return {
    present: 'bg-success-soft text-success',
    absent: 'bg-danger-soft text-danger',
    late: 'bg-warning-soft text-warning',
    excused: 'bg-primary-soft text-primary',
  }[status] ?? 'bg-muted text-muted-foreground'
}

export default function TeacherAttendance() {
  const [tab, setTab] = useState('register')
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [roster, setRoster] = useState([])
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reportLoading, setReportLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)

    getAttendance({ class_id: classId || undefined, date })
      .then((response) => {
        if (!active) return
        setClasses(response.filters?.classes ?? [])
        setRoster(
          (response.data ?? []).map((row) => ({
            ...row,
            status: row.attendance?.status ?? 'present',
            remarks: row.attendance?.remarks ?? '',
            saved: Boolean(row.attendance),
          })),
        )
        if (!classId && response.filters?.classes?.length) {
          setClassId(String(response.filters.classes[0].id))
        }
      })
      .catch(() => {
        if (active) toast.error('Unable to load attendance register.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [classId, date, refreshKey])

  useEffect(() => {
    if (tab !== 'report' || !classId) return undefined

    let active = true
    setReportLoading(true)

    getAttendanceReport({ class_id: classId })
      .then((response) => {
        if (active) setReport(response)
      })
      .catch(() => {
        if (active) toast.error('Unable to load attendance report.')
      })
      .finally(() => {
        if (active) setReportLoading(false)
      })

    return () => {
      active = false
    }
  }, [tab, classId, refreshKey])

  const updateRow = (studentId, field, value) => {
    setRoster((current) =>
      current.map((row) => (row.student_id === studentId ? { ...row, [field]: value } : row)),
    )
  }

  const handleSave = async () => {
    if (!classId) return

    setSaving(true)

    try {
      await saveAttendance({
        class_id: Number(classId),
        date,
        records: roster.map((row) => ({
          student_id: row.student_id,
          status: row.status,
          remarks: row.remarks || null,
        })),
      })
      toast.success('Attendance saved')
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to save attendance.')
    } finally {
      setSaving(false)
    }
  }

  const counts = roster.reduce(
    (result, row) => ({ ...result, [row.status]: (result[row.status] ?? 0) + 1 }),
    {},
  )

  return (
    // Hapa tunaondoa AppLayout na MODULES_BY_ROLE kabisa. Tunabaki na div ya maudhui pekee.
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiClipboard className="h-5 w-5 text-primary" /> Class attendance
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Mark the daily register and review attendance history for your classes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-wrap items-end gap-3 border-b border-border p-4">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Class</span>
            <select
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
              className="min-w-48 rounded-lg border border-border px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All assigned classes</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</span>
            <input
              type="date"
              value={date}
              max={dayjs().format('YYYY-MM-DD')}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-lg border border-border px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <div className="ml-auto flex gap-1 rounded-lg bg-muted p-1">
            {['register', 'report'].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${tab === value ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground'}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {tab === 'register' ? (
          <>
            <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-4">
              {STATUSES.map((status) => (
                <div key={status} className="rounded-lg bg-muted px-3 py-2">
                  <p className="text-xs capitalize text-muted-foreground">{status}</p>
                  <p className="text-lg font-semibold text-foreground">{counts[status] ?? 0}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={4} className="px-4 py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
                  ) : roster.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-14 text-center text-muted-foreground">No students found for this class.</td></tr>
                  ) : roster.map((row) => (
                    <tr key={row.student_id} className="hover:bg-muted/70">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{row.full_name}</p>
                        <p className="text-xs text-muted-foreground">{row.student_number}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{row.class ?? '—'}</td>
                      <td className="px-4 py-3">
                        <select
                          value={row.status}
                          onChange={(event) => updateRow(row.student_id, 'status', event.target.value)}
                          className={`rounded-full border-0 px-3 py-1 text-xs font-semibold capitalize outline-none ${statusTone(row.status)}`}
                        >
                          {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={row.remarks}
                          onChange={(event) => updateRow(row.student_id, 'remarks', event.target.value)}
                          placeholder="Optional remark"
                          className="w-full min-w-48 rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-primary"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
              <p className="text-sm text-muted-foreground">{roster.length} student(s) on the register for {formatDate(date)}.</p>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || roster.length === 0 || !classId}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
              >
                <FiSave className="h-4 w-4" /> {saving ? 'Saving...' : 'Save attendance'}
              </button>
            </div>
          </>
        ) : (
          <div className="p-4">
            {reportLoading ? (
              <div className="py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
            ) : !report ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Select a class to view its attendance report.</p>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-5">
                  {[
                    ['total', report.summary?.total ?? 0],
                    ['present', report.summary?.present ?? 0],
                    ['absent', report.summary?.absent ?? 0],
                    ['late', report.summary?.late ?? 0],
                    ['excused', report.summary?.excused ?? 0],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-border p-3">
                      <p className="text-xs capitalize text-muted-foreground">{label}</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3 text-right">Present</th>
                        <th className="px-4 py-3 text-right">Absent</th>
                        <th className="px-4 py-3 text-right">Late</th>
                        <th className="px-4 py-3 text-right">Excused</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(report.summary?.by_student ?? []).map((row) => (
                        <tr key={row.student_id}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">{row.full_name}</p>
                            <p className="text-xs text-muted-foreground">{row.student_number}</p>
                          </td>
                          <td className="px-4 py-3 text-right text-success">{row.present}</td>
                          <td className="px-4 py-3 text-right text-danger">{row.absent}</td>
                          <td className="px-4 py-3 text-right text-warning">{row.late}</td>
                          <td className="px-4 py-3 text-right text-primary">{row.excused}</td>
                          <td className="px-4 py-3 text-right font-semibold text-foreground">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <FiCheckCircle className="h-4 w-4 text-success" /> Attendance is saved per student and date, so re-saving updates the existing entry.
      </p>
    </div>
  )
}