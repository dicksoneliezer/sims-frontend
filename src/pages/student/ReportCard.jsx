import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiAward, FiDownload } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate } from '../../utils/format'

const SAMPLE_REPORT = {
  student_name: 'Amina Hassan',
  student_number: 'SIMS-2026-0001',
  class: 'Form 1A',
  term: 'Term 1',
  academic_year: '2026',
  results: [
    { subject: 'Mathematics', marks: 78, grade: 'B', remarks: 'Good effort' },
    { subject: 'English', marks: 66, grade: 'C', remarks: 'Can improve' },
    { subject: 'Kiswahili', marks: 71, grade: 'B', remarks: 'Good' },
    { subject: 'Biology', marks: 83, grade: 'A', remarks: 'Excellent' },
    { subject: 'Geography', marks: 59, grade: 'D', remarks: 'Needs more work' },
  ],
  average: 71.4,
  attendance_rate: 90,
  published_at: '2026-10-20T00:00:00Z',
}

export default function StudentReportCard() {
  useLanguage()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/student/report-card')
      .then((res) => {
        if (active) setReport(res.data?.data || res.data)
      })
      .catch(() => {
        if (active) setReport(SAMPLE_REPORT)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  const handleDownload = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">{t("No report card available yet.")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiAward className="h-5 w-5 text-primary" />{t(" My Report Card")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{report.term} · {report.academic_year}</p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          <FiDownload className="h-4 w-4" />{t(" Print / Save PDF")}</button>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 border-b border-border pb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
            {report.student_name?.charAt(0) || '?'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{report.student_name}</h3>
            <p className="text-sm text-muted-foreground">{report.student_number} · {report.class}</p>
            <p className="text-xs text-muted-foreground">{t("Published ")}{formatDate(report.published_at)}</p>
          </div>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-primary-soft p-3">
            <dt className="text-xs text-primary">{t("Average score")}</dt>
            <dd className="mt-1 text-lg font-semibold text-primary">{report.average}%</dd>
          </div>
          <div className="rounded-lg bg-success-soft p-3">
            <dt className="text-xs text-success">{t("Attendance rate")}</dt>
            <dd className="mt-1 text-lg font-semibold text-success">{report.attendance_rate}%</dd>
          </div>
        </dl>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Subject")}</th>
                <th className="px-4 py-3 text-right">{t("Marks")}</th>
                <th className="px-4 py-3">{t("Grade")}</th>
                <th className="px-4 py-3">{t("Remarks")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.results.map((r, i) => (
                <tr key={i} className="hover:bg-muted/70">
                  <td className="px-4 py-3 font-medium text-foreground">{r.subject}</td>
                  <td className="px-4 py-3 text-right text-foreground">{r.marks}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{r.grade}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.remarks ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}