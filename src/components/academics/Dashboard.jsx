import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiUsers, FiUserCheck, FiBookOpen, FiAward, FiBarChart2, FiCalendar } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'

export default function AcademicDashboard() {
  useLanguage()
  const [stats, setStats] = useState({
    teachersCount: 0,
    studentsCount: 0,
    subjectsCount: 0,
    examsCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Tunachukua data zote kwa pamoja (Promise.all)
        const [teachersRes, studentsRes, subjectsRes, examsRes] = await Promise.all([
          api.get('/academic/teachers').catch(() => ({ data: { data: [] } })),
          api.get('/academic/students').catch(() => ({ data: { data: [] } })),
          api.get('/academic/subjects').catch(() => ({ data: { data: [] } })),
          api.get('/academic/exams').catch(() => ({ data: { data: [] } })),
        ])

        const teachers = Array.isArray(teachersRes.data) ? teachersRes.data : teachersRes.data.data || []
        const students = Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data.data || []
        const subjects = Array.isArray(subjectsRes.data) ? subjectsRes.data : subjectsRes.data.data || []
        const exams = Array.isArray(examsRes.data) ? examsRes.data : examsRes.data.data || []

        setStats({
          teachersCount: teachers.length,
          studentsCount: students.length,
          subjectsCount: subjects.length,
          examsCount: exams.length,
        })
      } catch (err) {
        toast.error(t("Unable to load dashboard data."))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-foreground">{t("Welcome back!")}</h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Takwimu (Stats) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title={t("All Teachers")} value={stats.teachersCount} icon={FiUserCheck} color="text-blue-600" bg="bg-blue-50" />
            <StatCard title={t("All Students")} value={stats.studentsCount} icon={FiUsers} color="text-purple-600" bg="bg-purple-50" />
            <StatCard title={t("Subjects")} value={stats.subjectsCount} icon={FiBookOpen} color="text-green-600" bg="bg-green-50" />
            <StatCard title={t("Exams")} value={stats.examsCount} icon={FiAward} color="text-orange-600" bg="bg-orange-50" />
          </div>

          {/* Quick Actions */}
          <div className="bg-surface p-6 rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4 text-foreground">{t("Quick Actions")}</h2>
            <div className="flex flex-wrap gap-4">
              <Link to="/academic/exams" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition">
                <FiAward className="h-4 w-4" />{t(" Manage Exams")}</Link>
              <Link to="/academic/results" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                <FiBarChart2 className="h-4 w-4" />{t(" Results Analysis")}</Link>
              <Link to="/academic/syllabus" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">
                <FiBookOpen className="h-4 w-4" />{t(" Syllabus Tracker")}</Link>
              <Link to="/academic/timetable" className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition">
                <FiCalendar className="h-4 w-4" />{t(" Timetable")}</Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, bg }) {
  useLanguage()
  return (
    <div className="bg-surface p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${bg} ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{t(title)}</p>
        <p className="text-2xl font-bold text-foreground">{value || 0}</p>
      </div>
    </div>
  )
}