import { useSyncExternalStore } from 'react'
import { getLanguage, setLanguage, subscribeLanguage, t } from '../utils/i18n'

export function useLanguage() {
  const language = useSyncExternalStore(subscribeLanguage, getLanguage, getLanguage)
  return { language, setLanguage, t }
}
