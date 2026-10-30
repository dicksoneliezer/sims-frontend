import { useEffect, useState } from 'react'
import { FiTrendingDown, FiTrendingUp, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate, formatMoney } from '../../utils/format'

export default function StoreKeeperStock() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get('/storekeeper/stock', { params: { per_page: 50 } })
      .then((res) => {
        if (active) setTransactions(res.data.data || [])
      })
      .catch(() => {
        if (active) toast.error('Unable to load stock transactions.')
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
            <FiTrendingUp className="h-5 w-5 text-primary" /> Stock In / Out
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Record and review stock movements.</p>
        </div>
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center text-muted-foreground">No stock transactions found.</td></tr>
              ) : transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(tx.transaction_date)}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{tx.item?.name ?? '—'}</td> {/* <-- Imebadilishwa */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      tx.type === 'in' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                    }`}>
                      {tx.type === 'in' ? <FiTrendingUp className="h-3 w-3" /> : <FiTrendingDown className="h-3 w-3" />}
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{tx.quantity}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatMoney(tx.unit_price)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tx.reference ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}