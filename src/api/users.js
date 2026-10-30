import api from './axios'

export function listUsers(params = {}) {
  return api.get('/admin/users', { params }).then((response) => response.data)
}

export function createUser(data) {
  return api.post('/admin/users', data).then((response) => response.data.data)
}

export function updateUser(id, data) {
  return api.put(`/admin/users/${id}`, data).then((response) => response.data.data)
}

export function deleteUser(id) {
  return api.delete(`/admin/users/${id}`)
}

export function toggleUserActive(id) {
  return api.patch(`/admin/users/${id}/toggle-active`).then((response) => response.data.data)
}

export function resetUserPassword(id, password) {
  return api.post(`/admin/users/${id}/reset-password`, { password }).then((response) => response.data)
}
