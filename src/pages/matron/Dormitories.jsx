import { useEffect, useState } from 'react'
import { FiHome, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'

export default function MatronDormitories() {
  const [dormitories, setDormitories] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get('/matron/dormitories')
      .then((res) => {
        if (active) setDormitories(res.data.data || [])
      })
      .catch(() => {
        if (active) toast.error('Unable to load dormitories.')
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
            <FiHome className="h-5 w-5 text-primary" /> Dormitories
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage boarding dormitories and their capacity.</p>
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
                <th className="px-4 py-3">Dormitory</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3 text-right">Capacity</th>
                <th className="px-4 py-3">Matron</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
              ) : dormitories.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-14 text-center text-muted-foreground">No dormitories found.</td></tr>
              ) : dormitories.map((dorm) => (
                <tr key={dorm.id} className="hover:bg-muted/70">
                  <td className="px-4 py-3 font-medium text-foreground">{dorm.name}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{dorm.gender || '—'}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{dorm.capacity}</td>
                  <td className="px-4 py-3 text-muted-foreground">{dorm.matron?.full_name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${dorm.is_active ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground'}`}>
                      {dorm.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}