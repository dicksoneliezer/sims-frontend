// src/components/layouts/AcademicLayout.jsx
import { useState } from 'react'
import {
  FiGrid,
  FiBookOpen,
  FiUsers,
  FiUserCheck,
  FiAward,
  FiBarChart2,
  FiCalendar,
  FiBell,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiLayers,
} from 'react-icons/fi'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

const ACADEMIC_LINKS = [
  { label: 'Dashboard', path: '/academic', icon: FiGrid, end: true },
  { label: 'All Teachers', path: '/academic/teachers', icon: FiUserCheck },
  { label: 'All Students', path: '/academic/students', icon: FiUsers },
  { label: 'Manage Exams', path: '/academic/exams', icon: FiAward },
  { label: 'Results Analysis', path: '/academic/results', icon: FiBarChart2 },
  { label: 'Syllabus Tracker', path: '/academic/syllabus', icon: FiBookOpen },
  { label: 'Subject Allocation', path: '/academic/allocation', icon: FiLayers }, // <-- MPYA
  { label: 'Timetable', path: '/academic/timetable', icon: FiCalendar },
  { label: 'Announcements', path: '/academic/announcements', icon: FiBell }, // <-- MPYA
  { label: 'My Profile', path: '/academic/profile', icon: FiUser }, // <-- MPYA
]

export function AcademicLayout({ title = 'Academic Portal', children }) {
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
          <p className="text-xs text-muted-foreground">Academic Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {ACADEMIC_LINKS.map((link) => (
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
            <p className="truncate text-xs text-muted-foreground">Academic Teacher</p>
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