import './jsx-loader.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createRoutesFromChildren, matchRoutes, MemoryRouter } from 'react-router-dom'
import { getHomePath } from '../src/utils/constants.js'
import { setLanguage } from '../src/utils/i18n.js'

const { SchoolCard } = await import('../src/pages/parent/Schools.jsx')
const { default: AppRoutes } = await import('../src/routes/AppRoutes.jsx')
const { ParentLayout } = await import('../src/components/layouts/ParentLayout.jsx')
const { AuthContext } = await import('../src/context/auth-context.js')
const { ThemeContext } = await import('../src/context/theme-context.js')

test('parent login opens school cards, while dashboard and child pages retain the parent sidebar', () => {
  const routes = createRoutesFromChildren(AppRoutes().props.children)
  assert.equal(getHomePath('parent'), '/parent')
  const landing = matchRoutes(routes, '/parent')
  assert.equal(landing.at(-1).route.index, true)
  assert.ok(!landing.some(({ route }) => route.element?.type === ParentLayout))
  for (const path of ['/parent/dashboard', '/parent/children', '/parent/children/42', '/parent/payments', '/parent/profile']) {
    const matches = matchRoutes(routes, path)
    assert.ok(matches.some(({ route }) => route.element?.type === ParentLayout), path)
  }
})

test('registered school has a distinct colour and text badge, while other schools remain clickable with access labels', () => {
  for (const language of ['en', 'sw']) {
    setLanguage(language)
    const own = renderToStaticMarkup(createElement(SchoolCard, { school: { id: 1, name: 'Own School', code: 'SCH-1', is_my_school: true }, onOpen() {} }))
    const other = renderToStaticMarkup(createElement(SchoolCard, { school: { id: 2, name: 'Other School', code: 'SCH-2', is_my_school: false }, onOpen() {} }))
    assert.ok(own.includes('bg-primary-soft'))
    assert.ok(own.includes(language === 'en' ? 'Your registered school' : 'Shule uliyosajiliwa'))
    assert.ok(other.includes(language === 'en' ? 'No access' : 'Huna ruhusa'))
    assert.ok(other.includes('type="button"'))
    assert.ok(!/\sdisabled(?:=|[\s>])/.test(other))
    assert.ok(!other.includes('href='))
  }
  setLanguage('en')
})

test('all portal sidebars display SIMS and the authenticated school name without rendering school names as HTML', async () => {
  const portals = [['App', 'super_admin', '/admin/subjects'], ['Academic', 'academic_teacher', '/academic'], ['Accountant', 'accountant', '/accountant'], ['Teacher', 'teacher', '/teacher'], ['Student', 'student', '/student'], ['Parent', 'parent', '/parent/dashboard'], ['Matron', 'matron', '/matron'], ['StoreKeeper', 'store_keeper', '/storekeeper'], ['System', 'system_admin', '/system']]
  for (const [name, role, path] of portals) {
    const { [`${name}Layout`]: Layout } = await import(`../src/components/layouts/${name}Layout.jsx`)
    const user = { role, full_name: 'Test User', school: role === 'system_admin' ? null : { id: 1, name: 'Mlimani <School>', code: 'SCH-1' } }
    const html = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] }, createElement(ThemeContext.Provider, { value: { theme: 'dark', toggleTheme() {} } }, createElement(AuthContext.Provider, { value: { user } }, createElement(Layout, null, 'Content')))))
    assert.ok(html.includes('SIMS'), name)
    assert.ok(html.includes(role === 'system_admin' ? 'All schools' : 'Mlimani &lt;School&gt;'), name)
    assert.ok(!html.includes('Mlimani <School>'), name)
  }
})
