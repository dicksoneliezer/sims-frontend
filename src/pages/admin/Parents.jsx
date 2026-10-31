import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiRefreshCw, FiSearch, FiTrash2, FiUsers } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { deleteParent, listParents } from '../../api/people'
import { AppLayout } from '../../components/layouts/AppLayout'
import { Modal } from '../../components/common/Modal'
import { ParentForm } from '../../components/people/ParentForm'
import { MODULES_BY_ROLE } from '../../utils/constants'

const PAGE_SIZE = 10

export default function Parents() {
  useLanguage()
  const [parents, setParents] = useState([])
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

    listParents({ search: query, page, per_page: PAGE_SIZE })
      .then((response) => {
        if (!active) return
        setParents(response.data)
        setMeta(response.meta)
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load parents."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [query, page, refreshKey])

  const handleDelete = async (parent) => {
    if (!window.confirm(t("Delete {0}? This cannot be undone.", [parent.full_name]))) return

    try {
      await deleteParent(parent.id)
      toast.success(t("Parent deleted"))
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? t("Unable to delete parent."))
    }
  }

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const to = Math.min(meta.current_page * meta.per_page, meta.total)

  return (
    <AppLayout modules={MODULES_BY_ROLE.super_admin} title={t("Parents")}>
      <div className="space-y-5">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <FiUsers className="h-5 w-5 text-primary" />{t(" Parents")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("Manage parent accounts and their linked children.")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
            <button type="button" onClick={() => setForm({ parent: null })} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              <FiPlus className="h-4 w-4" />{t(" Add parent")}</button>
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
                placeholder={t("Search name, username, phone or email")}
                className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{t("Parent")}</th>
                  <th className="px-4 py-3">{t("Contact")}</th>
                  <th className="px-4 py-3">{t("Children")}</th>
                  <th className="px-4 py-3">{t("Status")}</th>
                  <th className="px-4 py-3 text-right">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-14 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
                ) : parents.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-14 text-center text-muted-foreground">{t("No parents found.")}</td></tr>
                ) : parents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{parent.full_name}</p>
                      <p className="text-xs text-muted-foreground">@{parent.username}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{parent.phone ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{parent.email ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{parent.children_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${parent.is_active ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground'}`}>
                        {parent.is_active ? t("Active") : t("Inactive")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setForm({ parent })} className="rounded-lg p-2 text-muted-foreground hover:bg-warning-soft hover:text-warning" aria-label={t("Edit {0}", [parent.full_name])}>
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(parent)} className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger" aria-label={t("Delete {0}", [parent.full_name])}>
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
            <p>{t("Showing ")}<span className="font-medium text-foreground">{from}</span>–<span className="font-medium text-foreground">{to}</span>{t(" of ")}<span className="font-medium text-foreground">{meta.total}</span>{t(" parents")}</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={meta.current_page <= 1 || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">{t("Previous")}</button>
              <span>{t("Page ")}{meta.current_page}{t(" of ")}{Math.max(meta.last_page, 1)}</span>
              <button type="button" onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))} disabled={meta.current_page >= meta.last_page || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">{t("Next")}</button>
            </div>
          </div>
        </section>
      </div>

      {form && (
        <Modal title={form.parent ? t("Edit parent") : t("Add parent")} description={form.parent ? t("Update {0}.", [form.parent.full_name]) : t("Create a parent account and link students.")} onClose={() => setForm(null)}>
          <ParentForm parent={form.parent} onClose={() => setForm(null)} onSaved={() => setRefreshKey((key) => key + 1)} />
        </Modal>
      )}
    </AppLayout>
  )
}
