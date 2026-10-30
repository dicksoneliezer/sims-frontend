import api from './axios'

export function getSchoolSettings() {
  return api.get('/admin/settings/school').then((response) => response.data.data)
}

export function updateSchoolSettings(data) {
  return api.put('/admin/settings/school', data).then((response) => response.data.data)
}

export function listGrades() {
  return api.get('/admin/settings/grading').then((response) => response.data.data)
}

export function createGrade(data) {
  return api.post('/admin/settings/grading', data).then((response) => response.data.data)
}

export function updateGrade(id, data) {
  return api.put(`/admin/settings/grading/${id}`, data).then((response) => response.data.data)
}

export function deleteGrade(id) {
  return api.delete(`/admin/settings/grading/${id}`)
}

export function listCalendarEvents(params = {}) {
  return api.get('/admin/settings/calendar', { params }).then((response) => response.data)
}

export function createCalendarEvent(data) {
  return api.post('/admin/settings/calendar', data).then((response) => response.data.data)
}

export function updateCalendarEvent(id, data) {
  return api.put(`/admin/settings/calendar/${id}`, data).then((response) => response.data.data)
}

export function deleteCalendarEvent(id) {
  return api.delete(`/admin/settings/calendar/${id}`)
}
