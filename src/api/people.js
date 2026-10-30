import api from './axios'

export function listParents(params = {}) {
  return api.get('/admin/parents', { params }).then((response) => response.data)
}

export function getParent(id) {
  return api.get(`/admin/parents/${id}`).then((response) => response.data.data)
}

export function createParent(data) {
  return api.post('/admin/parents', data).then((response) => response.data.data)
}

export function updateParent(id, data) {
  return api.put(`/admin/parents/${id}`, data).then((response) => response.data.data)
}

export function deleteParent(id) {
  return api.delete(`/admin/parents/${id}`)
}

export function listAccountants(params = {}) {
  return api.get('/admin/accountants', { params }).then((response) => response.data)
}

export function getAccountant(id) {
  return api.get(`/admin/accountants/${id}`).then((response) => response.data.data)
}

export function createAccountant(data) {
  return api.post('/admin/accountants', data).then((response) => response.data.data)
}

export function updateAccountant(id, data) {
  return api.put(`/admin/accountants/${id}`, data).then((response) => response.data.data)
}

export function deleteAccountant(id) {
  return api.delete(`/admin/accountants/${id}`)
}
