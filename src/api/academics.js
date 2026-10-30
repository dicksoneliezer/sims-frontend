import api from './axios'

export function listSubjects(params = {}, prefix = 'admin') {
  return api.get(`/${prefix}/subjects`, { params }).then((response) => response.data)
}

export function createSubject(data, prefix = 'admin') {
  return api.post(`/${prefix}/subjects`, data).then((response) => response.data.data)
}

export function updateSubject(id, data, prefix = 'admin') {
  return api.put(`/${prefix}/subjects/${id}`, data).then((response) => response.data.data)
}

export function deleteSubject(id, prefix = 'admin') {
  return api.delete(`/${prefix}/subjects/${id}`)
}

export function listClasses(params = {}, prefix = 'admin') {
  return api.get(`/${prefix}/classes`, { params }).then((response) => response.data)
}

export function createClass(data) {
  return api.post('/admin/classes', data).then((response) => response.data.data)
}

export function updateClass(id, data) {
  return api.put(`/admin/classes/${id}`, data).then((response) => response.data.data)
}

export function deleteClass(id) {
  return api.delete(`/admin/classes/${id}`)
}

export function listTeachers(params = {}) {
  return api.get('/admin/teachers', { params }).then((response) => response.data)
}

export function getTeacher(id) {
  return api.get(`/admin/teachers/${id}`).then((response) => response.data.data)
}

export function createTeacher(data) {
  return api.post('/admin/teachers', data).then((response) => response.data.data)
}

export function updateTeacher(id, data) {
  return api.put(`/admin/teachers/${id}`, data).then((response) => response.data.data)
}

export function deleteTeacher(id) {
  return api.delete(`/admin/teachers/${id}`)
}

export function assignTeacherClass(data) {
  return api.post('/admin/teacher-classes', data).then((response) => response.data.data)
}

export function removeTeacherClass(id) {
  return api.delete(`/admin/teacher-classes/${id}`)
}

export function assignTeacherSubject(data) {
  return api.post('/admin/teacher-subjects', data).then((response) => response.data.data)
}

export function removeTeacherSubject(id) {
  return api.delete(`/admin/teacher-subjects/${id}`)
}

export function listTimetables(prefix = 'admin', params = {}) {
  return api.get(`/${prefix}/timetable`, { params }).then((response) => response.data)
}

export function listMasterTimetable(params = {}) {
  return api.get('/admin/timetables', { params }).then((response) => response.data)
}

export function createTimetable(data) {
  return api.post('/admin/timetables', data).then((response) => response.data.data)
}

export function updateTimetable(id, data) {
  return api.put(`/admin/timetables/${id}`, data).then((response) => response.data.data)
}

export function deleteTimetable(id) {
  return api.delete(`/admin/timetables/${id}`)
}

export function getChildTimetable(studentId, params = {}) {
  return api
    .get(`/parent/children/${studentId}/timetable`, { params })
    .then((response) => response.data)
}

export function listChildren() {
  return api.get('/parent/children').then((response) => response.data)
}
