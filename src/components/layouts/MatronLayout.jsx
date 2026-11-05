import { SidebarBrand } from '../common/SidebarBrand'
import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
// src/components/layouts/MatronLayout.jsx
import { useRef, useState } from 'react'
import {
  FiGrid,
  FiHome,
  FiUsers,
  FiCheckSquare,
  FiAlertTriangle,
  FiHeart,
  FiFileText,
  FiClipboard,
  FiMail,
  FiUser,
  FiMenu,
  FiX,
  FiCalendar,
} from 'react-icons/fi'
import { Outlet, useLocation } from 'react-router-dom'
import { ProfileMenu } from '../common/ProfileMenu'
import { SidebarLogout } from '../common/SidebarLogout'
import { LanguageSwitch } from '../common/LanguageSwitch'
import { ThemeToggle } from '../common/ThemeToggle'
import { PortalSidebarLinks, PortalModuleTabs } from '../common/PortalNavigation'
import { PageBoundary } from '../common/PageBoundary'
import { useDialogFocus } from '../../hooks/useDialogFocus'
import { useAuth } from '../../hooks/useAuth'

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

const MATRON_LINKS = [
  { label: 'Dashboard', path: '/matron', icon: FiGrid, end: true },
  { label: 'Dormitories', path: '/matron/dormitories', icon: FiHome },
  { label: 'Bed Assignments', path: '/matron/beds', icon: FiUsers },
  { label: 'Roll Call', path: '/matron/roll-call', icon: FiCheckSquare },
  { label: 'Leaves', path: '/matron/leaves', icon: FiCalendar },
  { label: 'Sick Bay', path: '/matron/sick-bay', icon: FiHeart },
  { label: 'Incidents', path: '/matron/incidents', icon: FiAlertTriangle },
  { label: 'Inspections', path: '/matron/inspections', icon: FiClipboard },
  { label: 'Messages', path: '/matron/messages', icon: FiMail },
  { label: 'Reports', path: '/matron/reports', icon: FiFileText },
  { label: 'My Profile', path: '/matron/profile', icon: FiUser },   // <-- BADILISHWA
]

export function MatronLayout({ title = 'Matron Portal', children }) {
  useLanguage()
  const { user } = useAuth()
  const location = useLocation()
  const activeLink = MATRON_LINKS.find((link) => link.end ? location.pathname === link.path : location.pathname === link.path || location.pathname.startsWith(`${link.path}/`))
  const pageTitle = activeLink?.label ?? title
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  useDialogFocus(menuRef, () => setOpen(false), open)

  const sidebar = (
    <div className="app-sidebar flex h-full flex-col bg-sidebar text-sidebar-muted">
      <SidebarBrand subtitle="Matron Portal" />

      <nav aria-label={t("Main navigation")} className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        <PortalSidebarLinks role={user?.role} links={MATRON_LINKS} onNavigate={() => setOpen(false)} />
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-lg p-3 bg-sidebar-hover/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials(user?.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.full_name}</p>
            <p className="truncate text-xs text-sidebar-muted">{t("Matron")}</p>
          </div>
        </div>
        <SidebarLogout />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">{t("Skip to content")}</a>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label={t("Close menu")} className="absolute inset-0 bg-overlay" onClick={() => setOpen(false)} />
          <aside ref={menuRef} role="dialog" aria-modal="true" aria-label={t("Navigation menu")} tabIndex={-1} className="relative h-full w-64">
            <button type="button" aria-label={t("Close menu")} className="absolute right-3 top-3 z-10 p-1 text-muted-foreground" onClick={() => setOpen(false)}>
              <FiX className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:flex-nowrap sm:px-6">
            <div className="flex items-center gap-3">
              <button type="button" aria-label={t("Open menu")} aria-expanded={open} className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden" onClick={() => setOpen(true)}>
                <FiMenu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">{t(pageTitle)}</h1>
            </div>
            <div className="flex items-center gap-2">
            <LanguageSwitch />
              <ThemeToggle />
            <ProfileMenu profilePath="/matron/profile" />
            </div>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <PortalModuleTabs role={user?.role} links={MATRON_LINKS} />
          <PageBoundary key={location.pathname}>{children || <Outlet />}</PageBoundary>
        </main>
      </div>
    </div>
  )
}