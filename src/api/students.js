// src/api/students.js
import api from './axios'

// Helper ya ndani: parent anatumia 'children', wengine wanatumia 'students'
function studentSegment(prefix) {
  return prefix === 'parent' ? 'children' : 'students'
}

export function listStudents(params = {}) {
  return api.get('/admin/students', { params }).then((response) => response.data)
}

export function listStudentsFor(prefix, params = {}) {
  return api.get(`/${prefix}/${studentSegment(prefix)}`, { params }).then((response) => response.data)
}

export function getStudent(id) {
  return api.get(`/admin/students/${id}`).then((response) => response.data.data)
}

export function getStudentFor(prefix, id) {
  return api.get(`/${prefix}/${studentSegment(prefix)}/${id}`).then((response) => response.data.data)
}

function hasPhoto(data) {
  return data.photo instanceof File
}

function toFormData(data) {
  const form = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      form.append(key, value)
    }
  })

  return form
}

export function createStudent(data) {
  const payload = hasPhoto(data) ? toFormData(data) : data

  return api.post('/admin/students', payload).then((response) => response.data.data)
}

export function updateStudent(id, data) {
  if (hasPhoto(data)) {
    const form = toFormData(data)
    form.append('_method', 'PUT')

    return api.post(`/admin/students/${id}`, form).then((response) => response.data.data)
  }

  return api.put(`/admin/students/${id}`, data).then((response) => response.data.data)
}

export function deleteStudent(id) {
  return api.delete(`/admin/students/${id}`)
}

export function getStudentResults(prefix, id, params = {}) {
  return api
    .get(`/${prefix}/${studentSegment(prefix)}/${id}/results`, { params })
    .then((response) => response.data.data)
}

export function getStudentAttendance(prefix, id, params = {}) {
  return api
    .get(`/${prefix}/${studentSegment(prefix)}/${id}/attendance`, { params })
    .then((response) => response.data.data)
}