import api from './axios'

export function getAttendance(params = {}) {
  return api.get('/teacher/attendance', { params }).then((response) => response.data)
}

export function saveAttendance(data) {
  return api.post('/teacher/attendance', data).then((response) => response.data)
}

export function getAttendanceReport(params = {}) {
  return api.get('/teacher/attendance/report', { params }).then((response) => response.data)
}

export function getMarks(params = {}) {
  return api.get('/teacher/marks', { params }).then((response) => response.data)
}

export function saveMarks(data) {
  return api.post('/teacher/marks', data).then((response) => response.data.data)
}

export function updateMark(id, data) {
  return api.put(`/teacher/marks/${id}`, data).then((response) => response.data.data)
}

export function deleteMark(id) {
  return api.delete(`/teacher/marks/${id}`)
}

export function getClassResults(params = {}) {
  return api.get('/teacher/class-results', { params }).then((response) => response.data.data)
}

export function getNotes(params = {}) {
  return api.get('/teacher/notes', { params }).then((response) => response.data)
}

export function createNote(data) {
  return api.post('/teacher/notes', data).then((response) => response.data.data)
}

export function updateNote(id, data) {
  return api.put(`/teacher/notes/${id}`, data).then((response) => response.data.data)
}

export function deleteNote(id) {
  return api.delete(`/teacher/notes/${id}`)
}

export function getBehaviorRecords(params = {}) {
  return api.get('/teacher/behavior', { params }).then((response) => response.data)
}

export function createBehaviorRecord(data) {
  return api.post('/teacher/behavior', data).then((response) => response.data.data)
}

export function updateBehaviorRecord(id, data) {
  return api.put(`/teacher/behavior/${id}`, data).then((response) => response.data.data)
}

export function deleteBehaviorRecord(id) {
  return api.delete(`/teacher/behavior/${id}`)
}