import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useMemo, useState } from 'react'
import { FiActivity, FiRefreshCw, FiRotateCw, FiTrash2, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'

const STORAGE_KEY = 'system_queue_jobs'

const SAMPLE_JOBS = [
  {
    id: 'job-001',
    name: 'SendParentNotification',
    queue: 'notifications',
    status: 'pending',
    attempts: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    payload: { parent_id: 11, message: 'Fee reminder' },
  },
  {
    id: 'job-002',
    name: 'GenerateInvoicePDF',
    queue: 'documents',
    status: 'processing',
    attempts: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    payload: { invoice_id: 5 },
  },
  {
    id: 'job-003',
    name: 'SyncBankStatement',
    queue: 'finance',
    status: 'completed',
    attempts: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    payload: { statement_id: 3 },
  },
  {
    id: 'job-004',
    name: 'SendEmailVerification',
    queue: 'notifications',
    status: 'failed',
    attempts: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    payload: { user_id: 9 },
    exception: 'SMTP timeout after 30 seconds',
  },
  {
    id: 'job-005',
    name: 'ProcessPaymentCallback',
    queue: 'payments',
    status: 'completed',
    attempts: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    payload: { transaction_ref: 'MPESA-ABC123XYZ' },
  },
]

function loadJobs() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : SAMPLE_JOBS
  } catch {
    return SAMPLE_JOBS
  }
}

function saveJobs(jobs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
}

const STATUS_TONE = {
  pending: 'bg-warning-soft text-warning',
  processing: 'bg-primary-soft text-primary',
  completed: 'bg-success-soft text-success',
  failed: 'bg-danger-soft text-danger',
}

const STATUS_ICON = {
  pending: FiClock,
  processing: FiActivity,
  completed: FiCheckCircle,
  failed: FiAlertCircle,
}

export default function SystemAdminQueue() {
  useLanguage()
  const [jobs, setJobs] = useState([])
  const [status, setStatus] = useState('')

  useEffect(() => {
    const initial = loadJobs()
    setJobs(initial)
    saveJobs(initial)
  }, [])

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      if (status && job.status !== status) return false
      return true
    })
  }, [jobs, status])

  const summary = useMemo(() => {
    return {
      pending: jobs.filter((j) => j.status === 'pending').length,
      processing: jobs.filter((j) => j.status === 'processing').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
    }
  }, [jobs])

  const handleRefresh = () => {
    const refreshed = loadJobs()
    setJobs(refreshed)
    toast.success(t("Queue refreshed"))
  }

  const handleRetry = (job) => {
    const updated = jobs.map((j) =>
      j.id === job.id ? { ...j, status: 'pending', attempts: 0, exception: null } : j
    )
    setJobs(updated)
    saveJobs(updated)
    toast.success(t("Job {0} retried", [job.id]))
  }

  const handleClearFailed = () => {
    if (!window.confirm(t("Clear all failed jobs?"))) return

    const updated = jobs.filter((j) => j.status !== 'failed')
    setJobs(updated)
    saveJobs(updated)
    toast.success(t("Failed jobs cleared"))
  }

  const handleClearAll = () => {
    if (!window.confirm(t("Clear all jobs from the queue?"))) return

    setJobs([])
    saveJobs([])
    toast.success(t("All jobs cleared"))
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
            <FiActivity className="h-5 w-5 text-primary" />{t(" Queue Monitor")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Monitor background jobs and queue status.")}</p>
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
            onClick={handleClearFailed}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-warning hover:bg-warning-soft"
          >
            <FiAlertCircle className="h-4 w-4" />{t(" Clear Failed")}</button>
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-danger hover:bg-danger-soft"
          >
            <FiTrash2 className="h-4 w-4" />{t(" Clear All")}</button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-4">
        <StatCard label={t("Pending")} value={summary.pending} tone="text-warning" bg="bg-warning-soft" icon={FiClock} />
        <StatCard label={t("Processing")} value={summary.processing} tone="text-primary" bg="bg-primary-soft" icon={FiActivity} />
        <StatCard label={t("Completed")} value={summary.completed} tone="text-success" bg="bg-success-soft" icon={FiCheckCircle} />
        <StatCard label={t("Failed")} value={summary.failed} tone="text-danger" bg="bg-danger-soft" icon={FiAlertCircle} />
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border p-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">{t("All statuses")}</option>
            <option value="pending">{t("Pending")}</option>
            <option value="processing">{t("Processing")}</option>
            <option value="completed">{t("Completed")}</option>
            <option value="failed">{t("Failed")}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Job ID")}</th>
                <th className="px-4 py-3">{t("Name")}</th>
                <th className="px-4 py-3">{t("Queue")}</th>
                <th className="px-4 py-3">{t("Status")}</th>
                <th className="px-4 py-3 text-right">{t("Attempts")}</th>
                <th className="px-4 py-3">{t("Created")}</th>
                <th className="px-4 py-3 text-right">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-muted-foreground">{t("No jobs found.")}</td>
                </tr>
              ) : (
                filtered.map((job) => {
                  const Icon = STATUS_ICON[job.status] ?? FiActivity
                  return (
                    <tr key={job.id} className="hover:bg-muted/70">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{job.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{job.name}</p>
                        {job.exception && <p className="mt-0.5 text-xs text-danger">{job.exception}</p>}
                      </td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{job.queue}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_TONE[job.status] ?? 'bg-muted text-muted-foreground'}`}>
                          <Icon className="h-3 w-3" />
                          {t(job.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{job.attempts}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(job.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        {job.status === 'failed' && (
                          <button
                            type="button"
                            onClick={() => handleRetry(job)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-primary-soft hover:text-primary"
                            aria-label={t("Retry {0}", [job.id])}
                          >
                            <FiRotateCw className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, tone, bg, icon: Icon }) {
  useLanguage()
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className={`inline-flex rounded-lg p-2.5 ${bg} ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{t(label)}</p>
    </div>
  )
}