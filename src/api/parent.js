import api from './axios'

export function getChildren() {
  return api.get('/parent/children').then((response) => response.data.data)
}

export function getChild(id) {
  return api.get(`/parent/children/${id}`).then((response) => response.data.data)
}

export function getChildResults(id, params = {}) {
  return api.get(`/parent/children/${id}/results`, { params }).then((response) => response.data.data)
}

export function getChildAttendance(id, params = {}) {
  return api.get(`/parent/children/${id}/attendance`, { params }).then((response) => response.data.data)
}
