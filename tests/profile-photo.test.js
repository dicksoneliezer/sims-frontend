import './jsx-loader.js'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const { validateProfilePhoto, profilePhotoUrl, PROFILE_PHOTO_MAX_BYTES } = await import('../src/utils/profilePhoto.js')
const { ProfilePhotoCard } = await import('../src/components/common/ProfilePhotoCard.jsx')
const { AuthContext } = await import('../src/context/auth-context.js')

test('photo validation matches the existing server formats and 2 MB limit', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
    assert.equal(validateProfilePhoto({ type, size: PROFILE_PHOTO_MAX_BYTES }), null)
  }
  assert.equal(validateProfilePhoto({ type: 'application/pdf', size: 100 }), 'Choose a JPG, PNG or WebP image.')
  assert.equal(validateProfilePhoto({ type: 'image/svg+xml', size: 100 }), 'Choose a JPG, PNG or WebP image.')
  assert.equal(validateProfilePhoto({ type: 'image/png', size: PROFILE_PHOTO_MAX_BYTES + 1 }), 'The photo must be 2 MB or smaller.')
})

test('saved photo paths resolve without changing already absolute URLs', () => {
  assert.equal(profilePhotoUrl(null), null)
  assert.equal(profilePhotoUrl('/storage/avatars/a.jpg', 'https://school.example/'), 'https://school.example/storage/avatars/a.jpg')
  assert.equal(profilePhotoUrl('storage/avatars/a.jpg', 'https://school.example'), 'https://school.example/storage/avatars/a.jpg')
  assert.equal(profilePhotoUrl('https://images.example/a.jpg'), 'https://images.example/a.jpg')
})

test('every role profile includes its own photo control and displays the saved account picture', async () => {
  for (const [folder, role] of [
    ['teacher', 'teacher'], ['academic', 'academic_teacher'], ['accountant', 'accountant'],
    ['parent', 'parent'], ['matron', 'matron'], ['storekeeper', 'store_keeper'],
    ['system', 'system_admin'], ['student', 'student'],
  ]) {
    const source = await readFile(new URL(`../src/pages/${folder}/Profile.jsx`, import.meta.url), 'utf8')
    assert.ok(source.includes('<ProfilePhotoCard'), folder)
    const html = renderToStaticMarkup(createElement(AuthContext.Provider, {
      value: { user: { role, full_name: 'Amina Hassan', profile_pic_url: '/storage/avatars/amina.jpg' }, updateUser() {} },
    }, createElement(ProfilePhotoCard)))
    assert.ok(html.includes('src="http://localhost:8000/storage/avatars/amina.jpg"'), role)
    assert.ok(html.includes('Change photo'), role)
    assert.ok(html.includes('accept="image/jpeg,image/png,image/webp"'), role)
    assert.ok(html.includes('type="button"'), role)
  }
})

test('avatar uploads send only the photo to the existing authenticated endpoint', async () => {
  const { default: api } = await import('../src/api/axios.js')
  const { uploadAvatar } = await import('../src/api/profile.js')
  const originalAdapter = api.defaults.adapter
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => 'test-token' } })
  const response = { profile_pic: 'avatars/new.webp', profile_pic_url: '/storage/avatars/new.webp' }
  let requests = 0
  api.defaults.adapter = async (config) => {
    requests++
    assert.equal(config.method, 'post')
    assert.equal(config.url, '/profile/avatar')
    assert.equal(config.headers.Authorization, 'Bearer test-token')
    assert.ok(config.data instanceof FormData)
    assert.deepEqual([...config.data.keys()], ['avatar'])
    assert.equal(config.data.get('avatar').name, 'photo.webp')
    assert.equal(config.data.get('avatar').type, 'image/webp')
    return { data: { data: response }, status: 200, statusText: 'OK', headers: {}, config }
  }
  try {
    assert.deepEqual(await uploadAvatar(new File([new Uint8Array([1, 2, 3])], 'photo.webp', { type: 'image/webp' })), response)
    assert.equal(requests, 1)
  } finally {
    api.defaults.adapter = originalAdapter
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage)
    else delete globalThis.localStorage
  }
})
