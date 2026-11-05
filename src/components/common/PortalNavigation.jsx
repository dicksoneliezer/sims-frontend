import { FiGrid } from 'react-icons/fi'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { t } from '../../utils/i18n'
import { buildPortalNavigation, getActivePortalGroup, isPortalLinkActive } from '../../utils/portalNavigation'

export function PortalSidebarLinks({ role, links, onNavigate }) {
  useLanguage()
  const location = useLocation()
  return buildPortalNavigation(role, links).map((entry) => {
    const active = entry.items.some((link) => isPortalLinkActive(link, location, role))
    const Icon = entry.icon ?? FiGrid
    return (
      <Link key={entry.id} to={entry.path} onClick={onNavigate}
        aria-current={active ? (entry.grouped ? 'location' : 'page') : undefined}
        className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? 'bg-primary font-medium text-primary-foreground' : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-brand-foreground'}`}
      >
        <Icon className="h-4 w-4 shrink-0" /><span>{t(entry.label)}</span>
      </Link>
    )
  })
}

export function PortalModuleTabs({ role, links }) {
  useLanguage()
  const location = useLocation()
  const group = getActivePortalGroup(role, links, location)
  if (!group) return null
  return (
    <section className="mb-5 min-w-0 rounded-xl border border-border bg-surface p-3 shadow-sm sm:p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t(group.label)}</p>
      <nav aria-label={t(group.label)} className="flex flex-wrap gap-2">
        {group.items.map((link) => {
          const active = isPortalLinkActive(link, location, role)
          return (
            <NavLink key={link.path} to={link.path} aria-current={active ? 'page' : 'false'}
              className={`inline-flex min-h-10 items-center rounded-lg border px-3 py-2 text-sm font-medium transition ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground hover:bg-muted'}`}
            >{t(link.label)}</NavLink>
          )
        })}
      </nav>
    </section>
  )
}
