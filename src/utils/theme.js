export const THEME_KEY = 'sims_theme'
export const THEMES = ['light', 'dark']

export function resolveTheme(stored, prefersDark = false) {
  return THEMES.includes(stored) ? stored : prefersDark ? 'dark' : 'light'
}
