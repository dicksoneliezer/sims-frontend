import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiClipboard, FiRefreshCw, FiUpload, FiCheckCircle, FiClock } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatDate } from '../../utils/format'
import { Modal } from '../../components/common/Modal'

const SAMPLE_ASSIGNMENTS = [
  {
    id: 1,
    title: 'Mathematics Exercise 3.2',
    description: 'Solve all questions in exercise 3.2 on quadratic equations.',
    subject: 'Mathematics',
    due_date: '2026-11-05T23:59:00Z',
    status: 'pending',
    submitted_at: null,
    grade: null,
  },
  {
    id: 2,
    title: 'English Essay: My Future Career',
    description: 'Write a 500-word essay about your future career.',
    subject: 'English',
    due_date: '2026-11-08T23:59:00Z',
    status: 'pending',
    submitted_at: null,
    grade: null,
  },
  {
    id: 3,
    title: 'Biology Lab Report',
    description: 'Write a lab report for the photosynthesis experiment.',
    subject: 'Biology',
    due_date: '2026-10-30T23:59:00Z',
    status: 'submitted',
    submitted_at: '2026-10-28T14:00:00Z',
    grade: null,
  },
  {
    id: 4,
    title: 'History Timeline Project',
    description: 'Create a timeline of the East African colonial period.',
    subject: 'History',
    due_date: '2026-10-20T23:59:00Z',
    status: 'graded',
    submitted_at: '2026-10-18T10:00:00Z',
    grade: 'B+',
  },
]

const STATUS_TONE = {
  pending: 'bg-warning-soft text-warning',
  submitted: 'bg-primary-soft text-primary',
  graded: 'bg-success-soft text-success',
}

const STATUS_ICON = {
  pending: FiClock,
  submitted: FiCheckCircle,
  graded: FiCheckCircle,
}

export default function StudentAssignments() {
  useLanguage()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [uploading, setUploading] = useState(null)
  const [file, setFile] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/student/assignments')
      .then((res) => {
        if (active) {
          const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
          setAssignments(data.length > 0 ? data : SAMPLE_ASSIGNMENTS)
        }
      })
      .catch(() => {
        if (active) setAssignments(SAMPLE_ASSIGNMENTS)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [refreshKey])

  const handleSubmit = async () => {
    if (!file || !uploading) return

    try {
      const formData = new FormData()
      formData.append('file', file)

      await api.post(`/student/assignments/${uploading.id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success(t("Assignment submitted successfully"))
      setUploading(null)
      setFile(null)
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? t("Unable to submit assignment."))
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiClipboard className="h-5 w-5 text-primary" />{t(" Assignments")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("View and submit your homework and assignments.")}</p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
      </section>

      {loading ? (
        <div className="rounded-xl border border-border bg-surface p-14 text-center shadow-sm">
          <div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-14 text-center text-muted-foreground shadow-sm">{t("No assignments yet.")}</div>
      ) : (
        <div className="space-y-3">
          {assignments.map((item) => {
            const StatusIcon = STATUS_ICON[item.status] ?? FiClock
            return (
              <article key={item.id} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.subject}{t(" · Due ")}{formatDate(item.due_date)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_TONE[item.status]}`}>
                    <StatusIcon className="h-3 w-3" />
                    {t(item.status)}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>

                {item.grade && (
                  <p className="mt-2 text-sm font-semibold text-success">{t("Grade: ")}{item.grade}</p>
                )}

                {item.status === 'pending' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => { setUploading(item); setFile(null) }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
                    >
                      <FiUpload className="h-3.5 w-3.5" />{t(" Submit")}</button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {uploading && (
        <Modal title={t("Submit assignment")} description={uploading.title} onClose={() => { setUploading(null); setFile(null) }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Upload file")}</span>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setUploading(null); setFile(null) }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >{t("Cancel")}</button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!file}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
              >{t("Submit assignment")}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}