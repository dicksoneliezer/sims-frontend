import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useMemo, useState } from 'react'
import { FiAward, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { getOwnResults } from '../../api/self'

function gradeTone(grade) {
  if (!grade) return 'bg-muted text-muted-foreground'
  if (['A', 'B'].includes(grade[0])) return 'bg-success-soft text-success'
  if (grade[0] === 'C') return 'bg-primary-soft text-primary'
  if (grade[0] === 'D') return 'bg-warning-soft text-warning'
  return 'bg-danger-soft text-danger'
}

export default function StudentResults() {
  useLanguage()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [term, setTerm] = useState('')
  const [academicYear, setAcademicYear] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)

    getOwnResults({ term: term || undefined, academic_year: academicYear || undefined })
      .then((response) => {
        if (active) setData(response)
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load your results."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [term, academicYear, refreshKey])

  const terms = useMemo(() => [...new Set((data?.results ?? []).map((row) => row.term).filter(Boolean))], [data])
  const years = useMemo(() => [...new Set((data?.results ?? []).map((row) => row.academic_year).filter(Boolean))], [data])

  return (
    // Hapa tunaondoa AppLayout na MODULES_BY_ROLE kabisa. Tunabaki na div ya maudhui pekee.
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiAward className="h-5 w-5 text-primary" />{t(" My results")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {data?.student ? `${data.student.full_name} · ${data.student.student_number} · ${data.student.school_class?.name ?? data.student.class ?? 'No class'}` : t("View your exam and assessment results.")}
          </p>
        </div>
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
      </section>

      <div className="flex flex-wrap gap-3">
        <select value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="">{t("All academic years")}</option>
          {years.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
        <select value={term} onChange={(event) => setTerm(event.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="">{t("All terms")}</option>
          {terms.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ['Results', data?.summary?.count],
          ['Average', data?.summary?.average],
          ['Highest', data?.summary?.highest],
          ['Lowest', data?.summary?.lowest],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{t(label)}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{value ?? '—'}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Exam")}</th>
                <th className="px-4 py-3">{t("Subject")}</th>
                <th className="px-4 py-3">{t("Term")}</th>
                <th className="px-4 py-3">{t("Year")}</th>
                <th className="px-4 py-3 text-right">{t("Marks")}</th>
                <th className="px-4 py-3">{t("Grade")}</th>
                <th className="px-4 py-3">{t("Remarks")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : (data?.results ?? []).length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-muted-foreground">{t("No results have been published yet.")}</td></tr>
              ) : data.results.map((result) => (
                <tr key={result.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{result.exam?.name ?? result.exam_name}</p>
                    <p className="text-xs capitalize text-muted-foreground">{result.exam?.type === 'ca' || result.exam_type === 'ca' ? t("Continuous assessment") : t("Exam")}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{result.subject?.name} <span className="text-xs text-muted-foreground">({result.subject?.code})</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{result.term ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{result.academic_year ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{result.marks}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${gradeTone(result.grade)}`}>{result.grade ?? '—'}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{result.remarks ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}