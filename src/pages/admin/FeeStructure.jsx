import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiRefreshCw, FiSearch, FiTrash2, FiDollarSign } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { deleteFeeStructure, listFeeStructures } from '../../api/finance'
import { AppLayout } from '../../components/layouts/AppLayout'
import { Modal } from '../../components/common/Modal'
import { FeeStructureForm } from '../../components/finance/FeeStructureForm'
import { MODULES_BY_ROLE, SCHOOL_LEVELS } from '../../utils/constants'
import { formatMoney } from '../../utils/format'

const PAGE_SIZE = 10

export default function FeeStructure() {
  useLanguage()
  const [fees, setFees] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, per_page: PAGE_SIZE, total: 0, last_page: 1 })
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState({ search: '', school_level: '' })
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((current) => current.search === search ? current : { ...current, search })
      setPage(1)
    }, 350)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let active = true
    setLoading(true)

    listFeeStructures({ ...query, page, per_page: PAGE_SIZE })
      .then((response) => {
        if (!active) return
        setFees(response.data)
        setMeta(response.meta)
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load fee structures."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [query, page, refreshKey])

  const handleDelete = async (fee) => {
    if (!window.confirm(t("Delete {0}?", [fee.name]))) return

    try {
      await deleteFeeStructure(fee.id)
      toast.success(t("Fee structure deleted"))
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? t("Unable to delete fee structure."))
    }
  }

  return (
    <AppLayout modules={MODULES_BY_ROLE.super_admin} title={t("Fee Structure")}>
      <div className="space-y-5">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <FiDollarSign className="h-5 w-5 text-primary" />{t(" Fee structure")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("Define fees used for manual and bulk invoicing.")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
            <button type="button" onClick={() => setForm({ fee: null })} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              <FiPlus className="h-4 w-4" />{t(" Add fee")}</button>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="grid gap-3 border-b border-border p-4 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("Search fee name")}
                className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={query.school_level}
              onChange={(event) => { setQuery((current) => ({ ...current, school_level: event.target.value })); setPage(1) }}
              className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">{t("All levels")}</option>
              {Object.entries(SCHOOL_LEVELS).map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{t("Name")}</th>
                  <th className="px-4 py-3">{t("Class")}</th>
                  <th className="px-4 py-3">{t("Term")}</th>
                  <th className="px-4 py-3 text-right">{t("Amount")}</th>
                  <th className="px-4 py-3 text-right">{t("Invoices")}</th>
                  <th className="px-4 py-3">{t("Status")}</th>
                  <th className="px-4 py-3 text-right">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-14 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
                ) : fees.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-14 text-center text-muted-foreground">{t("No fee structures found.")}</td></tr>
                ) : fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{fee.name}</p>
                      <p className="text-xs text-muted-foreground">{SCHOOL_LEVELS[fee.school_level] ?? fee.school_level ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{fee.school_class?.name ?? t("All")}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fee.term ?? '—'} {fee.academic_year ? `· ${fee.academic_year}` : ''}</td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">{formatMoney(fee.amount)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{fee.invoices_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${fee.is_active ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground'}`}>{fee.is_active ? t("Active") : t("Inactive")}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setForm({ fee })} className="rounded-lg p-2 text-muted-foreground hover:bg-warning-soft hover:text-warning" aria-label={t("Edit {0}", [fee.name])}><FiEdit2 className="h-4 w-4" /></button>
                        <button type="button" onClick={() => handleDelete(fee)} className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger" aria-label={t("Delete {0}", [fee.name])}><FiTrash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <p>{t("Showing ")}<span className="font-medium text-foreground">{meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1}</span>–<span className="font-medium text-foreground">{Math.min(meta.current_page * meta.per_page, meta.total)}</span>{t(" of ")}<span className="font-medium text-foreground">{meta.total}</span></p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={meta.current_page <= 1 || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">{t("Previous")}</button>
              <span>{t("Page ")}{meta.current_page}{t(" of ")}{Math.max(meta.last_page, 1)}</span>
              <button type="button" onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))} disabled={meta.current_page >= meta.last_page || loading} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">{t("Next")}</button>
            </div>
          </div>
        </section>
      </div>

      {form && (
        <Modal title={form.fee ? t("Edit fee structure") : t("Add fee structure")} onClose={() => setForm(null)}>
          <FeeStructureForm fee={form.fee} onClose={() => setForm(null)} onSaved={() => setRefreshKey((key) => key + 1)} />
        </Modal>
      )}
    </AppLayout>
  )
}
