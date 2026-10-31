import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiArrowRight, FiCheckCircle, FiLock, FiUser } from 'react-icons/fi'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { LanguageSwitch } from '../../components/common/LanguageSwitch'
import { ThemeToggle } from '../../components/common/ThemeToggle'
import { useAuth } from '../../hooks/useAuth'
import { getHomePath, ROLE_LABELS } from '../../utils/constants'

const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin123', role: 'super_admin' },
  { username: 'sysadmin', password: 'sysadmin123', role: 'system_admin' },
  { username: 'academic', password: 'academic123', role: 'academic_teacher' },
  { username: 'teacher', password: 'teacher123', role: 'teacher' },
  { username: 'accountant', password: 'accountant123', role: 'accountant' },
  { username: 'storekeeper', password: 'store123', role: 'store_keeper' },
  { username: 'matron', password: 'matron123', role: 'matron' },
  { username: 'student', password: 'student123', role: 'student' },
  { username: 'parent', password: 'parent123', role: 'parent' },
]

const FEATURES = [
  'Students, teachers and parents in one place',
  'Finance, invoices, payments and control numbers',
  'Attendance, exams, results and timetables',
  'Assets, inventory and boarding management',
]

export default function Login() {
  useLanguage()
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { username: '', password: '' } })

  if (isAuthenticated) {
    return <Navigate to={getHomePath(user.role)} replace />
  }

  const onSubmit = async (values) => {
    setServerError('')

    try {
      const loggedIn = await login(values.username.trim(), values.password)
      toast.success(t("Welcome back, {0}", [loggedIn.full_name]))
      navigate(getHomePath(loggedIn.role), { replace: true })
    } catch (error) {
      const data = error.response?.data
      const validationMessage = data?.errors ? Object.values(data.errors)[0]?.[0] : null
      const message = validationMessage ?? data?.message ?? 'Unable to sign in. Please try again.'
      setServerError(message)
    }
  }

  const fillDemo = (account) => {
    setValue('username', account.username)
    setValue('password', account.password)
    setServerError('')
  }

  return (
    <div className="grid min-h-screen bg-surface lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#0B1F4A] p-12 text-brand-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-brand-foreground/10 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-lg font-bold text-foreground">
              S
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em]">{t("SIMS")}</p>
              <p className="text-xs text-brand-muted">{t("Student Information Management System")}</p>
            </div>
          </div>

          <h2 className="mt-16 max-w-md text-4xl font-semibold leading-tight">{t("One platform for the whole school.")}</h2>
          <p className="mt-4 max-w-md text-brand-muted">{t("Manage academics, finance, attendance, inventory and parent communication from a single secure dashboard.")}</p>

          <ul className="mt-10 space-y-4">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-brand-foreground">
                <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-foreground" />
                {t(feature)}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-brand-muted">{t("SIMS v1.0 &middot; Laravel API + React SPA")}</p>
      </section>

      <section className="relative flex items-center justify-center bg-surface px-4 pb-10 pt-20 sm:px-8">
        <div className="absolute right-4 top-4 flex items-center gap-2"><LanguageSwitch /><ThemeToggle /></div>
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
              S
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-foreground">{t("SIMS")}</p>
              <p className="text-xs text-muted-foreground">{t("Student Information Management System")}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0_12px_40px_rgba(11,31,74,0.08)] sm:p-8">
            <h1 className="text-2xl font-semibold text-foreground">{t("Sign in")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("Use your school account to access the system.")}</p>

            {serverError && (
              <div role="alert" className="mt-5 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
                {t(serverError)}
              </div>
            )}

            <form className="mt-5 space-y-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div>
                <label htmlFor="username" className="text-sm font-medium text-foreground">{t("Username")}</label>
                <div className="relative mt-1">
                  <FiUser className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    aria-invalid={Boolean(errors.username)}
                    aria-describedby={errors.username ? 'username-error' : undefined}
                    className="w-full rounded-md border border-border bg-surface py-1.5 pl-8 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring/20"
                    placeholder={t("e.g. admin")}
                    {...register('username', { required: t("Username is required.") })}
                  />
                </div>
                {errors.username && (
                  <p id="username-error" role="alert" className="mt-1 text-xs text-danger">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium text-foreground">{t("Password")}</label>
                <div className="relative mt-1">
                  <FiLock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    className="w-full rounded-md border border-border bg-surface py-1.5 pl-8 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring/20"
                    placeholder={t("Enter your password")}
                    {...register('password', { required: t("Password is required.") })}
                  />
                </div>
                {errors.password && (
                  <p id="password-error" role="alert" className="mt-1 text-xs text-danger">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? t("Signing in...") : t("Sign in")}
                {!isSubmitting && <FiArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-6 border-t border-border pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Demo accounts")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.username}
                    type="button"
                    onClick={() => fillDemo(account)}
                    className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
                    title={t("Fill {0} credentials", [account.username])}
                  >
                    {t(ROLE_LABELS[account.role])}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
