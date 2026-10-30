import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiRefreshCw, FiSearch, FiTrash2, FiUserCheck } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { deleteAccountant, listAccountants } from '../../api/people'
import { AppLayout } from '../../components/layouts/AppLayout'
import { Modal } from '../../components/common/Modal'
import { AccountantForm } from '../../components/people/AccountantForm'
import { MODULES_BY_ROLE } from '../../utils/constants'

const PAGE_SIZE = 10

export default function Accountants() {
  const [accountants, setAccountants] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search)
      setPage(1)
    }, 350)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let active = true
    setLoading(true)

    listAccountants({ search: query, page, per_page: PAGE_SIZE })
      .then((response) => {
        if (!active) return
        setAccountants(response.data)
        setMeta(response.meta)
      })
      .catch(() => {
        if (active) toast.error('Unable to load accountants.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [query, page, refreshKey])

  const handleDelete = async (accountant) => {
    if (!window.confirm(`Delete ${accountant.full_name}? This cannot be undone.`)) return

    try {
      await deleteAccountant(accountant.id)
      toast.success('Accountant deleted')
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to delete accountant.')
    }
  }

  return (
    <AppLayout modules={MODULES_BY_ROLE.super_admin} title="Accountants">
      <div className="space-y-5">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <FiUserCheck className="h-5 w-5 text-primary" /> Accountants
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Manage finance staff accounts.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button type="button" onClick={() => setForm({ accountant: null })} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              <FiPlus className="h-4 w-4" /> Add accountant
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
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, username, phone or email"
                className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Accountant</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Employment ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
                ) : accountants.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-14 text-center text-muted-foreground">No accountants found.</td></tr>
                ) : accountants.map((accountant) => (
                  <tr key={accountant.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{accountant.full_name}</p>
                      <p className="text-xs text-muted-foreground">@{accountant.username}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{accountant.phone ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{accountant.email ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{accountant.employment_id ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${accountant.is_active ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground'}`}>
                        {accountant.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setForm({ accountant })} className="rounded-lg p-2 text-muted-foreground hover:bg-warning-soft hover:text-warning" aria-label={`Edit ${accountant.full_name}`}>
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(accountant)} className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger" aria-label={`Delete ${accountant.full_name}`}>
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <p>Showing <span className="font-medium text-foreground">{meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1}</span>–<span className="font-medium text-foreground">{Math.min(meta.current_page * meta.per_page, meta.total)}</span> of <span className="font-medium text-foreground">{meta.total}</span></p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={meta.current_page <= 1 || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">Previous</button>
              <span>Page {meta.current_page} of {Math.max(meta.last_page, 1)}</span>
              <button type="button" onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))} disabled={meta.current_page >= meta.last_page || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">Next</button>
            </div>
          </div>
        </section>
      </div>

      {form && (
        <Modal title={form.accountant ? 'Edit accountant' : 'Add accountant'} onClose={() => setForm(null)}>
          <AccountantForm accountant={form.accountant} onClose={() => setForm(null)} onSaved={() => setRefreshKey((key) => key + 1)} />
        </Modal>
      )}
    </AppLayout>
  )
}
