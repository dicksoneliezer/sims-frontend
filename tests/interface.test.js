import './jsx-loader.js'
import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import { resolveTheme } from '../src/utils/theme.js'
import { getLanguage, setLanguage, translate } from '../src/utils/i18n.js'
import { logoutToLogin } from '../src/utils/account.js'

const { AuthContext } = await import('../src/context/auth-context.js')
const { ThemeContext } = await import('../src/context/theme-context.js')
const { AppLayout } = await import('../src/components/layouts/AppLayout.jsx')

function render(Component, role, path, theme = 'light', account = {}) {
  return renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] },
    createElement(ThemeContext.Provider, { value: { theme, toggleTheme() {} } },
      createElement(AuthContext.Provider, { value: { user: { role, full_name: 'Test User', ...account }, logout() {} } },
        createElement(Component, null, createElement('p', null, 'Page content')),
      ),
    ),
  ))
}

test('saved preference wins over the device theme, and new users follow their device', () => {
  assert.equal(resolveTheme('light', true), 'light')
  assert.equal(resolveTheme('dark', false), 'dark')
  assert.equal(resolveTheme(null, true), 'dark')
  assert.equal(resolveTheme('invalid', false), 'light')
})

test('all nine portal layouts expose light/dark controls, navigation and content access', async () => {
  const portals = [
    ['Academic', 'academic_teacher', '/academic/exams', 'Manage Exams'],
    ['Accountant', 'accountant', '/accountant/invoices', 'Invoices'],
    ['Teacher', 'teacher', '/teacher/marks', 'Enter Marks'],
    ['Student', 'student', '/student/notes', 'My Notes'],
    ['Parent', 'parent', '/parent/payments', 'Payments'],
    ['Matron', 'matron', '/matron/incidents', 'Incidents'],
    ['System', 'system_admin', '/system/logs', 'System Logs'],
    ['StoreKeeper', 'store_keeper', '/storekeeper/inventory', 'Inventory Items'],
  ]
  for (const [name, role, path, pageTitle] of portals) {
    const module = await import(`../src/components/layouts/${name}Layout.jsx`)
    for (const theme of ['light', 'dark']) {
      const html = render(module[`${name}Layout`], role, path, theme)
      assert.ok(html.includes(`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`), name)
      assert.ok(html.includes('Skip to content'), name)
      assert.ok(html.includes('id="main-content"'), name)
      assert.ok(html.includes('Page content'), name)
      assert.match(html, new RegExp(`<h1[^>]*>${pageTitle}</h1>`), name)
    }
  }
  assert.ok(render(AppLayout, 'super_admin', '/admin/dashboard?category=academics').includes('Switch to dark theme'))
})

test('startup applies the theme before rendering, even when local storage is blocked', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]
  for (const [stored, dark, expected, blocked] of [
    ['light', true, 'light'], ['dark', false, 'dark'], [null, true, 'dark'], [null, true, 'dark', true],
  ]) {
    let applied
    runInNewContext(script, {
      localStorage: { getItem() { if (blocked) throw new Error('Storage blocked'); return stored } },
      window: { matchMedia: () => ({ matches: dark }) },
      document: { documentElement: { setAttribute(name, value) { if (name === 'data-theme') applied = value } } },
    })
    assert.equal(applied, expected)
  }
})

test('admin category isolation survives the shared layout improvements', () => {
  const html = render(AppLayout, 'super_admin', '/admin/subjects', 'dark')
  assert.ok(html.includes('href="/admin/timetables"'))
  assert.ok(html.includes('All categories'))
  assert.ok(!html.includes('href="/admin/finance"'))
  assert.ok(!html.includes('href="/admin/users"'))
  assert.ok(html.includes('href="/profile?category=academics"'))
})

test('modal exposes a named dialog and describes its purpose', async () => {
  const { Modal } = await import('../src/components/common/Modal.jsx')
  const html = renderToStaticMarkup(createElement(Modal, { title: 'Add student', description: 'Student details', onClose() {} }, 'Form fields'))
  assert.ok(html.includes('role="dialog"'))
  assert.ok(html.includes('aria-modal="true"'))
  assert.ok(html.includes('aria-labelledby='))
  assert.ok(html.includes('aria-describedby='))
  assert.ok(html.includes('Form fields'))
})

