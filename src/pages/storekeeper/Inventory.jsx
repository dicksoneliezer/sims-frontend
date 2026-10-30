import { useEffect, useState } from 'react'
import { FiBox, FiPlus, FiRefreshCw, FiSearch } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { Modal } from '../../components/common/Modal'
import { formatMoney } from '../../utils/format'

export default function StoreKeeperInventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [itemFormOpen, setItemFormOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    item_code: '',
    category: '',
    unit: 'pcs',
    quantity: 0,
    reorder_level: 0,
    unit_price: 0,
    location: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      setLoading(true)
      api.get('/storekeeper/inventory', { params: { search, per_page: 50 } })
        .then((res) => {
          if (active) setItems(res.data.data || [])
        })
        .catch(() => {
          if (active) toast.error('Unable to load inventory.')
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
      await api.post('/storekeeper/inventory', {
        ...form,
        quantity: Number(form.quantity) || 0,
        reorder_level: Number(form.reorder_level) || 0,
        unit_price: Number(form.unit_price) || 0,
      })
      toast.success('Item added successfully')
      setItemFormOpen(false)
      setForm({
        name: '',
        item_code: '',
        category: '',
        unit: 'pcs',
        quantity: 0,
        reorder_level: 0,
        unit_price: 0,
        location: '',
      })
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to add item.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiBox className="h-5 w-5 text-primary" /> Inventory Items
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage school supplies and stock levels.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button type="button" onClick={() => setItemFormOpen(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
            <FiPlus className="h-4 w-4" /> Add Item
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
              placeholder="Search item name or code"
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Reorder Level</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center text-muted-foreground">No inventory items found.</td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.item_code}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{item.reorder_level}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatMoney(item.unit_price)}</td>
                  <td className="px-4 py-3">
                    {item.quantity <= item.reorder_level ? (
                      <span className="rounded-full bg-danger-soft px-2.5 py-0.5 text-xs font-semibold text-danger">Low Stock</span>
                    ) : (
                      <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Item Modal */}
      {itemFormOpen && (
        <Modal title="Add Inventory Item" description="Add a new item to the school inventory." onClose={() => setItemFormOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Item Name</span>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Item Code</span>
                <input required value={form.item_code} onChange={(e) => setForm({ ...form, item_code: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Category</span>
                <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Unit</span>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary">
                  <option value="pcs">Pieces</option>
                  <option value="box">Box</option>
                  <option value="kg">Kilograms</option>
                  <option value="litre">Litres</option>
                  <option value="roll">Roll</option>
                  <option value="pack">Pack</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Quantity</span>
                <input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Reorder Level</span>
                <input type="number" min="0" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Unit Price</span>
                <input type="number" min="0" step="0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">Location</span>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setItemFormOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">{saving ? 'Saving...' : 'Add Item'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}