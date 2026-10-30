import api from './axios'

export function getInventoryOverview() {
  return api.get('/admin/inventory/overview').then((response) => response.data.data)
}

export function listAssets(params = {}) {
  return api.get('/admin/inventory/assets', { params }).then((response) => response.data)
}

export function listInventoryItems(params = {}) {
  return api.get('/admin/inventory/items', { params }).then((response) => response.data)
}

export function listStockTransactions(params = {}) {
  return api.get('/admin/inventory/stock', { params }).then((response) => response.data)
}

export function listStockAlerts(params = {}) {
  return api.get('/admin/inventory/alerts', { params }).then((response) => response.data)
}

export function listAssetMaintenance(params = {}) {
  return api.get('/admin/inventory/maintenance', { params }).then((response) => response.data)
}
