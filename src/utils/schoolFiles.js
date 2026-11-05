// Only send account credentials to this application's protected file endpoints.
export function isSchoolFileUrl(value, apiBase, origin = 'http://localhost') {
  if (!value) return false
  try {
    const base = new URL(apiBase, origin)
    const file = new URL(value, origin)
    return file.origin === base.origin && file.pathname.startsWith(`${base.pathname.replace(/\/$/, '')}/school-files/`)
  } catch {
    return false
  }
}