test('every lazy page imports successfully and exposes the routed component', async () => {
  const routesUrl = new URL('../src/routes/AppRoutes.jsx', import.meta.url)
  const source = await readFile(routesUrl, 'utf8')
  const paths = new Set([...source.matchAll(/lazy\(\(\) => import\('([^']+)'\)/g)].map((match) => match[1]))
  assert.ok(paths.size > 80, 'Pages should load on demand rather than all at startup')
  for (const path of paths) {
    const module = await import(new URL(`${path}.jsx`, routesUrl))
    assert.equal(typeof module.default, 'function', path)
  }
})

test('Swahili dictionary covers the extracted interface and preserves all interpolation values', async () => {
  const source = JSON.parse(await readFile(new URL('../src/locales/source-strings.json', import.meta.url), 'utf8'))
  const sw = JSON.parse(await readFile(new URL('../src/locales/sw.json', import.meta.url), 'utf8'))
  for (const key of source) {
    assert.ok(Object.hasOwn(sw, key), `Missing translation: ${key}`)
    assert.deepEqual([...key.matchAll(/\{\d+\}/g)].map((match) => match[0]).sort(), [...sw[key].matchAll(/\{\d+\}/g)].map((match) => match[0]).sort(), key)
  }
  assert.equal(translate('Welcome back, {0}', ['Amina $&'], 'sw'), 'Karibu tena, Amina $&')
  assert.equal(translate('Delete {0}?', ['Juma'], 'en'), 'Delete Juma?')
  assert.equal(translate('Amina Hassan', 'sw'), 'Amina Hassan')
  assert.equal(translate(5000, 'sw'), 5000)
})

test('chosen language persists through login UI, every portal and logout', async () => {
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const values = new Map()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { setItem: (key, value) => values.set(key, value), getItem: (key) => values.get(key) } })
  try {
    setLanguage('sw')
    assert.equal(values.get('sims_language'), 'sw')
    const { default: Login } = await import('../src/pages/auth/Login.jsx')
    const login = render(Login, 'super_admin', '/login')
    assert.ok(login.includes('Language / Lugha'))
    assert.ok(login.includes('Ingia'))
    assert.ok(login.includes('Jina la mtumiaji'))
    assert.ok(login.includes('Nenosiri'))
    assert.ok(login.includes('name="username"'))
    assert.ok(login.includes('name="password"'))
    for (const [name, role, path] of [
      ['Academic', 'academic_teacher', '/academic'], ['Accountant', 'accountant', '/accountant'],
      ['Teacher', 'teacher', '/teacher'], ['Student', 'student', '/student'],
      ['Parent', 'parent', '/parent'], ['Matron', 'matron', '/matron'],
      ['System', 'system_admin', '/system'], ['StoreKeeper', 'store_keeper', '/storekeeper'],
    ]) {
      const module = await import(`../src/components/layouts/${name}Layout.jsx`)
      const html = render(module[`${name}Layout`], role, path)
      assert.ok(html.includes('Wasifu wangu'), name)
      assert.ok(html.includes('Toka'), name)
      assert.ok(html.includes('Chaguo za akaunti'), name)
      assert.ok(html.includes('Language / Lugha'), name)
      const source = await readFile(new URL(`../src/components/layouts/${name}Layout.jsx`, import.meta.url), 'utf8')
      assert.ok(source.includes(`<ProfileMenu profilePath="${path}/profile"`), name)
      assert.ok(html.indexOf('Toka') > html.indexOf('Wasifu wangu'), name)
    }
    const admin = render(AppLayout, 'super_admin', '/admin/subjects')
    assert.ok(admin.includes('Taaluma'))
    assert.ok(admin.includes('Masomo'))
    assert.ok(admin.includes('Toka'))
    assert.ok(!admin.includes('href="/admin/finance"'))
    const calls = []
    await logoutToLogin(async () => { calls.push('logout') }, (path, options) => calls.push([path, options]))
    assert.deepEqual(calls, ['logout', ['/login', { replace: true }]])
    assert.equal(getLanguage(), 'sw')
    assert.equal(values.get('sims_language'), 'sw')
    setLanguage('invalid')
    assert.equal(getLanguage(), 'sw')
  } finally {
    setLanguage('en')
    if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage)
    else delete globalThis.localStorage
  }
})

test('account button displays the saved avatar and safely falls back when there is no photo', async () => {
  const { ProfileMenu } = await import('../src/components/common/ProfileMenu.jsx')
  const photo = render(ProfileMenu, 'super_admin', '/admin', 'light', { profile_pic_url: '/storage/photo.jpg' })
  assert.ok(photo.includes('src="http://localhost:8000/storage/photo.jpg"'))
  assert.ok(photo.includes('aria-label="Account options"'))
  assert.ok(!render(ProfileMenu, 'teacher', '/teacher').includes('<img'))
})

test('logout does not redirect before authentication cleanup completes', async () => {
  let complete
  const pending = new Promise((resolve) => { complete = resolve })
  const calls = []
  const logout = logoutToLogin(() => pending, (path) => calls.push(path))
  assert.deepEqual(calls, [])
  complete()
  await logout
  assert.deepEqual(calls, ['/login'])
})
