import { useEffect, useMemo, useState } from 'react'
import { FiAward, FiRefreshCw, FiSave } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { getClassResults, getMarks, saveMarks } from '../../api/teaching'
import { listStudentsFor } from '../../api/students'

export default function TeacherMarks() {
  const [tab, setTab] = useState('entry')
  const [filters, setFilters] = useState({ classes: [], assignments: [], exams: [] })
  const [assignmentKey, setAssignmentKey] = useState('')
  const [examId, setExamId] = useState('')
  const [roster, setRoster] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const assignment = useMemo(
    () => filters.assignments.find((item) => String(item.id) === assignmentKey) ?? null,
    [filters.assignments, assignmentKey],
  )

  useEffect(() => {
    let active = true

    getMarks()
      .then((response) => {
        if (!active) return
        setFilters(response.filters ?? { classes: [], assignments: [], exams: [] })
        setAssignmentKey((current) => current || String(response.filters?.assignments?.[0]?.id ?? ''))
        setExamId((current) => current || String(response.filters?.exams?.[0]?.id ?? ''))
      })
      .catch(() => {
        if (active) toast.error('Unable to load your teaching assignments.')
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (tab !== 'entry' || !assignment || !examId) return undefined

    let active = true
    setLoading(true)

    Promise.all([
      listStudentsFor('teacher', { class_id: assignment.class_id, per_page: 100 }),
      getMarks({
        exam_id: examId,
        class_id: assignment.class_id,
        subject_id: assignment.subject_id,
        per_page: 200,
      }),
    ])
      .then(([studentResponse, markResponse]) => {
        if (!active) return
        const marks = new Map(
          (markResponse.data ?? []).map((result) => [result.student_id, result]),
        )

        setRoster(
          (studentResponse.data ?? []).map((student) => ({
            ...student,
            marks: marks.get(student.id)?.marks ?? '',
            remarks: marks.get(student.id)?.remarks ?? '',
            grade: marks.get(student.id)?.grade ?? '',
          })),
        )
      })
      .catch(() => {
        if (active) toast.error('Unable to load the mark sheet.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [assignment, examId, tab, refreshKey])

  useEffect(() => {
    if (tab !== 'results' || !assignment || !examId) return undefined

    let active = true
    setLoading(true)

    getClassResults({ class_id: assignment.class_id, exam_id: examId })
      .then((response) => {
        if (active) setResults(response)
      })
      .catch(() => {
        if (active) toast.error('Unable to load class results.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [tab, assignment, examId, refreshKey])

  const updateRow = (studentId, field, value) => {
    setRoster((current) =>
      current.map((row) => (row.id === studentId ? { ...row, [field]: value } : row)),
    )
  }

  const handleSave = async () => {
    const entries = roster
      .filter((row) => row.marks !== '' && row.marks !== null && row.marks !== undefined)
      .map((row) => ({
        student_id: row.id,
        marks: Number(row.marks),
        remarks: row.remarks || null,
      }))

    if (entries.length === 0) {
      toast.info('Enter at least one mark before saving.')
      return
    }

    setSaving(true)

    try {
      await saveMarks({
        exam_id: Number(examId),
        class_id: assignment.class_id,
        subject_id: assignment.subject_id,
        entries,
      })
      toast.success('Marks saved')
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Unable to save marks.')
    } finally {
      setSaving(false)
    }
  }

  return (
    // Hapa tunaondoa AppLayout na MODULES_BY_ROLE kabisa. Tunabaki na div ya maudhui pekee.
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiAward className="h-5 w-5 text-primary" /> Marks and class results
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter exam or continuous assessment marks, then review the class performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {['entry', 'results'].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${tab === value ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground'}`}
              >
                {value === 'entry' ? 'Mark entry' : 'Class results'}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Class and subject</span>
            <select value={assignmentKey} onChange={(event) => setAssignmentKey(event.target.value)} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
              <option value="">Select an assignment</option>
              {filters.assignments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.class_name ?? 'Class'} — {item.subject_name} ({item.subject_code})
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Exam / assessment</span>
            <select value={examId} onChange={(event) => setExamId(event.target.value)} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
              <option value="">Select an exam</option>
              {filters.exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} — {exam.term ?? 'No term'} {exam.academic_year ?? ''} ({exam.type})
                </option>
              ))}
            </select>
          </label>
        </div>

        {!assignment || !examId ? (
          <p className="px-4 py-14 text-center text-sm text-muted-foreground">Select a class assignment and exam to continue.</p>
        ) : tab === 'entry' ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Marks (0–100)</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={5} className="px-4 py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></td></tr>
                  ) : roster.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-14 text-center text-muted-foreground">No students in this class.</td></tr>
                  ) : roster.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/70">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{row.full_name}</p>
                        <p className="text-xs text-muted-foreground">{row.student_number}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{row.school_class?.name ?? row.class ?? '—'}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={row.marks}
                          onChange={(event) => updateRow(row.id, 'marks', event.target.value)}
                          className="w-28 rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">{row.grade || '—'}</td>
                      <td className="px-4 py-3">
                        <input
                          value={row.remarks}
                          onChange={(event) => updateRow(row.id, 'remarks', event.target.value)}
                          placeholder="Optional remark"
                          className="w-full min-w-44 rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-primary"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border p-4">
              <p className="text-sm text-muted-foreground">{roster.length} student(s) in {assignment.class_name}.</p>
              <button type="button" onClick={handleSave} disabled={saving || loading || roster.length === 0} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">
                <FiSave className="h-4 w-4" /> {saving ? 'Saving...' : 'Save marks'}
              </button>
            </div>
          </>
        ) : loading ? (
          <div className="py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
        ) : !results ? (
          <p className="px-4 py-14 text-center text-sm text-muted-foreground">No results available.</p>
        ) : (
          <div className="space-y-5 p-4">
            <div className="grid gap-3 sm:grid-cols-5">
              {[
                ['Students', results.summary?.students_count ?? 0],
                ['Results', results.summary?.results_count ?? 0],
                ['Average', results.summary?.average ?? '—'],
                ['Highest', results.summary?.highest ?? '—'],
                ['Pass rate', results.summary?.pass_rate != null ? `${results.summary.pass_rate}%` : '—'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3 text-right">Results</th>
                    <th className="px-4 py-3 text-right">Average</th>
                    <th className="px-4 py-3">Subjects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.students?.map((row) => (
                    <tr key={row.student_id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{row.full_name}</p>
                        <p className="text-xs text-muted-foreground">{row.student_number}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{row.class ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-foreground">{row.results_count}</td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">{row.average ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {row.subjects?.map((subject) => `${subject.subject}: ${subject.marks}${subject.grade ? ` (${subject.grade})` : ''}`).join(', ') || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}