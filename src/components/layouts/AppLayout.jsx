// src/components/layouts/AppLayout.jsx
import { useState } from 'react'
import {
  FiArchive,
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiChevronDown,
  FiChevronRight,
  FiClipboard,
  FiDollarSign,
  FiFileText,
  FiGrid,
  FiImage,
  FiLayers,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiTool,
  FiUser,
  FiUserCheck,
  FiUserPlus,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
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
 * Sidebar modules zilizopangwa kwa makundi bila kurudia.
 * Kila section ina `id`, `label`, na `items`.
 * Kila item ina `label` (jina la module), `icon`, na `path` (hiari).
 */
const SIDEBAR_SECTIONS = [
  {
    id: 'user-management',
    label: 'User Management',
    items: [
      { label: 'Manage Users', icon: FiUsers, path: '/admin/users' },
    ],
  },
  {
    id: 'user-lists',
    label: 'User Lists',
    items: [
      { label: 'Add Parent', icon: FiUserPlus, path: '/admin/parents' },
      { label: 'Students List', icon: FiUsers, path: '/admin/students' },
      { label: 'Teachers List', icon: FiUserCheck, path: '/admin/teachers' },
      { label: 'Parents List', icon: FiUser, path: '/admin/parents' },
      { label: 'Accountants List', icon: FiUser, path: '/admin/accountants' },
      { label: 'Store Keepers List', icon: FiArchive, path: '/admin/users' },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance',
    items: [
      { label: 'Teacher Attendance', icon: FiUserCheck, path: '/admin/users' },
      { label: 'Attendance Stats', icon: FiBarChart2, path: '/admin/reports' },
    ],
  },
  {
    id: 'academic-setup',
    label: 'Academic Setup',
    items: [
      { label: 'Manage Classes', icon: FiLayers, path: '/admin/subjects' },
      { label: 'Manage Subjects', icon: FiBookOpen, path: '/admin/subjects' },
      { label: 'Assign Subjects', icon: FiClipboard, path: '/admin/teachers' },
    ],
  },
  {
    id: 'timetables',
    label: 'Timetables',
    items: [{ label: 'Manage Timetables', icon: FiCalendar, path: '/admin/timetables' }],
  },
  {
    id: 'school-setup',
    label: 'School Setup',
    items: [
      { label: 'School Settings', icon: FiSettings, path: '/admin/settings' },
      { label: 'Grading System', icon: FiFileText, path: '/admin/settings' },
      { label: 'Fee Structure', icon: FiDollarSign, path: '/admin/fee-structure' },
      { label: 'School Calendar', icon: FiCalendar, path: '/admin/settings' },
    ],
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    items: [{ label: 'Fix Accounts', icon: FiTool, path: '/admin/users' }],
  },
  {
    id: 'content',
    label: 'Content',
    items: [{ label: 'Gallery', icon: FiImage, path: '/admin/settings' }],
  },
]

/**
 * Icon resolver kwa module yoyote.
 */
function ModuleIcon({ module, className = 'h-4 w-4' }) {
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
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  // Fungua makundi yote kwa default.
  const [openSections, setOpenSections] = useState(() =>
    SIDEBAR_SECTIONS.reduce((acc, section) => {
      acc[section.id] = true
      return acc
    }, {}),
  )

  const homePath = getHomePath(user?.role)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  /**
   * Render item — kila kitu ni clickable.
   * Kama item ina `path` (kutoka SIDEBAR_SECTIONS au getModulePath), tumia NavLink.
   * Kama haina, onyesha kama button isiyo clickable (HAKUNA kurudi dashboard).
   */
  const renderItem = (label, Icon, explicitPath) => {
    const path = explicitPath || getModulePath(user?.role, label)

    // Kama path ipo — tumia NavLink
    if (path) {
      return (
        <NavLink
          key={label}
          to={path}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
              isActive
                ? 'bg-sidebar-hover font-medium text-primary-foreground'
                : 'text-muted-foreground hover:bg-sidebar-hover hover:text-brand-foreground'
            }`
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      )
    }

    // Kama path haipo — onyesha kama button (HAKUNA kurudi dashboard)
    return (
      <button
        key={label}
        type="button"
        onClick={() => setOpen(false)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-sidebar-hover hover:text-brand-foreground"
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    )
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-muted">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
          S
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary-foreground">SIMS</p>
          <p className="text-xs text-muted-foreground">Student Information</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {/* Dashboard */}
        <NavLink
          to={homePath}
          end
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-sidebar-hover hover:text-brand-foreground'
            }`
          }
        >
          <FiGrid className="h-4 w-4" />
          Dashboard
        </NavLink>

        {/* Modules zilizoainishwa na parent — kila kitu ni clickable */}
        {modules.map((module) => {
          const path = getModulePath(user?.role, module)

          return (
            <NavLink
              key={module}
              to={path || homePath}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-sidebar-hover font-medium text-primary-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-hover hover:text-brand-foreground'
                }`
              }
            >
              <ModuleIcon module={module} />
              {module}
            </NavLink>
          )
        })}

        {/* My Profile — link ya moja kwa moja */}
        <NavLink
          to="/profile"
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              isActive
                ? 'bg-sidebar-hover font-medium text-primary-foreground'
                : 'text-muted-foreground hover:bg-sidebar-hover hover:text-brand-foreground'
            }`
          }
        >
          <FiUser className="h-4 w-4" />
          My Profile
        </NavLink>

        {/* Makundi ya sidebar yenye kufunguka/kufunga */}
        {SIDEBAR_SECTIONS.map((section) => {
          const isOpen = !!openSections[section.id]

          return (
            <div key={section.id} className="pt-1">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition hover:bg-sidebar-hover hover:text-brand-foreground"
              >
                <span>{section.label}</span>
                {isOpen ? (
                  <FiChevronDown className="h-4 w-4" />
                ) : (
                  <FiChevronRight className="h-4 w-4" />
                )}
              </button>

              {isOpen && (
                <div className="mt-1 space-y-0.5 pl-2">
                  {section.items.map((item) =>
                    renderItem(item.label, item.icon, item.path)
                  )}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <NavLink
          to="/profile"
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
            <p className="truncate text-sm font-medium text-primary-foreground">{user?.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">{ROLE_LABELS[user?.role] ?? user?.role}</p>
          </div>
          <FiUser className="h-4 w-4 text-muted-foreground" />
        </NavLink>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-muted">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-overlay"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-64">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute right-3 top-3 z-10 rounded-md p-1 text-muted-foreground hover:text-brand-foreground"
              onClick={() => setOpen(false)}
            >
              <FiX className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <FiMenu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {ROLE_LABELS[user?.role] ?? 'Dashboard'}
                </p>
                <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="hidden rounded-lg p-2 text-muted-foreground hover:bg-muted sm:block"
                aria-label="Notifications"
              >
                <FiBell className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                <FiLogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  )
}