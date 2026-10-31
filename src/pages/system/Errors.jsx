import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useMemo, useState } from 'react'
import { FiAlertCircle, FiRefreshCw, FiTrash2, FiSearch, FiEye } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { Modal } from '../../components/common/Modal'

const STORAGE_KEY = 'system_errors'

const SAMPLE_ERRORS = [
  {
    id: 1,
    level: 'critical',
    message: 'SQLSTATE[42S02]: Base table or view not found: 1146 Table "sims.sick_bay" doesn\'t exist',
    file: 'app/Http/Controllers/Api/V1/MatronController.php',
    line: 45,
    trace: 'MatronController.php:45\nMatronController.php:32\nRouter.php:1024',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 2,
    level: 'error',
    message: 'Call to undefined relationship [bed] on model [App\\Models\\BedAssignment]',
    file: 'vendor/laravel/framework/src/Illuminate/Database/Eloquent/Model.php',
    line: 1534,
    trace: 'Model.php:1534\nBedAssignment.php:28\nMatronController.php:58',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 3,
    level: 'warning',
    message: 'Undefined array key "search" in StudentsController',
    file: 'app/Http/Controllers/Api/V1/StudentController.php',
    line: 22,
    trace: 'StudentController.php:22\nRouter.php:1024',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 4,
    level: 'error',
    message: 'cURL error 28: Operation timed out after 30000 milliseconds',
    file: 'vendor/guzzlehttp/guzzle/src/Handler/CurlHandler.php',
    line: 134,
    trace: 'CurlHandler.php:134\nCurlMultiHandler.php:201\nClient.php:123',
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
]

function loadErrors() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : SAMPLE_ERRORS
  } catch {
    return SAMPLE_ERRORS
  }
}

function saveErrors(errors) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(errors))
}

const LEVEL_TONE = {
  warning: 'bg-warning-soft text-warning',
  error: 'bg-danger-soft text-danger',
  critical: 'bg-red-900 text-white',
}

export default function SystemAdminErrors() {
  useLanguage()
  const [errors, setErrors] = useState([])
  const [level, setLevel] = useState('')
  const [search, setSearch] = useState('')
  const [selectedError, setSelectedError] = useState(null)

  useEffect(() => {
    const initial = loadErrors()
    setErrors(initial)
    saveErrors(initial)
  }, [])

  const filtered = useMemo(() => {
    return errors.filter((error) => {
      if (level && error.level !== level) return false
      if (search && !`${error.message} ${error.file}`.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [errors, level, search])

  const handleClear = () => {
    if (!window.confirm(t("Clear all error logs?"))) return
    setErrors([])
    saveErrors([])
    toast.success(t("Error logs cleared"))
  }

  const handleRefresh = () => {
    const refreshed = loadErrors()
    setErrors(refreshed)
    toast.success(t("Error logs refreshed"))
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString()
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiAlertCircle className="h-5 w-5 text-primary" />{t(" Error Logs")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("View application errors and exceptions.")}</p>
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
            onClick={handleClear}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-danger hover:bg-danger-soft"
          >
            <FiTrash2 className="h-4 w-4" />{t(" Clear Errors")}</button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search errors by message or file")}
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">{t("All levels")}</option>
            <option value="warning">{t("Warning")}</option>
            <option value="error">{t("Error")}</option>
            <option value="critical">{t("Critical")}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Level")}</th>
                <th className="px-4 py-3">{t("Message")}</th>
                <th className="px-4 py-3">{t("File")}</th>
                <th className="px-4 py-3">{t("Date")}</th>
                <th className="px-4 py-3 text-right">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-muted-foreground">{t("No errors found.")}</td>
                </tr>
              ) : (
                filtered.map((error) => (
                  <tr key={error.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${LEVEL_TONE[error.level] ?? 'bg-muted text-muted-foreground'}`}>
                        {error.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      <p className="truncate font-medium text-foreground">{error.message}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <p className="truncate">{error.file}:{error.line}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(error.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedError(error)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-primary-soft hover:text-primary"
                        aria-label={t("View details")}
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedError && (
        <Modal
          title={t("Error Details")}
          description={`${selectedError.level.toUpperCase()} · ${formatDate(selectedError.created_at)}`}
          onClose={() => setSelectedError(null)}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("Message")}</p>
              <p className="mt-1 text-sm text-foreground">{selectedError.message}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("File")}</p>
              <p className="mt-1 text-sm text-foreground">{selectedError.file}:{selectedError.line}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("Stack Trace")}</p>
              <pre className="mt-1 max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs text-foreground">
                {selectedError.trace}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}