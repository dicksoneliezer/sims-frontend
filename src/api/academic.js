import api from './axios'

export function listExams(params = {}) {
  return api.get('/academic/exams', { params }).then((response) => response.data)
}

export function createExam(data) {
  return api.post('/academic/exams', data).then((response) => response.data.data)
}

export function updateExam(id, data) {
  return api.put(`/academic/exams/${id}`, data).then((response) => response.data.data)
}

export function deleteExam(id) {
  return api.delete(`/academic/exams/${id}`)
}

export function getExamResults(id, params = {}) {
  return api.get(`/academic/exams/${id}/results`, { params }).then((response) => response.data)
}

export function listResults(params = {}) {
  return api.get('/academic/results', { params }).then((response) => response.data)
}

export function createResult(data) {
  return api.post('/academic/results', data).then((response) => response.data.data)
}

export function updateResult(id, data) {
  return api.put(`/academic/results/${id}`, data).then((response) => response.data.data)
}

export function deleteResult(id) {
  return api.delete(`/academic/results/${id}`)
}

export function getResultsAnalysis(params = {}) {
  return api.get('/academic/results-analysis', { params }).then((response) => response.data)
}

export function getStudentProgress(studentId) {
  return api.get(`/academic/student-progress/${studentId}`).then((response) => response.data.data)
}

export function listSyllabus(params = {}) {
  return api.get('/academic/syllabus', { params }).then((response) => response.data)
}

export function createSyllabusTopic(data) {
  return api.post('/academic/syllabus', data).then((response) => response.data.data)
}

export function updateSyllabusTopic(id, data) {
  return api.put(`/academic/syllabus/${id}`, data).then((response) => response.data.data)
}

export function deleteSyllabusTopic(id) {
  return api.delete(`/academic/syllabus/${id}`)
}

export function listSyllabusProgress(params = {}) {
  return api.get('/academic/syllabus-progress', { params }).then((response) => response.data)
}

export function saveSyllabusProgress(data) {
  return api.post('/academic/syllabus-progress', data).then((response) => response.data.data)
}