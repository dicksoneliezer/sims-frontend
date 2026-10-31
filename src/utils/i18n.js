import sw from '../locales/sw.json' with { type: 'json' }

export const LANGUAGE_KEY = 'sims_language'
export const LANGUAGES = ['en', 'sw']
const normalizedSw = Object.fromEntries(Object.entries(sw).map(([key, value]) => [key.toLowerCase(), value]))
export function resolveLanguage(value) { return LANGUAGES.includes(value) ? value : 'en' }

let language = 'en'
try { if (typeof window !== 'undefined') language = resolveLanguage(localStorage.getItem(LANGUAGE_KEY)) } catch { /* English is the default. */ }
const listeners = new Set()
export const getLanguage = () => language
export const subscribeLanguage = (listener) => { listeners.add(listener); return () => listeners.delete(listener) }

export function setLanguage(next) {
  if (!LANGUAGES.includes(next)) return
  language = next
  try { localStorage.setItem(LANGUAGE_KEY, next) } catch { /* Selection still works for this session. */ }
  if (typeof document !== 'undefined') document.documentElement.lang = next
  listeners.forEach((listener) => listener())
}

export function translate(text, valuesOrLanguage, selected = language) {
  if (typeof text !== 'string') return text
  const values = Array.isArray(valuesOrLanguage) ? valuesOrLanguage : []
  if (typeof valuesOrLanguage === 'string') selected = valuesOrLanguage
  const key = text.replace(/\s+/g, ' ').trim()
  const normalizedKey = key.replaceAll('_', ' ').toLowerCase()
  const translated = Object.hasOwn(sw, key) ? sw[key] : Object.hasOwn(normalizedSw, normalizedKey) ? normalizedSw[normalizedKey] : null
  const localized = selected === 'sw' && translated !== null
    ? text.replace(/\S[\s\S]*\S|\S/, () => translated) : text
  return localized.replace(/\{(\d+)\}/g, (match, index) => index < values.length ? String(values[index] ?? '') : match)
    .replace(/&(amp|lt|gt|quot|apos|nbsp|middot);/g, (_, entity) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', middot: '·' })[entity])
}
export const t = translate

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === LANGUAGE_KEY) {
      language = resolveLanguage(event.newValue)
      document.documentElement.lang = language
      listeners.forEach((listener) => listener())
    }
  })
}
