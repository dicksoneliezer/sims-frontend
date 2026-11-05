import { isAdminItemActive } from './adminNavigation'

// These are navigation groups only. Every child keeps its existing route and page.
const GROUPS = {
  teacher: [
    ['teaching', 'Teaching & Assessment', ['subjects', 'marks', 'timetable']],
    ['students', 'Students & Support', ['students', 'attendance', 'notes', 'behavior']],
  ],
  academic_teacher: [
    ['people', 'Teachers & Students', ['teachers', 'students']],
    ['assessment', 'Exams & Results', ['exams', 'results']],
    ['teaching', 'Curriculum & Timetable', ['syllabus', 'allocation', 'timetable']],
  ],
  student: [
    ['learning', 'Learning', ['assignments', 'notes', 'timetable']],
    ['performance', 'Results & Certificates', ['results', 'report-card', 'certificates']],
  ],
  parent: [
    ['children', 'Children & Learning', ['children', 'report-card']],
    ['fees', 'Fees & Payments', ['payments', 'history', 'balance', 'statement']],
    ['communication', 'Communication', ['announcements', 'messages']],
    ['resources', 'School Resources', ['gallery', 'documents']],
  ],
  accountant: [
    ['fees', 'Billing', ['billing', 'invoices', 'payments', 'control-numbers', 'debts']],
    ['accounts', 'Accounting & Reports', ['expenses', 'reconciliation', 'reports']],
  ],
  store_keeper: [
    ['assets', 'Assets & Maintenance', ['assets', 'maintenance']],
    ['stock', 'Inventory & Stock', ['inventory', 'stock', 'alerts']],
  ],
  matron: [
    ['housing', 'Dormitories & Beds', ['dormitories', 'beds']],
    ['welfare', 'Student Welfare', ['roll-call', 'leaves', 'sick-bay', 'incidents', 'inspections']],
  ],
  system_admin: [
    ['access', 'Access & Settings', ['settings', 'sessions', 'api-keys']],
    ['maintenance', 'System Maintenance', ['backup', 'cache', 'queue']],
    ['monitoring', 'Logs & Errors', ['logs', 'errors']],
  ],
  super_admin: [
    ['accounts', 'User Accounts', ['users', 'users?role=store_keeper']],
    ['students', 'Students & Parents', ['students', 'parents']],
    ['staff', 'Staff', ['teachers', 'accountants']],
    ['academics', 'Academic Management', ['classes', 'subjects', 'timetables']],
    ['finance', 'Finance', ['finance', 'fee-structure']],
    ['operations', 'Operations & Reports', ['inventory', 'reports']],
    // Settings already provides its own query-backed tabs inside the page.
    ['school', 'School Setup', ['settings?tab=school', 'settings?tab=grading', 'settings?tab=calendar'], false],
  ],
}

function moduleKey(path) {
  const url = new URL(path, 'http://sims.local')
  return `${url.pathname.split('/').slice(2).join('/')}${url.search}`
}

export function isPortalLinkActive(link, location, role) {
  const target = new URL(link.path, 'http://sims.local')
  if (link.end) return location.pathname === target.pathname
  if (role === 'super_admin') return isAdminItemActive(link.path, location)
  return location.pathname === target.pathname || location.pathname.startsWith(`${target.pathname}/`)
}

export function buildPortalNavigation(role, links) {
  const groups = (GROUPS[role] ?? []).map(([id, label, paths, tabs = true]) => ({
    id, label, tabs, items: links.filter((link) => paths.includes(moduleKey(link.path))),
  })).filter((group) => group.items.length > 1)
  const entries = []
  const added = new Set()
  for (const link of links) {
    const group = groups.find((candidate) => candidate.items.includes(link))
    if (group) {
      if (!added.has(group.id)) {
        entries.push({ ...group, path: group.items[0].path, icon: group.items[0].icon, grouped: true })
        added.add(group.id)
      }
    } else {
      entries.push({ ...link, id: link.path, items: [link], grouped: false })
    }
  }
  return entries
}

export function getActivePortalGroup(role, links, location) {
  return buildPortalNavigation(role, links).find((entry) => entry.grouped && entry.tabs && entry.items.some((link) => isPortalLinkActive(link, location, role))) ?? null
}
