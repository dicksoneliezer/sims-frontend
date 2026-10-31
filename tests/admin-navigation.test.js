import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { ADMIN_NAV_SECTIONS, getAdminDashboardPath, getAdminSection, isAdminItemActive } from '../src/utils/adminNavigation.js'
import { getModulePath, MODULES_BY_ROLE } from '../src/utils/constants.js'

const items = ADMIN_NAV_SECTIONS.flatMap((section) => section.items)
const locationFor = (path) => new URL(path, 'http://sims.local')

test('every admin destination is registered and every admin module stays accessible', async () => {
  const routes = await readFile(new URL('../src/routes/AppRoutes.jsx', import.meta.url), 'utf8')
  const registered = new Set([...routes.matchAll(/path: '(\/admin[^']*)'/g)].map((match) => match[1]))
  const destinations = new Set(items.map((item) => locationFor(item.path).pathname))
  for (const item of items) {
    assert.ok(registered.has(locationFor(item.path).pathname), `Missing route for ${item.label}`)
  }
  for (const module of MODULES_BY_ROLE.super_admin) {
    assert.ok(destinations.has(getModulePath('super_admin', module)), `Missing module: ${module}`)
  }
  assert.equal(new Set(items.map((item) => item.path)).size, items.length)
})

test('only the selected link is active, including settings tabs and store keepers', () => {
  for (const item of items) {
    const active = items.filter((candidate) => isAdminItemActive(candidate.path, locationFor(item.path)))
    assert.deepEqual(active.map((candidate) => candidate.path), [item.path])
  }
  assert.equal(items.filter((item) => isAdminItemActive(item.path, locationFor('/admin'))).length, 0)
  assert.ok(isAdminItemActive('/admin/settings?tab=school', locationFor('/admin/settings')))
  assert.ok(!isAdminItemActive('/admin/users', locationFor('/admin/users-other')))
})

test('each category opens its dashboard and keeps only its own modules across navigation', () => {
  for (const section of ADMIN_NAV_SECTIONS) {
    const dashboard = locationFor(getAdminDashboardPath(section))
    assert.equal(dashboard.pathname, '/admin/dashboard')
    assert.equal(getAdminSection(dashboard), section)
    for (const item of section.items) {
      assert.equal(getAdminSection(locationFor(item.path)), section, item.path)
      // An unrelated category in the URL must not override the actual module.
      const directLink = locationFor(item.path)
      directLink.searchParams.set('category', 'other')
      assert.equal(getAdminSection(directLink), section)
    }
    assert.equal(getAdminSection(locationFor(`/profile?category=${section.id}`)), section)
  }
})

test('landing, missing categories and invalid categories do not select a workspace', () => {
  for (const path of ['/admin', '/admin?category=academics', '/admin/dashboard', '/admin/dashboard?category=invalid', '/profile', '/profile?category=invalid']) {
    assert.equal(getAdminSection(locationFor(path)), null, path)
  }
})

