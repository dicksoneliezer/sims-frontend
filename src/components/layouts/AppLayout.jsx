import { SidebarBrand } from '../common/SidebarBrand'
import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
// src/components/layouts/AppLayout.jsx
import { useRef, useState } from 'react'
import {
  FiArchive,
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiArrowLeft,
  FiDollarSign,
  FiGrid,
  FiMenu,
  FiSettings,
  FiUser,
  FiUserCheck,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import { NavLink, useLocation } from 'react-router-dom'
import { ProfileMenu } from '../common/ProfileMenu'
import { SidebarLogout } from '../common/SidebarLogout'
import { LanguageSwitch } from '../common/LanguageSwitch'
import { ThemeToggle } from '../common/ThemeToggle'
import { PortalSidebarLinks, PortalModuleTabs } from '../common/PortalNavigation'
import { PageBoundary } from '../common/PageBoundary'
import { useDialogFocus } from '../../hooks/useDialogFocus'
import { useAuth } from '../../hooks/useAuth'
import { getAdminDashboardPath, getAdminSection } from '../../utils/adminNavigation'
import { getHomePath, getModulePath, ROLE_LABELS } from '../../utils/constants'

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

/**
 * Icon resolver kwa module yoyote.
 */
function ModuleIcon({ module, className = 'h-4 w-4' }) {
  useLanguage()
  if (module === 'Students') return <FiUsers className={className} />
  if (module === 'Teachers') return <FiUserCheck className={className} />
  if (module === 'Subjects') return <FiBookOpen className={className} />
  if (module === 'Timetables' || module === 'Timetable') return <FiCalendar className={className} />
  if (module === 'Users') return <FiUser className={className} />
  if (module === 'Finance') return <FiDollarSign className={className} />
  if (module === 'Inventory') return <FiArchive className={className} />
  if (module === 'Reports') return <FiBarChart2 className={className} />
  if (module === 'Settings') return <FiSettings className={className} />
  if (module === 'Parents') return <FiUser className={className} />
  if (module === 'Accountants') return <FiUser className={className} />
  if (module === 'Fee Structure') return <FiDollarSign className={className} />
  return null
}

export function AppLayout({ modules = [], title = 'Dashboard', children }) {
  useLanguage()
  const { user } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  useDialogFocus(menuRef, () => setOpen(false), open)

  const isAdmin = user?.role === 'super_admin'
  const selectedSection = isAdmin ? getAdminSection(location) : null
  const homePath = selectedSection ? getAdminDashboardPath(selectedSection) : getHomePath(user?.role)
  const profilePath = selectedSection ? `/profile?category=${selectedSection.id}` : '/profile'

  const renderItem = (label, Icon, path, active) => (
    <NavLink
      key={path}
      to={path}
      onClick={() => setOpen(false)}
      aria-current={active === false ? 'false' : active ? 'page' : undefined}
      className={({ isActive }) =>
        `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
          (active ?? isActive)
            ? 'bg-sidebar-hover font-medium text-sidebar-foreground'
            : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-brand-foreground'
        }`
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{t(label)}</span>
    </NavLink>
  )

  const sidebar = () => (
    <div className="app-sidebar flex h-full flex-col bg-sidebar text-sidebar-muted">
      <SidebarBrand subtitle="Student Information" />

      <nav aria-label={t("Main navigation")} className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {/* Dashboard */}
        <NavLink
          to={homePath}
          end
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-brand-foreground'
            }`
          }
        >
          <FiGrid className="h-4 w-4" />{t("Dashboard")}</NavLink>

        {!isAdmin && modules.map((module) => {
          const path = getModulePath(user?.role, module)
          if (!path) return null
          return renderItem(module, () => <ModuleIcon module={module} />, path)
        })}

        {isAdmin && (
          <>
            <NavLink
              to="/admin"
              end
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-muted transition hover:bg-sidebar-hover hover:text-brand-foreground"
            >
              <FiArrowLeft className="h-4 w-4 shrink-0" />{t("All categories")}</NavLink>
            {selectedSection && (
              <div className="pt-3">
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-sidebar-muted">{t(selectedSection.label)}</p>
                <div className="space-y-0.5">
                  <PortalSidebarLinks role={user?.role} links={selectedSection.items} onNavigate={() => setOpen(false)} />
                </div>
              </div>
            )}
          </>
        )}
        {/* My Profile — link ya moja kwa moja */}
        <NavLink
          to={profilePath}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              isActive
                ? 'bg-sidebar-hover font-medium text-sidebar-foreground'
                : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-brand-foreground'
            }`
          }
        >
          <FiUser className="h-4 w-4" />{t("My Profile")}</NavLink>

      </nav>

      <div className="border-t border-sidebar-border p-4">
        <NavLink
          to={profilePath}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg p-3 transition ${
              isActive ? 'bg-primary/20 ring-1 ring-primary/40' : 'bg-sidebar-hover/60 hover:bg-sidebar-hover'
            }`
          }
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials(user?.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.full_name}</p>
            <p className="truncate text-xs text-sidebar-muted">{t(ROLE_LABELS[user?.role] ?? user?.role)}</p>
          </div>
          <FiUser className="h-4 w-4 text-sidebar-muted" />
        </NavLink>
        <SidebarLogout />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">{t("Skip to content")}</a>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar()}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label={t("Close menu")}
            className="absolute inset-0 bg-overlay"
            onClick={() => setOpen(false)}
          />
          <aside ref={menuRef} role="dialog" aria-modal="true" aria-label={t("Navigation menu")} tabIndex={-1} className="relative h-full w-64">
            <button
              type="button"
              aria-label={t("Close menu")}
              className="absolute right-3 top-3 z-10 rounded-md p-1 text-muted-foreground hover:text-brand-foreground"
              onClick={() => setOpen(false)}
            >
              <FiX className="h-5 w-5" />
            </button>
            {sidebar()}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:flex-nowrap sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
                onClick={() => setOpen(true)}
                aria-label={t("Open menu")}
              >
                <FiMenu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t(ROLE_LABELS[user?.role] ?? 'Dashboard')}
                </p>
                <h1 className="text-lg font-semibold text-foreground">{t(title)}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LanguageSwitch />
              <ThemeToggle />
              <button
                type="button"
                className="hidden rounded-lg p-2 text-muted-foreground hover:bg-muted sm:block"
                aria-label={t("Notifications")}
              >
                <FiBell className="h-5 w-5" />
              </button>
              <ProfileMenu profilePath={profilePath} />
            </div>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          {isAdmin && selectedSection && <PortalModuleTabs role={user?.role} links={selectedSection.items} />}
          <PageBoundary key={location.pathname}>{children}</PageBoundary>
        </main>
      </div>
    </div>
  )
}
