import { useEffect, useRef, useState } from 'react'
import { FiArrowRight, FiCheckCircle, FiGrid, FiLock, FiSearch } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { LanguageSwitch } from '../../components/common/LanguageSwitch'
import { ProfileMenu } from '../../components/common/ProfileMenu'
import { ThemeToggle } from '../../components/common/ThemeToggle'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { t } from '../../utils/i18n'

const buttonClass = 'min-h-11 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50'

export function SchoolCard({ school, onOpen, busy }) {
  const own = school.is_my_school
  return (
    <button type="button" disabled={busy} onClick={() => onOpen(school)} aria-label={t(own ? 'Open dashboard for {0}' : 'Check access to {0}', [school.name])}
      className={`group flex min-w-0 flex-col rounded-2xl border p-6 text-left shadow-sm transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60 ${own ? 'border-primary bg-primary-soft ring-1 ring-primary' : 'border-border bg-surface hover:border-primary/40'}`}>
      <div className="flex w-full flex-wrap items-start justify-between gap-3">
        <span className={`inline-flex rounded-xl p-3 ${own ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><FiGrid className="h-6 w-6" /></span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${own ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          {own ? <FiCheckCircle aria-hidden="true" /> : <FiLock aria-hidden="true" />}{t(own ? 'Your registered school' : 'No access')}
        </span>
      </div>
      <h2 className="mt-5 break-words text-lg font-semibold text-foreground">{school.name}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{school.code}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(own ? "Open your dashboard to view your child's information." : 'Your account is not registered with this school.')}</p>
      <span className={`mt-auto flex items-center justify-between gap-3 pt-6 text-sm font-semibold ${own ? 'text-primary' : 'text-muted-foreground'}`}>
        {t(own ? 'Open dashboard' : 'Check access')}<FiArrowRight aria-hidden="true" className="h-5 w-5" />
      </span>
    </button>
  )
}

export default function ParentSchools() {
  useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState({ key: null, result: { data: [], meta: {} }, failed: false })
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [opening, setOpening] = useState(false)
  const inFlight = useRef(false)
  const requestKey = JSON.stringify([page, search, version])
  const loading = loaded.key !== requestKey
  const { result, failed } = loaded
  useEffect(() => {
    const controller = new AbortController()
    api.get('/parent/schools', { params: { page, search }, signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setLoaded({ key: requestKey, result: data, failed: false }) })
      .catch(() => { if (!controller.signal.aborted) setLoaded({ key: requestKey, result: { data: [], meta: {} }, failed: true }) })
    return () => controller.abort()
  }, [page, search, requestKey])

  async function openSchool(school) {
    if (inFlight.current) return
    inFlight.current = true
    setOpening(true)
    try {
      await api.get(`/parent/schools/${school.id}`)
      navigate('/parent/dashboard')
    } catch (error) {
      toast.error(t(error.response?.status === 403 ? 'You have no access to this school.' : 'Unable to open school. Please try again.'))
    } finally {
      inFlight.current = false
      setOpening(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">{t('Skip to content')}</a>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">S</div><div><p className="text-sm font-semibold text-foreground">{t('SIMS')}</p><p className="text-xs text-muted-foreground">{t('Parent Portal')}</p></div></div>
          <div className="flex items-center gap-2"><LanguageSwitch /><ThemeToggle /><ProfileMenu profilePath="/parent/profile" /></div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:py-12">
        <div><h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{t('Welcome back, {0}', [user?.full_name?.split(' ')[0] ?? ''])}</h1><p className="mt-2 text-sm text-muted-foreground">{t('Choose your school to open your parent dashboard. Your registered school is highlighted.')}</p></div>
        <form className="flex flex-wrap gap-2" onSubmit={event => { event.preventDefault(); setPage(1); setSearch(query.trim()) }}>
          <input aria-label={t('Search schools')} placeholder={t('Search schools')} value={query} onChange={event => setQuery(event.target.value)} className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-foreground sm:w-80" />
          <button type="submit" className={`${buttonClass} inline-flex items-center gap-2`}><FiSearch />{t('Search')}</button>
        </form>
        {opening && <p role="status" className="text-sm text-muted-foreground">{t('Checking school access...')}</p>}
        {loading ? <div role="status" aria-label={t('Loading data')} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map(i => <div key={i} className="h-64 animate-pulse rounded-2xl border border-border bg-muted" />)}</div> : failed ? <div role="alert" className="rounded-xl border border-border bg-surface p-6"><p className="text-foreground">{t('Unable to load schools.')}</p><button type="button" className={`${buttonClass} mt-4`} onClick={() => setVersion(v => v + 1)}>{t('Try again')}</button></div> : <>
          <section aria-label={t('Schools')} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{result.data.map(school => <SchoolCard key={school.id} school={school} onOpen={openSchool} busy={opening} />)}</section>
          {!result.data.length && <p className="py-10 text-center text-muted-foreground">{t('No schools found.')}</p>}
          {(result.meta.last_page ?? 1) > 1 && <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"><span>{t('Page {0} of {1}', [result.meta.current_page, result.meta.last_page])}</span><div className="flex gap-2"><button className={buttonClass} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t('Previous')}</button><button className={buttonClass} disabled={page >= result.meta.last_page} onClick={() => setPage(p => p + 1)}>{t('Next')}</button></div></div>}
        </>}
      </main>
    </div>
  )
}
