import api from './axios'

export function getOwnResults(params = {}) {
  return api.get('/student/results', { params }).then((response) => response.data.data)
}

export function getOwnAttendance(params = {}) {
  return api.get('/student/attendance', { params }).then((response) => response.data.data)
}

export function getOwnNotes() {
  return api.get('/student/notes').then((response) => response.data.data)
}

export function markNoteRead(id) {
  return api.patch(`/student/notes/${id}/read`).then((response) => response.data.data)
}

export function getChildNotes(id) {
  return api.get(`/parent/children/${id}/notes`).then((response) => response.data.data)
}