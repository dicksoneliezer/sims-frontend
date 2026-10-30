import api from './axios'

export function getAdminFinanceOverview() {
  return api.get('/admin/finance/overview').then((response) => response.data.data)
}

export function listAdminInvoices(params = {}) {
  return api.get('/admin/finance/invoices', { params }).then((response) => response.data)
}

export function listAdminTransactions(params = {}) {
  return api.get('/admin/finance/transactions', { params }).then((response) => response.data)
}

export function listAdminExpenses(params = {}) {
  return api.get('/admin/finance/expenses', { params }).then((response) => response.data)
}

export function listAdminDebts(params = {}) {
  return api.get('/admin/finance/debts', { params }).then((response) => response.data)
}
