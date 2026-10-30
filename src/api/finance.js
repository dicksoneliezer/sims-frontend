import api from './axios'

export function listInvoices(params = {}) {
  return api.get('/accountant/invoices', { params }).then((response) => response.data)
}

export function getInvoice(id) {
  return api.get(`/accountant/invoices/${id}`).then((response) => response.data.data)
}

export function createInvoice(data) {
  return api.post('/accountant/invoices', data).then((response) => response.data.data)
}

export function updateInvoice(id, data) {
  return api.put(`/accountant/invoices/${id}`, data).then((response) => response.data.data)
}

export function deleteInvoice(id) {
  return api.delete(`/accountant/invoices/${id}`)
}

export function generateInvoices(data) {
  return api.post('/accountant/invoices/generate', data).then((response) => response.data)
}

export function recordPayment(data) {
  return api.post('/accountant/payments', data).then((response) => response.data.data)
}

export function listTransactions(params = {}) {
  return api.get('/accountant/transactions', { params }).then((response) => response.data)
}

export function listExpenses(params = {}) {
  return api.get('/accountant/expenses', { params }).then((response) => response.data)
}

export function createExpense(data) {
  return api.post('/accountant/expenses', data).then((response) => response.data.data)
}

export function updateExpense(id, data) {
  return api.post(`/accountant/expenses/${id}`, data).then((response) => response.data.data)
}

export function deleteExpense(id) {
  return api.delete(`/accountant/expenses/${id}`)
}

export function listDebts(params = {}) {
  return api.get('/accountant/debts', { params }).then((response) => response.data)
}

export function listControlNumbers(params = {}) {
  return api.get('/accountant/control-numbers', { params }).then((response) => response.data)
}

export function generateControlNumber(data) {
  return api.post('/accountant/control-numbers', data).then((response) => response.data.data)
}

export function getFinancialReport(params = {}) {
  return api.get('/accountant/reports/financial', { params }).then((response) => response.data.data)
}

export function listFeeStructures(params = {}) {
  return api.get('/admin/fee-structure', { params }).then((response) => response.data)
}

export function getFeeStructure(id) {
  return api.get(`/admin/fee-structure/${id}`).then((response) => response.data.data)
}

export function createFeeStructure(data) {
  return api.post('/admin/fee-structure', data).then((response) => response.data.data)
}

export function updateFeeStructure(id, data) {
  return api.put(`/admin/fee-structure/${id}`, data).then((response) => response.data.data)
}

export function deleteFeeStructure(id) {
  return api.delete(`/admin/fee-structure/${id}`)
}

export function getStudentInvoices(prefix, studentId) {
  return api.get(`/${prefix}/students/${studentId}/invoices`).then((response) => response.data)
}

export function getStudentTransactions(prefix, studentId) {
  return api.get(`/${prefix}/students/${studentId}/transactions`).then((response) => response.data)
}

export function listParentPayments(params = {}) {
  return api.get('/parent/payments', { params }).then((response) => response.data)
}

export function getParentPayment(id) {
  return api.get(`/parent/payments/${id}`).then((response) => response.data.data)
}

export function generateParentControlNumber(data) {
  return api.post('/parent/payments/control-number', data).then((response) => response.data.data)
}

export function payParentPayment(id, data) {
  return api.post(`/parent/payments/${id}/pay`, data).then((response) => response.data.data)
}

export function cancelParentPayment(id) {
  return api.post(`/parent/payments/${id}/cancel`).then((response) => response.data.data)
}

export function listParentPaymentHistory(params = {}) {
  return api.get('/parent/payments/history', { params }).then((response) => response.data)
}

export function getParentBalance() {
  return api.get('/parent/payments/balance').then((response) => response.data.data)
}

export function getParentPaymentMethods() {
  return api.get('/parent/payments/methods').then((response) => response.data.data)
}

export function getPaymentStatus(controlNumber) {
  return api.get(`/parent/payments/status/${controlNumber}`).then((response) => response.data.data)
}

export function getPaymentReceipt(id) {
  return api.get(`/parent/payments/${id}/receipt`).then((response) => response.data.data)
}

export function listChildInvoices(studentId) {
  return api.get(`/parent/children/${studentId}/invoices`).then((response) => response.data)
}

export function listChildPayments(studentId) {
  return api.get(`/parent/children/${studentId}/payments`).then((response) => response.data)
}
