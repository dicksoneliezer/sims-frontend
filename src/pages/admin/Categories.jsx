import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { FiArrowRight } from 'react-icons/fi'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ADMIN_NAV_SECTIONS, getAdminDashboardPath, getAdminSection } from '../../utils/adminNavigation'
import Dashboard from '../Dashboard'
import { ProfileMenu } from '../../components/common/ProfileMenu'
import { LanguageSwitch } from '../../components/common/LanguageSwitch'
import { ThemeToggle } from '../../components/common/ThemeToggle'

export function AdminCategoryDashboard() {
  useLanguage()
  const location = useLocation()
  return getAdminSection(location) ? <Dashboard /> : <Navigate to="/admin" replace />
}

export default function Categories() {
  useLanguage()
  const { user } = useAuth()


  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:flex-nowrap sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">S</div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t("SIMS")}</p>
              <p className="text-xs text-muted-foreground">{t("Admin workspace")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
          <LanguageSwitch />
          <ThemeToggle />
          <ProfileMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:py-12">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{t("Welcome back, ")}{user.full_name?.split(' ')[0]}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("Choose a category to open your dashboard and its modules.")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ADMIN_NAV_SECTIONS.map((section) => (
            <Link key={section.id} to={getAdminDashboardPath(section)} className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex rounded-xl bg-primary-soft p-3 text-primary"><section.icon className="h-6 w-6" /></span>
                <FiArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-foreground">{t(section.label)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.items.map((item) => t(item.label)).join(', ')}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
