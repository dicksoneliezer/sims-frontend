// src/pages/storekeeper/Dashboard.jsx
import { useEffect, useState } from 'react'
import {
  FiArchive,
  FiBox,
  FiAlertTriangle,
  FiTool,
  FiTrendingDown,
  FiFileText,
  FiArrowRight,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const STAT_META = [
  { key: 'assetsCount', label: 'Total Assets', icon: FiArchive, tone: 'bg-primary-soft text-primary' },
  { key: 'inventoryCount', label: 'Inventory Items', icon: FiBox, tone: 'bg-info-soft text-info' },
  { key: 'lowStockCount', label: 'Low Stock Alerts', icon: FiAlertTriangle, tone: 'bg-warning-soft text-warning' },
  { key: 'maintenanceCount', label: 'Maintenance Tasks', icon: FiTool, tone: 'bg-danger-soft text-danger' },
]

export default function StoreKeeperDashboard() {
  const [stats, setStats] = useState({
    assetsCount: 0,
    inventoryCount: 0,
    lowStockCount: 0,
    maintenanceCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const dashboardRes = await api
          .get('/storekeeper/dashboard')
          .catch(() => ({ data: { data: {} } }))
        const data = dashboardRes.data.data || {}

        setStats({
          assetsCount: data.assets_count ?? data.total_assets ?? 0,
          inventoryCount: data.inventory_count ?? data.total_inventory ?? 0,
          lowStockCount: data.low_stock_count ?? data.low_stock_alerts ?? 0,
          maintenanceCount: data.maintenance_count ?? data.pending_maintenance ?? 0,
        })
      } catch (err) {
        toast.error('Unable to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand to-primary px-6 py-7 text-primary-foreground sm:px-8">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-muted">
          Store workspace
        </p>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Welcome back!</h2>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          Manage assets, inventory, stock movements, and maintenance records.
        </p>
      </section>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-14">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_META.map((meta) => (
            <article key={meta.key} className="dashboard-stat-card">
              <div className={`inline-flex rounded-lg p-2.5 ${meta.tone}`}>
                <meta.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">{stats[meta.key] ?? 0}</p>
              <p className="text-sm text-muted-foreground">{meta.label}</p>
            </article>
          ))}
        </section>
      )}

      {/* Quick Actions */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="font-semibold text-foreground">Quick actions</h3>
        <p className="mt-1 text-sm text-muted-foreground">Jump to the most common store tasks.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/storekeeper/assets"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition"
          >
            <FiArchive className="h-4 w-4" /> Manage Assets <FiArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/storekeeper/inventory"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiBox className="h-4 w-4" /> View Inventory
          </Link>
          <Link
            to="/storekeeper/stock"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiTrendingDown className="h-4 w-4" /> Stock In/Out
          </Link>
          <Link
            to="/storekeeper/maintenance"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiTool className="h-4 w-4" /> Maintenance
          </Link>
          <Link
            to="/storekeeper/alerts"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiAlertTriangle className="h-4 w-4" /> Low Stock Alerts
          </Link>
          <Link
            to="/storekeeper/reports"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <FiFileText className="h-4 w-4" /> Reports
          </Link>
        </div>
      </section>
    </div>
  )
}