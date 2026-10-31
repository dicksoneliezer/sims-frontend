import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
// src/components/layouts/SystemLayout.jsx
import { useRef, useState } from 'react'
import {
  FiGrid,
  FiSettings,
  FiDatabase,
  FiList,
  FiUsers,
  FiTrash2,
  FiActivity,
  FiAlertCircle,
  FiKey,
  FiUser,
  FiMenu,
  FiX,
} from 'react-icons/fi'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { ProfileMenu } from '../common/ProfileMenu'
import { SidebarLogout } from '../common/SidebarLogout'
import { LanguageSwitch } from '../common/LanguageSwitch'
import { ThemeToggle } from '../common/ThemeToggle'
import { PageBoundary } from '../common/PageBoundary'
import { useDialogFocus } from '../../hooks/useDialogFocus'
import { useAuth } from '../../hooks/useAuth'

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

const SYSTEM_LINKS = [
  { label: 'Dashboard', path: '/system', icon: FiGrid, end: true },
  { label: 'System Settings', path: '/system/settings', icon: FiSettings },
  { label: 'Database Backup', path: '/system/backup', icon: FiDatabase },
  { label: 'System Logs', path: '/system/logs', icon: FiList },
  { label: 'User Sessions', path: '/system/sessions', icon: FiUsers },
  { label: 'Cache Management', path: '/system/cache', icon: FiTrash2 },
  { label: 'Queue Monitor', path: '/system/queue', icon: FiActivity },
  { label: 'Error Logs', path: '/system/errors', icon: FiAlertCircle },
  { label: 'API Keys', path: '/system/api-keys', icon: FiKey },
  { label: 'My Profile', path: '/system/profile', icon: FiUser },   // <-- MPYA
]

export function SystemLayout({ title = 'System Admin Portal', children }) {
  useLanguage()
  const { user } = useAuth()
  const location = useLocation()
  const activeLink = SYSTEM_LINKS.find((link) => link.end ? location.pathname === link.path : location.pathname === link.path || location.pathname.startsWith(`${link.path}/`))
  const pageTitle = activeLink?.label ?? title
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  useDialogFocus(menuRef, () => setOpen(false), open)

  const sidebar = (
    <div className="app-sidebar flex h-full flex-col bg-sidebar text-sidebar-muted">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">S</div>
        <div>
          <p className="text-sm font-semibold tracking-wide text-sidebar-foreground">{t("SIMS")}</p>
          <p className="text-xs text-sidebar-muted">{t("System Admin")}</p>
        </div>
      </div>

      <nav aria-label={t("Main navigation")} className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {SYSTEM_LINKS.map((link) => (
          <NavLink
            key={link.label}
            to={link.path}
            end={link.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-brand-foreground'
              }`
            }
          >
            <link.icon className="h-4 w-4" />
            {t(link.label)}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-lg p-3 bg-sidebar-hover/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials(user?.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.full_name}</p>
            <p className="truncate text-xs text-sidebar-muted">{t("System Admin")}</p>
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
            <ProfileMenu profilePath="/system/profile" />
            </div>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <PageBoundary key={location.pathname}>{children || <Outlet />}</PageBoundary>
        </main>
      </div>
    </div>
  )
}