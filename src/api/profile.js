import api from './axios'

export function getProfile() {
  return api.get('/profile').then((response) => response.data.data)
}

export function updateProfile(data) {
  return api.put('/profile', data).then((response) => response.data.data)
}

export function uploadAvatar(file) {
  const form = new FormData()
  form.append('avatar', file)

  return api.post('/profile/avatar', form).then((response) => response.data.data)
}

export function changePassword(data) {
  return api.post('/profile/password', data).then((response) => response.data)
}