import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { FiMoon, FiSun } from 'react-icons/fi'
import { useTheme } from '../../hooks/useTheme'

export function ThemeToggle({ className = '' }) {
  useLanguage()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted ${className}`}
      aria-label={isDark ? t("Switch to light theme") : t("Switch to dark theme")}
      title={isDark ? t("Light theme") : t("Dark theme")}
      aria-pressed={isDark}
    >
      {isDark ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
      <span className="hidden sm:inline">{isDark ? t("Light mode") : t("Dark mode")}</span>
    </button>
  )
}
