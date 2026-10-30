// src/components/layouts/ParentLayout.jsx
import { useState } from 'react'
import {
  FiGrid,
  FiUsers,
  FiDollarSign,
  FiClock,
  FiPieChart,
  FiFileText,
  FiBell,
  FiMessageSquare,
  FiImage,
  FiFolder,
  FiAward,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser,
} from 'react-icons/fi'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

const PARENT_LINKS = [
  { label: 'Dashboard', path: '/parent', icon: FiGrid, end: true },
  { label: 'My Children', path: '/parent/children', icon: FiUsers },
  { label: 'Payments', path: '/parent/payments', icon: FiDollarSign },
  { label: 'Payment History', path: '/parent/history', icon: FiClock },
  { label: 'Fees / Balance', path: '/parent/balance', icon: FiPieChart },
  { label: 'Statement', path: '/parent/statement', icon: FiFileText },
  { label: 'Report Cards', path: '/parent/report-card', icon: FiAward },
  { label: 'Announcements', path: '/parent/announcements', icon: FiBell },
  { label: 'Messages', path: '/parent/messages', icon: FiMessageSquare },
  { label: 'Gallery', path: '/parent/gallery', icon: FiImage },
  { label: 'Documents', path: '/parent/documents', icon: FiFolder },
  { label: 'My Profile', path: '/parent/profile', icon: FiUser }, // <-- Imebadilishwa
]

export function ParentLayout({ title = 'Parent Portal', children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-muted">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">S</div>
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary-foreground">SIMS</p>
          <p className="text-xs text-muted-foreground">Parent Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {PARENT_LINKS.map((link) => (
          <NavLink
            key={link.label}
            to={link.path}
            end={link.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-sidebar-hover hover:text-brand-foreground'
              }`
            }
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-lg p-3 bg-sidebar-hover/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials(user?.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-primary-foreground">{user?.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">Parent</p>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-red-500" title="Logout">
            <FiLogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-muted">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-overlay" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-64">
            <button className="absolute right-3 top-3 z-10 p-1 text-muted-foreground" onClick={() => setOpen(false)}>
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
              <button className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden" onClick={() => setOpen(true)}>
                <FiMenu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-muted">
              <FiLogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}