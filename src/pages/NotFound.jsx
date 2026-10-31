import { t } from '../utils/i18n'
import { useLanguage } from '../hooks/useLanguage'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../components/common/ThemeToggle'

export default function NotFound() {
  useLanguage()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 text-center">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-foreground">{t("Page not found")}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{t("The page you are looking for does not exist or you may not have access to it.")}</p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
      >{t("Back to dashboard")}</Link>
    </div>
  )
}
