import {
  FiArchive, FiBarChart2, FiBookOpen, FiCalendar, FiDollarSign,
  FiFileText, FiLayers, FiSettings, FiUser, FiUserCheck, FiUsers,
} from 'react-icons/fi'

export const ADMIN_NAV_SECTIONS = [
  {
    id: 'people', label: 'People & Accounts', icon: FiUsers,
    items: [
      { label: 'Manage Users', icon: FiUsers, path: '/admin/users' },
      { label: 'Students', icon: FiUsers, path: '/admin/students' },
      { label: 'Teachers', icon: FiUserCheck, path: '/admin/teachers' },
      { label: 'Parents', icon: FiUser, path: '/admin/parents' },
      { label: 'Accountants', icon: FiUser, path: '/admin/accountants' },
      { label: 'Store Keepers', icon: FiArchive, path: '/admin/users?role=store_keeper' },
    ],
  },
  {
    id: 'academics', label: 'Academics', icon: FiBookOpen,
    items: [
      { label: 'Subjects', icon: FiBookOpen, path: '/admin/subjects' },
      { label: 'Timetables', icon: FiCalendar, path: '/admin/timetables' },
    ],
  },
  {
    id: 'finance', label: 'Finance', icon: FiDollarSign,
    items: [
      { label: 'Finance Overview', icon: FiBarChart2, path: '/admin/finance' },
      { label: 'Fee Structure', icon: FiDollarSign, path: '/admin/fee-structure' },
    ],
  },
  {
    id: 'operations', label: 'Operations & Reports', icon: FiLayers,
    items: [
      { label: 'Inventory', icon: FiArchive, path: '/admin/inventory' },
      { label: 'Reports', icon: FiBarChart2, path: '/admin/reports' },
    ],
  },
  {
    id: 'school', label: 'School Setup', icon: FiSettings,
    items: [
      { label: 'School Settings', icon: FiSettings, path: '/admin/settings?tab=school' },
      { label: 'Grading System', icon: FiFileText, path: '/admin/settings?tab=grading' },
      { label: 'School Calendar', icon: FiCalendar, path: '/admin/settings?tab=calendar' },
    ],
  },
]

// Settings tabs and filtered user lists share routes but have distinct active links.
export function isAdminItemActive(path, location) {
  const target = new URL(path, 'http://sims.local')
  if (location.pathname !== target.pathname && !location.pathname.startsWith(`${target.pathname}/`)) return false
  const current = new URLSearchParams(location.search)
  if (target.pathname === '/admin/settings') {
    return (current.get('tab') || 'school') === (target.searchParams.get('tab') || 'school')
  }
  if (target.pathname === '/admin/users') {
    return (current.get('role') || '') === (target.searchParams.get('role') || '')
  }
  return true
}

export function getAdminSection(location) {
  // Module URLs determine their own category, including direct links and refreshes.
  const section = ADMIN_NAV_SECTIONS.find((candidate) =>
    candidate.items.some((item) => isAdminItemActive(item.path, location)),
  )
  if (section) return section
  if (location.pathname !== '/admin/dashboard' && location.pathname !== '/profile') return null
  const category = new URLSearchParams(location.search).get('category')
  return ADMIN_NAV_SECTIONS.find((candidate) => candidate.id === category) ?? null
}

export function getAdminDashboardPath(section) {
  return `/admin/dashboard?category=${section.id}`
}
