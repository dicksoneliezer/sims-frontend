import { t as translateUI } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiCalendar, FiClock, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function TeacherTimetable() {
  useLanguage()
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get('/teacher/timetable')
      .then((res) => {
        if (active) {
          const data = Array.isArray(res.data) ? res.data : res.data.data || []
          setTimetable(data)
        }
      })
      .catch(() => {
        if (active) toast.error(translateUI("Unable to load timetable."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [refreshKey])

  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = timetable.filter((t) => t.day_of_week === day)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiCalendar className="h-5 w-5 text-primary" />{translateUI(" My Timetable")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{translateUI("Your weekly teaching schedule.")}</p>
        </div>
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{translateUI(" Refresh")}</button>
      </section>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {DAYS.map((day) => (
            <div key={day} className="rounded-xl border border-border bg-surface shadow-sm">
              <div className="border-b border-border bg-muted px-4 py-2">
                <h3 className="font-semibold text-foreground">{translateUI(day)}</h3>
              </div>
              <div className="space-y-3 p-4">
                {grouped[day].length === 0 ? (
                  <p className="text-sm text-muted-foreground">{translateUI("No classes.")}</p>
                ) : grouped[day].map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <FiClock className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{item.subject?.name ?? translateUI("Subject")}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.start_time} - {item.end_time} · {item.room ?? translateUI("Room")}
                      </p>
                      <p className="text-xs text-muted-foreground">{translateUI("Class: ")}{item.school_class?.name ?? item.class?.name ?? '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}