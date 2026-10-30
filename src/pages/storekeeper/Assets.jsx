import { useEffect, useState } from 'react'
import { FiArchive, FiPlus, FiRefreshCw, FiSearch } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { Modal } from '../../components/common/Modal'
import { formatMoney } from '../../utils/format'

export default function StoreKeeperAssets() {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [assetFormOpen, setAssetFormOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    asset_code: '',
    category: '',
    location: '',
    purchase_cost: '',
    current_value: '',
    status: 'active',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      setLoading(true)
      api.get('/storekeeper/assets', { params: { search, per_page: 50 } })
        .then((res) => {
          if (active) setAssets(res.data.data || [])
        })
        .catch(() => {
          if (active) toast.error('Unable to load assets.')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.post('/storekeeper/assets', {
        ...form,
        purchase_cost: Number(form.purchase_cost) || 0,
        current_value: Number(form.current_value) || 0,
      })
      toast.success('Asset registered successfully')
      setAssetFormOpen(false)
      setForm({
        name: '',
        asset_code: '',
        category: '',
        location: '',
        purchase_cost: '',
        current_value: '',
        status: 'active',
      })
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to register asset.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiArchive className="h-5 w-5 text-primary" /> All Assets
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage school assets and their current value.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button type="button" onClick={() => setAssetFormOpen(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
            <FiPlus className="h-4 w-4" /> Register Asset
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border p-4">
          <div className="relative max-w-md">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search asset name or code"
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-right">Purchase Cost</th>
                <th className="px-4 py-3 text-right">Current Value</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center text-muted-foreground">No assets found.</td></tr>
              ) : assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.asset_code}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{asset.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{asset.location || '—'}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatMoney(asset.purchase_cost)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(asset.current_value)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      asset.status === 'active' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'
                    }`}>{asset.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Register Asset Modal */}
      {assetFormOpen && (
        <Modal title="Register Asset" description="Add a new asset to the school inventory." onClose={() => setAssetFormOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Asset Name</span>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Asset Code</span>
                <input required value={form.asset_code} onChange={(e) => setForm({ ...form, asset_code: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Category</span>
                <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Location</span>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Purchase Cost</span>
                <input type="number" min="0" step="0.01" value={form.purchase_cost} onChange={(e) => setForm({ ...form, purchase_cost: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Current Value</span>
                <input type="number" min="0" step="0.01" value={form.current_value} onChange={(e) => setForm({ ...form, current_value: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Status</span>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary">
                  <option value="active">Active</option>
                  <option value="under_maintenance">Under Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setAssetFormOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">{saving ? 'Saving...' : 'Register Asset'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}