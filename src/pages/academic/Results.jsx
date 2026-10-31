import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
// src/pages/academic/Results.jsx
import { useEffect, useMemo, useState } from 'react'
import {
  FiBarChart2,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiTrendingUp,
} from 'react-icons/fi'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  createResult,
  deleteResult,
  getResultsAnalysis,
  getStudentProgress,
  listExams,
  listResults,
  updateResult,
} from '../../api/academic'
import { listClasses, listSubjects } from '../../api/academics'
import { listStudentsFor } from '../../api/students'
import api from '../../api/axios'
import { Modal } from '../../components/common/Modal'

const emptyForm = {
  id: null,
  exam_id: '',
  student_id: '',
  subject_id: '',
  class_id: '',
  marks: '',
  remarks: '',
}

export default function AcademicResults() {
  useLanguage()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState('results')

  // Data
  const [results, setResults] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, total: 0, last_page: 1 })
  const [exams, setExams] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [progressStudents, setProgressStudents] = useState([])

  // Query na pagination
  const [query, setQuery] = useState({
    exam_id: searchParams.get('exam') ?? '',
    class_id: '',
    subject_id: '',
  })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState(null)
  const [formStudents, setFormStudents] = useState([])
  const [analysisFilters, setAnalysisFilters] = useState({ exam_id: '', class_id: '', subject_id: '', term: '', academic_year: '' })
  const [analysis, setAnalysis] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [progressStudentId, setProgressStudentId] = useState('')
  const [progress, setProgress] = useState(null)
  const [progressLoading, setProgressLoading] = useState(false)

  const selectedExam = useMemo(
    () => exams.find((exam) => String(exam.id) === String(query.exam_id)),
    [exams, query.exam_id]
  )

  // =========================================
  // 1. Load dropdowns ONCE (per_page: 50, not 100)
  // =========================================
  useEffect(() => {
    let active = true

    Promise.all([
      listExams({ per_page: 50 }).catch(() => ({ data: [] })),
      listClasses({ per_page: 50 }, 'academic').catch(() => ({ data: [] })),
      listSubjects({ per_page: 50 }, 'academic').catch(() => ({ data: [] })),
      listStudentsFor('academic', { per_page: 50 }).catch(() => ({ data: [] })),
    ])
      .then(([examResponse, classResponse, subjectResponse, studentResponse]) => {
        if (!active) return
        setExams(examResponse.data ?? [])
        setClasses(classResponse.data ?? [])
        setSubjects(subjectResponse.data ?? [])
        setProgressStudents(studentResponse.data ?? [])
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load filters."))
      })

    return () => { active = false }
  }, [])

  // =========================================
  // 2. Load results (debounced filters)
  // =========================================
  useEffect(() => {
    let active = true
    setLoading(true)

    const timer = setTimeout(() => {
      listResults({ ...query, page, per_page: 20 })
        .then((response) => {
          if (!active) return
          setResults(response.data ?? [])
          setMeta(response.meta ?? { current_page: 1, total: 0, last_page: 1 })
        })
        .catch(() => {
          if (active) toast.error(t("Unable to load results."))
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 350)

    return () => {
      clearTimeout(timer)
      active = false
    }
  }, [query, page, refreshKey])

  // =========================================
  // 3. Load analysis (debounced)
  // =========================================
  useEffect(() => {
    if (tab !== 'analysis') return undefined

    let active = true
    setAnalysisLoading(true)

    const timer = setTimeout(() => {
      getResultsAnalysis(analysisFilters)
        .then((response) => {
          if (active) setAnalysis(response.data)
        })
        .catch(() => {
          if (active) toast.error(t("Unable to load results analysis."))
        })
        .finally(() => {
          if (active) setAnalysisLoading(false)
        })
    }, 400)

    return () => {
      clearTimeout(timer)
      active = false
    }
  }, [tab, analysisFilters, refreshKey])

  const formOpen = form !== null
  const formClassId = form?.class_id
  const formId = form?.id

  // =========================================
  // 4. Load students for form (only when class changes)
  // =========================================
  useEffect(() => {
    if (!formOpen) return undefined

    let active = true

    listStudentsFor('academic', { class_id: formClassId || undefined, per_page: 50 })
      .then((response) => {
        if (active) setFormStudents(response.data ?? [])
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load students."))
      })

    return () => {
      active = false
    }
  }, [formOpen, formClassId, formId])

  const openCreate = () => {
    setForm({
      ...emptyForm,
      exam_id: query.exam_id || (exams[0]?.id ?? ''),
      subject_id: query.subject_id || '',
      class_id: query.class_id || '',
    })
  }

  const openEdit = (result) => {
    setForm({
      id: result.id,
      exam_id: result.exam_id ?? '',
      student_id: result.student_id ?? '',
      subject_id: result.subject_id ?? '',
      class_id: result.student?.class_id ?? '',
      marks: result.marks ?? '',
      remarks: result.remarks ?? '',
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    const payload = {
      exam_id: Number(form.exam_id),
      student_id: Number(form.student_id),
      subject_id: Number(form.subject_id),
      marks: Number(form.marks),
      remarks: form.remarks || null,
    }

    try {
      if (form.id) {
        await updateResult(form.id, payload)
        toast.success(t("Result updated"))
      } else {
        await createResult(payload)
        toast.success(t("Result saved"))
      }

      setForm(null)
      setRefreshKey((key) => key + 1)
    } catch (error) {
      const errors = error.response?.data?.errors
      toast.error(errors ? Object.values(errors).flat()[0] : error.response?.data?.message ?? t("Unable to save result."))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (result) => {
    if (!window.confirm(t("Delete the {0} result for {1}?", [result.subject?.name, result.student?.full_name]))) return

    try {
      await deleteResult(result.id)
      toast.success(t("Result deleted"))
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? t("Unable to delete result."))
    }
  }

  const handleApprove = async (result) => {
    try {
      await api.post(`/academic/results/${result.id}/approve`)
      toast.success(t("Result approved for {0}", [result.student?.full_name]))
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? t("Unable to approve result."))
    }
  }

  const loadProgress = async () => {
    if (!progressStudentId) return
    setProgressLoading(true)

    try {
      setProgress(await getStudentProgress(progressStudentId))
    } catch (error) {
      toast.error(error.response?.data?.message ?? t("Unable to load student progress."))
    } finally {
      setProgressLoading(false)
    }
  }

  const updateFilter = (field, value) => {
    setQuery((current) => ({ ...current, [field]: value }))
    setPage(1)
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiBarChart2 className="h-5 w-5 text-primary" />{t(" Results and analysis")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Review marks, correct entries and analyse performance.")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {[['results', 'Results'], ['analysis', 'Analysis'], ['progress', 'Student progress']].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setTab(value)} className={`rounded-md px-3 py-1.5 text-sm font-medium ${tab === value ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground'}`}>{t(label)}</button>
            ))}
          </div>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
        </div>
      </section>

      {tab === 'results' && (
        <section className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="grid gap-3 border-b border-border p-4 md:grid-cols-4">
            <select value={query.exam_id} onChange={(event) => updateFilter('exam_id', event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">{t("All exams")}</option>
              {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.name} ({exam.term ?? t("No term")})</option>)}
            </select>
            <select value={query.class_id} onChange={(event) => updateFilter('class_id', event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">{t("All classes")}</option>
              {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select value={query.subject_id} onChange={(event) => updateFilter('subject_id', event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">{t("All subjects")}</option>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>)}
            </select>
            <button type="button" onClick={openCreate} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              <FiPlus className="h-4 w-4" />{t(" Add result")}</button>
          </div>
          {selectedExam && (
            <p className="border-b border-border bg-primary-soft/60 px-4 py-2 text-xs text-primary">
              {selectedExam.name} · {selectedExam.type === 'ca' ? t("Continuous assessment") : t("Exam")} · {selectedExam.term ?? t("No term")} {selectedExam.academic_year ?? ''}
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{t("Student")}</th>
                  <th className="px-4 py-3">{t("Subject")}</th>
                  <th className="px-4 py-3">{t("Exam")}</th>
                  <th className="px-4 py-3 text-right">{t("Marks")}</th>
                  <th className="px-4 py-3">{t("Grade")}</th>
                  <th className="px-4 py-3">{t("Status")}</th>
                  <th className="px-4 py-3">{t("Entered by")}</th>
                  <th className="px-4 py-3 text-right">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-14 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
                ) : results.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-14 text-center text-muted-foreground">{t("No results match your filters.")}</td></tr>
                ) : results.map((result) => (
                  <tr key={result.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{result.student?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{result.student?.student_number} · {result.student?.school_class?.name ?? result.student?.class ?? t("No class")}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{result.subject?.name} <span className="text-xs text-muted-foreground">({result.subject?.code})</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{result.exam?.name ?? result.exam_name ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{result.marks}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{result.grade ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        result.status === 'approved' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'
                      }`}>{result.status ?? t("pending")}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{result.entered_by_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {result.status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(result)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-success-soft px-3 py-1.5 text-xs font-semibold text-success hover:bg-emerald-100"
                          >{t("Approve")}</button>
                        )}
                        <button type="button" onClick={() => openEdit(result)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary" aria-label={t("Edit result")}><FiEdit2 className="h-4 w-4" /></button>
                        <button type="button" onClick={() => handleDelete(result)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-danger-soft hover:text-danger" aria-label={t("Delete result")}><FiTrash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border p-4 text-sm">
            <p className="text-muted-foreground">{meta.total ?? 0}{t(" result(s)")}</p>
            <div className="flex items-center gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-border px-3 py-1.5 font-medium text-foreground disabled:opacity-40">{t("Previous")}</button>
              <span className="text-muted-foreground">{t("Page ")}{meta.current_page ?? 1}{t(" of ")}{meta.last_page ?? 1}</span>
              <button type="button" disabled={page >= (meta.last_page ?? 1)} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-border px-3 py-1.5 font-medium text-foreground disabled:opacity-40">{t("Next")}</button>
            </div>
          </div>
        </section>
      )}

      {tab === 'analysis' && (
        <section className="space-y-5">
          <div className="grid gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm md:grid-cols-5">
            <select value={analysisFilters.exam_id} onChange={(event) => setAnalysisFilters({ ...analysisFilters, exam_id: event.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">{t("All exams")}</option>
              {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
            </select>
            <select value={analysisFilters.class_id} onChange={(event) => setAnalysisFilters({ ...analysisFilters, class_id: event.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">{t("All classes")}</option>
              {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select value={analysisFilters.subject_id} onChange={(event) => setAnalysisFilters({ ...analysisFilters, subject_id: event.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">{t("All subjects")}</option>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
            <input value={analysisFilters.term} onChange={(event) => setAnalysisFilters({ ...analysisFilters, term: event.target.value })} placeholder={t("Term")} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            <input value={analysisFilters.academic_year} onChange={(event) => setAnalysisFilters({ ...analysisFilters, academic_year: event.target.value })} placeholder={t("Academic year")} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>

          {analysisLoading ? (
            <div className="rounded-xl border border-border bg-surface py-14 text-center shadow-sm"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : !analysis ? (
            <p className="rounded-xl border border-border bg-surface p-14 text-center text-muted-foreground shadow-sm">{t("No analysis available.")}</p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                {[
                  ['Results', analysis.summary?.results_count],
                  ['Students', analysis.summary?.students_count],
                  ['Subjects', analysis.summary?.subjects_count],
                  ['Average', analysis.summary?.average ?? '—'],
                  ['Highest', analysis.summary?.highest ?? '—'],
                  ['Pass rate', analysis.summary?.pass_rate != null ? `${analysis.summary.pass_rate}%` : '—'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                    <p className="text-xs text-muted-foreground">{t(label)}</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">{value ?? '—'}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                <div className="rounded-xl border border-border bg-surface shadow-sm">
                  <h3 className="border-b border-border px-4 py-3 font-semibold text-foreground">{t("Subject performance")}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                      <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <tr><th className="px-4 py-3">{t("Subject")}</th><th className="px-4 py-3 text-right">{t("Average")}</th><th className="px-4 py-3 text-right">{t("Highest")}</th><th className="px-4 py-3 text-right">{t("Lowest")}</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(analysis.subject_performance ?? []).map((row) => (
                          <tr key={row.subject_id ?? row.code}>
                            <td className="px-4 py-3"><p className="font-medium text-foreground">{row.name}</p><p className="text-xs text-muted-foreground">{row.code}</p></td>
                            <td className="px-4 py-3 text-right font-semibold text-foreground">{row.average ?? '—'}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">{row.highest ?? '—'}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">{row.lowest ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface shadow-sm">
                  <h3 className="border-b border-border px-4 py-3 font-semibold text-foreground">{t("Class performance")}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                      <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <tr><th className="px-4 py-3">{t("Class")}</th><th className="px-4 py-3 text-right">{t("Students")}</th><th className="px-4 py-3 text-right">{t("Average")}</th><th className="px-4 py-3 text-right">{t("Results")}</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(analysis.class_performance ?? []).map((row) => (
                          <tr key={row.class_id ?? row.name}>
                            <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">{row.students_count}</td>
                            <td className="px-4 py-3 text-right font-semibold text-foreground">{row.average ?? '—'}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">{row.results_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface shadow-sm">
                  <h3 className="border-b border-border px-4 py-3 font-semibold text-foreground">{t("Top students")}</h3>
                  <div className="divide-y divide-slate-100">
                    {(analysis.top_students ?? []).map((row, index) => (
                      <div key={row.student_id} className="flex items-center justify-between px-4 py-3 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">{index + 1}</span>
                          <div><p className="font-medium text-foreground">{row.full_name}</p><p className="text-xs text-muted-foreground">{row.class} · {row.results_count}{t(" result(s)")}</p></div>
                        </div>
                        <span className="font-semibold text-foreground">{row.average}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface shadow-sm">
                  <h3 className="border-b border-border px-4 py-3 font-semibold text-foreground">{t("Grade distribution")}</h3>
                  <div className="flex flex-wrap gap-2 p-4">
                    {(analysis.grade_distribution ?? []).map((row) => (
                      <div key={row.grade} className="rounded-lg border border-border px-4 py-3">
                        <p className="text-lg font-semibold text-foreground">{row.grade}</p>
                        <p className="text-xs text-muted-foreground">{row.count}{t(" result(s)")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {tab === 'progress' && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("Student")}</span>
              <select value={progressStudentId} onChange={(event) => setProgressStudentId(event.target.value)} className="min-w-64 rounded-lg border border-border px-3 py-2 outline-none focus:border-primary">
                <option value="">{t("Select a student")}</option>
                {progressStudents.map((student) => <option key={student.id} value={student.id}>{student.full_name} ({student.student_number})</option>)}
              </select>
            </label>
            <button type="button" onClick={loadProgress} disabled={!progressStudentId || progressLoading} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">
              <FiTrendingUp className="h-4 w-4" /> {progressLoading ? t("Loading...") : t("View progress")}
            </button>
          </div>

          {progressLoading ? (
            <div className="rounded-xl border border-border bg-surface py-14 text-center shadow-sm"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : !progress ? (
            <p className="rounded-xl border border-border bg-surface p-14 text-center text-muted-foreground shadow-sm">{t("Select a student to view their academic progress.")}</p>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                <h3 className="font-semibold text-foreground">{progress.student.full_name}</h3>
                <p className="text-sm text-muted-foreground">{progress.student.student_number} · {progress.student.class}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                  {[
                    ['Results', progress.summary.results_count],
                    ['Average', progress.summary.average ?? '—'],
                    ['Attendance', progress.summary.attendance_rate != null ? `${progress.summary.attendance_rate}%` : '—'],
                    ['Behavior', progress.summary.behavior_records],
                    ['Notes', progress.summary.notes],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">{t(label)}</p><p className="mt-1 text-lg font-semibold text-foreground">{value}</p></div>
                  ))}
                </div>
              </div>
              <div className="grid gap-5 xl:grid-cols-2">
                <div className="rounded-xl border border-border bg-surface shadow-sm">
                  <h3 className="border-b border-border px-4 py-3 font-semibold text-foreground">{t("Term performance")}</h3>
                  <div className="divide-y divide-slate-100">
                    {(progress.terms ?? []).map((term) => (
                      <div key={`${term.academic_year}-${term.term}`} className="flex items-center justify-between px-4 py-3 text-sm">
                        <span className="text-muted-foreground">{term.academic_year} · {term.term}</span>
                        <span className="font-semibold text-foreground">{term.average} <span className="text-xs font-normal text-muted-foreground">({term.results_count})</span></span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-surface shadow-sm">
                  <h3 className="border-b border-border px-4 py-3 font-semibold text-foreground">{t("Subject performance")}</h3>
                  <div className="divide-y divide-slate-100">
                    {(progress.subjects ?? []).map((subject) => (
                      <div key={subject.subject_id} className="flex items-center justify-between px-4 py-3 text-sm">
                        <span className="text-muted-foreground">{subject.name} ({subject.code})</span>
                        <span className="font-semibold text-foreground">{subject.average}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {form && (
        <Modal title={form.id ? t("Edit result") : t("Add result")} onClose={() => setForm(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Exam")}</span>
                <select required disabled={Boolean(form.id)} value={form.exam_id} onChange={(event) => setForm({ ...form, exam_id: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary disabled:bg-muted disabled:text-muted-foreground">
                  <option value="">{t("Select an exam")}</option>
                  {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.name} ({exam.term ?? t("No term")})</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Class")}</span>
                <select disabled={Boolean(form.id)} value={form.class_id} onChange={(event) => setForm({ ...form, class_id: event.target.value, student_id: '' })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary disabled:bg-muted disabled:text-muted-foreground">
                  <option value="">{t("All classes")}</option>
                  {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Student")}</span>
                <select required disabled={Boolean(form.id)} value={form.student_id} onChange={(event) => setForm({ ...form, student_id: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary disabled:bg-muted disabled:text-muted-foreground">
                  <option value="">{t("Select a student")}</option>
                  {formStudents.map((student) => <option key={student.id} value={student.id}>{student.full_name} ({student.student_number})</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Subject")}</span>
                <select required disabled={Boolean(form.id)} value={form.subject_id} onChange={(event) => setForm({ ...form, subject_id: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary disabled:bg-muted disabled:text-muted-foreground">
                  <option value="">{t("Select a subject")}</option>
                  {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Marks")}</span>
                <input type="number" required min="0" max="100" step="0.5" value={form.marks} onChange={(event) => setForm({ ...form, marks: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Remarks (optional)")}</span>
                <input value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
            </div>
            {form.id && <p className="rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">{t("Only marks and remarks can be edited on an existing result.")}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t("Cancel")}</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">{saving ? t("Saving...") : t("Save result")}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}