import { SchoolImage } from '../../components/common/SchoolImage'
import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiArrowRight, FiRefreshCw, FiUser, FiUsers } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getChildren } from '../../api/parent'
import { getParentBalance } from '../../api/finance'
import { formatMoney } from '../../utils/format'

export default function Children() {
  useLanguage()
  const [children, setChildren] = useState([])
  const [balances, setBalances] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)

    Promise.all([getChildren(), getParentBalance()])
      .then(([childList, balance]) => {
        if (!active) return
        setChildren(childList)
        setBalances(Object.fromEntries(balance.children.map((row) => [row.student_id, row])))
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load your children."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [refreshKey])

  return (
    // Hapa tunaondoa AppLayout na MODULES_BY_ROLE kabisa. Tunabaki na div ya maudhui pekee.
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiUsers className="h-5 w-5 text-primary" />{t(" My children")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("View your children's profile, fees and results.")}</p>
        </div>
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
      </section>

      {loading ? (
        <div className="rounded-xl border border-border bg-surface p-14 text-center shadow-sm"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : children.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-14 text-center text-muted-foreground shadow-sm">{t("No children are linked to your account. Contact the school office.")}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {children.map((child) => {
            const balance = balances[child.id]

            return (
              <article key={child.id} className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  {child.photo_url ? (
                    <SchoolImage src={child.photo_url} alt={child.full_name} className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary"><FiUser className="h-6 w-6" /></div>
                  )}
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-foreground">{child.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{child.student_number}</p>
                    <p className="text-xs text-muted-foreground">{child.school_class?.name ?? child.class ?? t("No class")} · {child.gender ?? '—'}</p>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("Total invoiced")}</dt>
                    <dd className="mt-0.5 font-medium text-foreground">{formatMoney(balance?.total_invoiced ?? 0)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("Outstanding")}</dt>
                    <dd className={`mt-0.5 font-semibold ${(balance?.outstanding ?? 0) > 0 ? 'text-danger' : 'text-success'}`}>{formatMoney(balance?.outstanding ?? 0)}</dd>
                  </div>
                </dl>

                <Link to={`/parent/children/${child.id}`} className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-primary-soft px-3 py-2 text-sm font-semibold text-primary hover:bg-blue-100">{t("View details")}<FiArrowRight className="h-4 w-4" />
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}