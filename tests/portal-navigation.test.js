import './jsx-loader.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { parseSync } from 'rolldown/utils'

const { buildPortalNavigation, getActivePortalGroup, isPortalLinkActive } = await import('../src/utils/portalNavigation.js')
const { ADMIN_NAV_SECTIONS, getAdminSection } = await import('../src/utils/adminNavigation.js')
const { PortalSidebarLinks, PortalModuleTabs } = await import('../src/components/common/PortalNavigation.jsx')
const portals = [
  ['Teacher', 'teacher'], ['Academic', 'academic_teacher'], ['Student', 'student'],
  ['Parent', 'parent'], ['Accountant', 'accountant'], ['StoreKeeper', 'store_keeper'],
  ['Matron', 'matron'], ['System', 'system_admin'],
]
const locationFor = (path) => new URL(path, 'http://sims.local')

async function getLinks(name) {
  const path = `../src/components/layouts/${name}Layout.jsx`
  const source = await readFile(new URL(path, import.meta.url), 'utf8')
  const ast = parseSync(path, source, { lang: 'jsx' }).program
  const declaration = ast.body.flatMap((node) => node.declarations ?? []).find((node) => node.id.name.endsWith('_LINKS'))
  return declaration.init.elements.map((node) => Object.fromEntries(node.properties
    .filter((property) => property.value.type === 'Literal')
    .map((property) => [property.key.name, property.value.value])))
}

test('grouping shortens every role sidebar without dropping, duplicating or changing any destination', async () => {
  for (const [name, role] of portals) {
    const links = await getLinks(name)
    const entries = buildPortalNavigation(role, links)
    assert.ok(entries.length < links.length, name)
    assert.deepEqual(entries.flatMap((entry) => entry.items.map((item) => item.path)).sort(), links.map((link) => link.path).sort(), name)
    for (const entry of entries) {
      assert.equal(entry.path, entry.items[0].path)
      if (!entry.grouped) continue
      for (const item of entry.items) {
        const group = getActivePortalGroup(role, links, locationFor(item.path))
        assert.equal(group.id, entry.id, `${name}: ${item.path}`)
        assert.equal(group.items.filter((link) => isPortalLinkActive(link, locationFor(item.path), role)).length, 1)
      }
    }
  }
})

test('admin grouping stays within the selected category and retains native Settings tabs', () => {
  for (const section of ADMIN_NAV_SECTIONS) {
    const entries = buildPortalNavigation('super_admin', section.items)
    assert.ok(entries.length < section.items.length, section.id)
    assert.deepEqual(entries.flatMap((entry) => entry.items.map((item) => item.path)).sort(), section.items.map((item) => item.path).sort())
    for (const item of section.items) {
      const group = getActivePortalGroup('super_admin', section.items, locationFor(item.path))
      if (section.id === 'school') assert.equal(group, null, 'Settings already renders its own tabs')
      else assert.ok(group?.items.some((link) => link.path === item.path), item.path)
    }
  }
  const location = locationFor('/admin/users?role=teacher')
  assert.equal(getAdminSection(location).id, 'people')
  assert.ok(isPortalLinkActive({ path: '/admin/users' }, location, 'super_admin'))
  assert.ok(!isPortalLinkActive({ path: '/admin/users?role=store_keeper' }, location, 'super_admin'))
})

test('tabs are real route links with one active destination, including query filters and deep links', async () => {
  const links = await getLinks('Parent')
  assert.equal(getActivePortalGroup('parent', links, locationFor('/parent/children/42')).id, 'children')
  assert.equal(getActivePortalGroup('parent', links, locationFor('/parent/profile')), null)
  assert.equal(getActivePortalGroup('parent', links, locationFor('/parent')), null)
  assert.equal(isPortalLinkActive({ path: '/parent/payments' }, locationFor('/parent/payments-other'), 'parent'), false)
  const items = ADMIN_NAV_SECTIONS.find((section) => section.id === 'people').items
  const html = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ['/admin/users?role=store_keeper'] },
    createElement(PortalModuleTabs, { role: 'super_admin', links: items })))
  assert.ok(html.includes('href="/admin/users"'))
  assert.ok(html.includes('href="/admin/users?role=store_keeper"'))
  assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1)
  const sidebar = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ['/parent/history'] },
    createElement(PortalSidebarLinks, { role: 'parent', links })))
  assert.ok(sidebar.includes('Fees &amp; Payments'))
  assert.ok(!sidebar.includes('href="/parent/history"'), 'The history route belongs in the tabs, not a second sidebar entry')
  assert.ok(sidebar.includes('aria-current="location"'))
})

function contrast(a, b) {
  const luminance = (hex) => {
    const values = hex.match(/[\da-f]{2}/gi).map((value) => parseInt(value, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722
  }
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

test('native options define both text and background, with readable light and dark colour pairs', async () => {
  const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
  assert.match(css, /select,\s*select option,\s*select optgroup\s*\{[^}]*background-color: var\(--theme-surface\);[^}]*color: var\(--theme-foreground\);/)
  assert.match(css, /\[data-theme='dark'\] select optgroup\s*\{ color-scheme: dark;/)
  const themes = await readFile(new URL('../src/theme/themes.css', import.meta.url), 'utf8')
  for (const theme of ['light', 'dark']) {
    const block = themes.split(`[data-theme='${theme}'] {`)[1].split('}')[0]
    const colour = (key) => block.match(new RegExp(`--theme-${key}: (#[\\da-f]+);`, 'i'))[1]
    assert.ok(contrast(colour('surface'), colour('foreground')) >= 4.5, theme)
    assert.ok(contrast(colour('primary'), colour('primary-foreground')) >= 4.5, `${theme}: selected option`)
  }
})
