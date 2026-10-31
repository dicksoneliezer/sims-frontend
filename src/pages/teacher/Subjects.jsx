import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiBookOpen, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'

export default function TeacherSubjects() {
  useLanguage()
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get('/teacher/subjects')
      .then((res) => {
        if (active) {
          const data = Array.isArray(res.data) ? res.data : res.data.data || []
          setSubjects(data)
        }
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load subjects."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [refreshKey])

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiBookOpen className="h-5 w-5 text-primary" />{t(" My Subjects")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("View subjects you teach and their classes.")}</p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Subject")}</th>
                <th className="px-4 py-3">{t("Code")}</th>
                <th className="px-4 py-3">{t("Class")}</th>
                <th className="px-4 py-3">{t("Academic Year")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-14 text-center">
                    <div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
                  </td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-14 text-center text-muted-foreground">{t("No subjects assigned yet.")}</td>
                </tr>
              ) : (
                subjects.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {row.subject_name ?? row.subject?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.subject_code ?? row.subject?.code ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.class_name ?? row.school_class?.name ?? row.class?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.academic_year ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}