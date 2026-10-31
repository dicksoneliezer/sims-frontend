import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useState } from 'react'
import { FiTrash2, FiRefreshCw, FiDatabase, FiSettings, FiFileText, FiLayers } from 'react-icons/fi'
import { toast } from 'react-toastify'

const INITIAL_CACHES = [
  {
    id: 'config',
    name: 'Configuration Cache',
    description: 'Cached configuration files (config:cache).',
    icon: FiSettings,
    size: '124 KB',
    entries: 42,
  },
  {
    id: 'route',
    name: 'Route Cache',
    description: 'Cached route definitions (route:cache).',
    icon: FiLayers,
    size: '86 KB',
    entries: 124,
  },
  {
    id: 'view',
    name: 'View Cache',
    description: 'Compiled Blade views (view:cache).',
    icon: FiFileText,
    size: '512 KB',
    entries: 230,
  },
  {
    id: 'application',
    name: 'Application Cache',
    description: 'General application cache (cache:clear).',
    icon: FiDatabase,
    size: '2.4 MB',
    entries: 1024,
  },
]

export default function SystemAdminCache() {
  useLanguage()
  const [caches, setCaches] = useState(INITIAL_CACHES)
  const [clearing, setClearing] = useState(null)

  const handleClear = (cacheId) => {
    setClearing(cacheId)

    setTimeout(() => {
      setCaches((current) =>
        current.map((cache) =>
          cache.id === cacheId ? { ...cache, size: '0 KB', entries: 0 } : cache
        )
      )
      setClearing(null)
      toast.success(t("Cache cleared successfully"))
    }, 500)
  }

  const handleClearAll = () => {
    if (!window.confirm(t("Clear all caches? This may temporarily slow down the application."))) return

    setClearing('all')

    setTimeout(() => {
      setCaches((current) => current.map((cache) => ({ ...cache, size: '0 KB', entries: 0 })))
      setClearing(null)
      toast.success(t("All caches cleared successfully"))
    }, 800)
  }

  const handleRefresh = () => {
    setCaches(INITIAL_CACHES)
    toast.success(t("Cache status refreshed"))
  }

  const totalSize = caches.reduce((sum, cache) => {
    const size = parseFloat(cache.size)
    if (cache.size.includes('MB')) return sum + size * 1024
    return sum + size
  }, 0)

  const totalEntries = caches.reduce((sum, cache) => sum + cache.entries, 0)

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiTrash2 className="h-5 w-5 text-primary" />{t(" Cache Management")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Clear cache and manage application performance.")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <FiRefreshCw className="h-4 w-4" />{t(" Refresh")}</button>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={clearing === 'all'}
            className="flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            <FiTrash2 className="h-4 w-4" /> {clearing === 'all' ? t("Clearing...") : t("Clear All Caches")}
          </button>
        </div>
      </section>

      <section className="grid gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("Total Cache Size")}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {totalSize >= 1024 ? t("{0} MB", [(totalSize / 1024).toFixed(2)]) : t("{0} KB", [totalSize.toFixed(0)])}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("Total Entries")}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{totalEntries.toLocaleString()}</p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {caches.map((cache) => {
          const Icon = cache.icon
          const isEmpty = cache.entries === 0

          return (
            <article
              key={cache.id}
              className="rounded-xl border border-border bg-surface p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg ${isEmpty ? 'bg-muted text-muted-foreground' : 'bg-primary-soft text-primary'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{t(cache.name)}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t(cache.description)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">{t("Size")}</p>
                  <p className="mt-0.5 font-semibold text-foreground">{cache.size}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("Entries")}</p>
                  <p className="mt-0.5 font-semibold text-foreground">{cache.entries.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleClear(cache.id)}
                  disabled={clearing === cache.id || isEmpty}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40"
                >
                  <FiTrash2 className="h-3.5 w-3.5" />
                  {clearing === cache.id ? t("Clearing...") : isEmpty ? t("Empty") : t("Clear")}
                </button>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}
