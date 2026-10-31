import { getLanguage } from './i18n'

export function formatMoney(value) {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0))
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-TZ').format(Number(value ?? 0))
}

export function formatDate(value, fallback = '—') {
  if (!value) return fallback

  return new Intl.DateTimeFormat(getLanguage() === 'sw' ? 'sw-TZ' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export const STATUS_STYLES = {
  unpaid: 'bg-warning-soft text-warning',
  partial: 'bg-primary-soft text-primary',
  paid: 'bg-success-soft text-success',
  pending: 'bg-warning-soft text-warning',
  completed: 'bg-success-soft text-success',
  cancelled: 'bg-muted text-muted-foreground',
}

export function statusClass(status) {
  return STATUS_STYLES[status] ?? 'bg-muted text-muted-foreground'
}
