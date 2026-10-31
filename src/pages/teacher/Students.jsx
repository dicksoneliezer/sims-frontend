import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiUsers, FiRefreshCw, FiSearch } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'

export default function TeacherStudents() {
  useLanguage()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      setLoading(true)
      api.get('/teacher/students', { params: { search, per_page: 100 } })
        .then((res) => {
          if (active) {
            const data = Array.isArray(res.data) ? res.data : res.data.data || []
            setStudents(data)
          }
        })
        .catch(() => {
          if (active) toast.error(t("Unable to load students."))
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 350)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [search, refreshKey])

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiUsers className="h-5 w-5 text-primary" />{t(" My Students")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("View students assigned to your classes.")}</p>
        </div>
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border p-4">
          <div className="relative max-w-md">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("Search student by name or number")}
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Student No")}</th>
                <th className="px-4 py-3">{t("Full Name")}</th>
                <th className="px-4 py-3">{t("Class")}</th>
                <th className="px-4 py-3">{t("Parent Phone")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-14 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-14 text-center text-muted-foreground">{t("No students found.")}</td></tr>
              ) : students.map((student) => (
                <tr key={student.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3 font-medium text-foreground">{student.student_number}</td>
                  <td className="px-4 py-3 text-foreground">{student.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{student.class ?? student.school_class?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{student.parent_phone ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}