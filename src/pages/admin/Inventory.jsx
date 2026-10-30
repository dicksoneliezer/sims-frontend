import { useEffect, useState } from 'react'
import {
  FiAlertTriangle,
  FiArchive,
  FiBox,
  FiRefreshCw,
  FiSearch,
  FiTool,
  FiTrendingUp,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import {
  getInventoryOverview,
  listAssetMaintenance,
  listAssets,
  listInventoryItems,
  listStockAlerts,
  listStockTransactions,
} from '../../api/inventory'
import { AppLayout } from '../../components/layouts/AppLayout'
import { MODULES_BY_ROLE } from '../../utils/constants'
import { formatDate, formatMoney, formatNumber } from '../../utils/format'

const PAGE_SIZE = 10

const TABS = [
  { key: 'assets', label: 'Assets', loader: listAssets },
  { key: 'items', label: 'Stock Items', loader: listInventoryItems },
  { key: 'stock', label: 'Stock Movements', loader: listStockTransactions },
  { key: 'alerts', label: 'Low Stock', loader: listStockAlerts },
  { key: 'maintenance', label: 'Maintenance', loader: listAssetMaintenance },
]

const SUMMARY = [
  { key: 'total_assets', label: 'Total assets', icon: FiArchive, tone: 'bg-primary-soft text-primary', money: false },
  { key: 'assets_current_value', label: 'Current asset value', icon: FiTrendingUp, tone: 'bg-success-soft text-success', money: true },
  { key: 'total_items', label: 'Stock items', icon: FiBox, tone: 'bg-info-soft text-info', money: false },
  { key: 'stock_value', label: 'Stock value', icon: FiBox, tone: 'bg-info-soft text-info', money: true },
  { key: 'low_stock_items', label: 'Low stock items', icon: FiAlertTriangle, tone: 'bg-warning-soft text-warning', money: false },
  { key: 'maintenance_due', label: 'Maintenance due', icon: FiTool, tone: 'bg-danger-soft text-danger', money: false },
]

function buildRow(tab, item) {
  if (tab === 'assets') {
    return {
      id: item.id,
      title: `${item.asset_code} · ${item.name}`,
      subtitle: `${item.category}${item.location ? ` · ${item.location}` : ''}`,
      detail: `${item.condition ?? '-'} condition · ${item.maintenance_count ?? 0} maintenance record(s)`,
      value: item.current_value,
      date: item.purchase_date,
      status: item.status,
    }
  }

  if (tab === 'items') {
    return {
      id: item.id,
      title: `${item.item_code} · ${item.name}`,
      subtitle: `${item.category}${item.location ? ` · ${item.location}` : ''}`,
      detail: `${formatNumber(item.quantity)} ${item.unit} · reorder at ${formatNumber(item.reorder_level)}`,
      value: item.total_value,
      date: item.created_at,
      status: item.is_low_stock ? 'low stock' : item.is_active ? 'active' : 'inactive',
      warning: item.is_low_stock,
    }
  }

  if (tab === 'stock') {
    return {
      id: item.id,
      title: `${item.item?.name ?? 'Item'} · ${item.type}`,
      subtitle: `${item.item?.item_code ?? '-'}${item.student ? ` · ${item.student.full_name}` : ''}`,
      detail: item.notes ?? item.reference ?? '-',
      value: item.total_value,
      quantity: item.quantity,
      date: item.transaction_date,
      status: item.type,
    }
  }

  if (tab === 'alerts') {
    return {
      id: item.id,
      title: item.item?.name ?? 'Unknown item',
      subtitle: item.item?.item_code ?? '-',
      detail: `Quantity ${item.quantity_at_alert} / threshold ${item.threshold}`,
      date: item.created_at,
      status: item.is_resolved ? 'resolved' : 'open',
      warning: !item.is_resolved,
    }
  }

  return {
    id: item.id,
    title: item.asset?.name ?? 'Asset',
    subtitle: `${item.asset?.asset_code ?? '-'} · ${item.performed_by ?? '-'}`,
    detail: item.description,
    value: item.cost,
    date: item.maintenance_date,
    status: item.status,
    extra: item.next_due_date ? `Next due ${formatDate(item.next_due_date)}` : null,
  }
}

export default function Inventory() {
  const [overview, setOverview] = useState(null)
  const [tab, setTab] = useState('assets')
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInventoryOverview()
      .then(setOverview)
      .catch(() => toast.error('Unable to load inventory overview.'))
  }, [refreshKey])

  useEffect(() => {
    let active = true
    setLoading(true)

    const loader = TABS.find((item) => item.key === tab)?.loader ?? listAssets

    loader({ search, page, per_page: PAGE_SIZE })
      .then((response) => {
        if (!active) return
        setRows(response.data.map((item) => buildRow(tab, item)))
        setMeta(response.meta)
      })
      .catch(() => {
        if (active) toast.error('Unable to load inventory records.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [tab, search, page, refreshKey])

  const changeTab = (key) => {
    setTab(key)
    setPage(1)
    setSearch('')
  }

  return (
    <AppLayout modules={MODULES_BY_ROLE.super_admin} title="Inventory">
      <div className="space-y-5">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <FiArchive className="h-5 w-5 text-primary" /> Inventory oversight
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Read-only view of assets, stock, alerts and maintenance. Store keepers manage inventory operations.</p>
          </div>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUMMARY.map((item) => (
            <article key={item.key} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className={`inline-flex rounded-lg p-2.5 ${item.tone}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-2xl font-semibold text-foreground">
                {overview ? (item.money ? formatMoney(overview[item.key]) : formatNumber(overview[item.key])) : '-'}
              </p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </article>
          ))}
        </section>

        {overview && overview.open_alerts > 0 && (
          <section className="flex items-start gap-3 rounded-xl border border-amber-200 bg-warning-soft p-4 text-sm text-amber-800">
            <FiAlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">{overview.open_alerts} open low-stock alert(s)</p>
              <p className="text-warning">Review the Low Stock tab for items that need replenishment.</p>
            </div>
          </section>
        )}

        <section className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex flex-wrap gap-1">
              {TABS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => changeTab(item.key)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${tab === item.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="relative w-full max-w-sm">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1) }}
                placeholder="Search records"
                className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Record</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3 text-right">Value / Qty</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-14 text-center text-muted-foreground">No records found.</td></tr>
                ) : rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{row.title}</p>
                      <p className="text-xs text-muted-foreground">{row.subtitle}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{row.detail}</p>
                      {row.extra && <p className="text-xs text-muted-foreground">{row.extra}</p>}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {row.value !== undefined ? formatMoney(row.value) : '-'}
                      {row.quantity !== undefined && <p className="text-xs font-normal text-muted-foreground">{formatNumber(row.quantity)} units</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(row.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${row.warning ? 'bg-warning-soft text-warning' : 'bg-muted text-muted-foreground'}`}>{row.status ?? '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <p>Page <span className="font-medium text-foreground">{meta.current_page}</span> of <span className="font-medium text-foreground">{Math.max(meta.last_page, 1)}</span> · {meta.total} records</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={meta.current_page <= 1 || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">Previous</button>
              <button type="button" onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))} disabled={meta.current_page >= meta.last_page || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">Next</button>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
