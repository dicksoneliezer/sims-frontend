import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isSchoolFileUrl } from '../src/utils/schoolFiles.js'

test('protected files only receive credentials on the configured API origin and path', () => {
  const base = 'http://localhost:8000/api/v1'
  assert.equal(isSchoolFileUrl(`${base}/school-files/avatars/1`, base), true)
  assert.equal(isSchoolFileUrl('/api/v1/school-files/students/2/photo', base, 'http://localhost:8000'), true)
  for (const value of ['https://other.school/api/v1/school-files/avatars/1', 'http://localhost:8001/api/v1/school-files/avatars/1', `${base}/school-files-evil/1`, `${base}/school-files/../../auth/me`, 'data:image/png;base64,a', null]) {
    assert.equal(isSchoolFileUrl(value, base), false, value)
  }
})
