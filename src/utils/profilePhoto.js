export const PROFILE_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const PROFILE_PHOTO_MAX_BYTES = 2 * 1024 * 1024

export function validateProfilePhoto(file) {
  if (!PROFILE_PHOTO_TYPES.includes(file.type)) return 'Choose a JPG, PNG or WebP image.'
  if (file.size > PROFILE_PHOTO_MAX_BYTES) return 'The photo must be 2 MB or smaller.'
  return null
}

export function profilePhotoUrl(value, backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000') {
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  return `${backendUrl.replace(/\/$/, '')}/${value.replace(/^\//, '')}`
}
