import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiRefreshCw, FiSearch, FiToggleLeft, FiToggleRight, FiTrash2, FiUser } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { deleteUser, listUsers, toggleUserActive } from '../../api/users'
import { AppLayout } from '../../components/layouts/AppLayout'
import { Modal } from '../../components/common/Modal'
import { UserForm } from '../../components/users/UserForm'
import { MODULES_BY_ROLE, ROLE_LABELS } from '../../utils/constants'
import { formatDate } from '../../utils/format'

const PAGE_SIZE = 10

export default function Users() {
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [active, setActive] = useState('')
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
    }, 350)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let activeRequest = true
    setLoading(true)

    listUsers({
      search,
      role,
      is_active: active,
      page,
      per_page: PAGE_SIZE,
    })
      .then((response) => {
        if (!activeRequest) return
        setUsers(response.data)
        setMeta(response.meta)
      })
      .catch(() => {
        if (activeRequest) toast.error('Unable to load users.')
      })
      .finally(() => {
        if (activeRequest) setLoading(false)
      })

    return () => {
      activeRequest = false
    }
  }, [search, role, active, page, refreshKey])

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.full_name}? This cannot be undone.`)) return

    try {
      await deleteUser(user.id)
      toast.success('User deleted')
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to delete user.')
    }
  }

  const handleToggle = async (user) => {
    try {
      const updated = await toggleUserActive(user.id)
      toast.success(updated.is_active ? 'User activated' : 'User deactivated')
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to change user status.')
    }
  }

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const to = Math.min(meta.current_page * meta.per_page, meta.total)

  return (
    <AppLayout modules={MODULES_BY_ROLE.super_admin} title="Users">
      <div className="space-y-5">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <FiUser className="h-5 w-5 text-primary" /> Users
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Manage all user accounts, roles and access.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button type="button" onClick={() => setForm({ user: null })} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              <FiPlus className="h-4 w-4" /> Add user
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="grid gap-3 border-b border-border p-4 md:grid-cols-3">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, username, phone or email"
                className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1) }} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
              <option value="">All roles</option>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select value={active} onChange={(event) => { setActive(event.target.value); setPage(1) }} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
              <option value="">All statuses</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Last login</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-14 text-center text-muted-foreground">No users found.</td></tr>
                ) : users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{user.phone ?? '-'}</p>
                      <p className="text-xs text-muted-foreground">{user.email ?? '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(user.last_login)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.is_active ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => handleToggle(user)} className="rounded-lg p-2 text-muted-foreground hover:bg-primary-soft hover:text-primary" aria-label={`Toggle ${user.full_name}`}>
                          {user.is_active ? <FiToggleRight className="h-4 w-4" /> : <FiToggleLeft className="h-4 w-4" />}
                        </button>
                        <button type="button" onClick={() => setForm({ user })} className="rounded-lg p-2 text-muted-foreground hover:bg-warning-soft hover:text-warning" aria-label={`Edit ${user.full_name}`}>
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(user)} className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger" aria-label={`Delete ${user.full_name}`}>
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
            <p>Showing <span className="font-medium text-foreground">{from}</span>-<span className="font-medium text-foreground">{to}</span> of <span className="font-medium text-foreground">{meta.total}</span> users</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={meta.current_page <= 1 || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">Previous</button>
              <span>Page {meta.current_page} of {Math.max(meta.last_page, 1)}</span>
              <button type="button" onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))} disabled={meta.current_page >= meta.last_page || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">Next</button>
            </div>
          </div>
        </section>
      </div>

      {form && (
        <Modal title={form.user ? 'Edit user' : 'Add user'} description={form.user ? `Update ${form.user.full_name}'s account.` : 'Create a new SIMS user account.'} onClose={() => setForm(null)}>
          <UserForm user={form.user} onClose={() => setForm(null)} onSaved={() => setRefreshKey((key) => key + 1)} />
        </Modal>
      )}
    </AppLayout>
  )
}
