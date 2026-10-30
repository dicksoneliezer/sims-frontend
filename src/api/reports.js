import api from './axios'

export function getAdminReportOverview(params = {}) {
  return api.get('/admin/reports/overview', { params }).then((response) => response.data.data)
}
