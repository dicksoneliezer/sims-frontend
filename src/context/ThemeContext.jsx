import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './theme-context'
import { resolveTheme, THEME_KEY, THEMES } from '../utils/theme'

function readStoredTheme() {
  let stored
  try {
    stored = localStorage.getItem(THEME_KEY)
  } catch { /* Fall back to the device preference. */ }
  return resolveTheme(stored, window.matchMedia('(prefers-color-scheme: dark)').matches)
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme)

  useEffect(() => {
    applyTheme(theme)
    try { localStorage.setItem(THEME_KEY, theme) } catch { /* The switch still works when storage is unavailable. */ }
  }, [theme])

  useEffect(() => {
    const syncTheme = (event) => {
      if (event.key === THEME_KEY && THEMES.includes(event.newValue)) setThemeState(event.newValue)
    }
    window.addEventListener('storage', syncTheme)
    return () => window.removeEventListener('storage', syncTheme)
  }, [])

  const setTheme = useCallback((next) => {
    if (THEMES.includes(next)) {
      setThemeState(next)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, isDark: theme === 'dark' }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
