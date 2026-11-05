import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { t } from '../../utils/i18n'

export function SidebarBrand({ subtitle }) {
  useLanguage()
  const { user } = useAuth()
  const schoolName = user?.school?.name
  return (
    <div className="flex items-center gap-3 px-6 py-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">S</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold tracking-wide text-sidebar-foreground">{t('SIMS')}</p>
        {(schoolName || user?.role === 'system_admin') && <p className="mt-1 break-words text-xs font-medium leading-relaxed text-sidebar-foreground" title={schoolName}>{schoolName || t('All schools')}</p>}
        <p className="mt-0.5 text-xs text-sidebar-muted">{t(subtitle)}</p>
      </div>
    </div>
  )
}
