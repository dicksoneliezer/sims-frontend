import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiUsers, FiDollarSign, FiAlertCircle, FiClock } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatMoney } from '../../utils/format'

export default function ParentDashboard() {
  useLanguage()
  const [stats, setStats] = useState({
    childrenCount: 0,
    totalOutstanding: 0,
    totalPaid: 0,
    pendingPayments: 0,
  })
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Tunachukua data za watoto na salio (balance) kwa pamoja
        const [childrenRes, balanceRes] = await Promise.all([
          api.get('/parent/children').catch(() => ({ data: { data: [] } })),
          api.get('/parent/payments/balance').catch(() => ({ data: { data: {} } })),
        ])

        const childrenData = Array.isArray(childrenRes.data) ? childrenRes.data : childrenRes.data.data || []
        const balanceData = balanceRes.data.data || {}

        // Tunajumuisha takwimu
        let totalOutstanding = 0
        let totalPaid = 0

        if (balanceData.children) {
          balanceData.children.forEach((child) => {
            totalOutstanding += Number(child.outstanding || 0)
            totalPaid += Number(child.total_paid || 0)
          })
        }

        setStats({
          childrenCount: childrenData.length,
          totalOutstanding: totalOutstanding,
          totalPaid: totalPaid,
          pendingPayments: 0, // Tunaweza kuhesabu baadaye kama API inarudisha
        })
        setChildren(childrenData)
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
          {/* Takwimu */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title={t("My Children")} value={stats.childrenCount} icon={FiUsers} color="text-blue-600" bg="bg-blue-50" />
            <StatCard title={t("Outstanding Fees")} value={formatMoney(stats.totalOutstanding)} icon={FiAlertCircle} color="text-red-600" bg="bg-red-50" isText />
            <StatCard title={t("Total Paid")} value={formatMoney(stats.totalPaid)} icon={FiDollarSign} color="text-green-600" bg="bg-green-50" isText />
            <StatCard title={t("Pending Payments")} value={stats.pendingPayments} icon={FiClock} color="text-orange-600" bg="bg-orange-50" />
          </div>

          {/* Orodha ya Watoto */}
          <div className="bg-surface p-6 rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4 text-foreground">{t("My Children")}</h2>
            {children.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("No children linked to your account yet.")}</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {children.map((child) => (
                  <div key={child.id} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                      {child.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{child.full_name}</p>
                      <p className="text-xs text-muted-foreground">{child.student_number} · {child.class || '—'}</p>
                    </div>
                    <Link to={`/parent/children/${child.id}`} className="text-sm font-medium text-primary hover:underline">{t("View")}</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-surface p-6 rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4 text-foreground">{t("Quick Actions")}</h2>
            <div className="flex flex-wrap gap-4">
              <Link to="/parent/payments" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition">{t("Make a Payment")}</Link>
              <Link to="/parent/balance" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">{t("View Balance")}</Link>
              <Link to="/parent/history" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition">{t("Payment History")}</Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, bg, isText = false }) {
  useLanguage()
  return (
    <div className="bg-surface p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${bg} ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{t(title)}</p>
        <p className={`font-bold text-foreground ${isText ? 'text-lg' : 'text-2xl'}`}>
          {value}
        </p>
      </div>
    </div>
  )
}