import { useEffect, useState } from 'react'
import { FiArrowLeft, FiAward, FiBookOpen, FiCheckCircle, FiFileText, FiUser, FiCreditCard } from 'react-icons/fi'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getChild } from '../../api/parent'
import { listChildInvoices, listChildPayments } from '../../api/finance'
import { getChildNotes } from '../../api/self'
import { getStudentAttendance, getStudentResults } from '../../api/students'
import { formatDate, formatMoney, statusClass } from '../../utils/format'

export default function ChildDetail() {
  const { id } = useParams()
  const [child, setChild] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState({ total_invoiced: 0, total_paid: 0, total_outstanding: 0 })
  const [tab, setTab] = useState('invoices')
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState(null)
  const [attendance, setAttendance] = useState(null)
  const [notes, setNotes] = useState([])
  const [tabLoading, setTabLoading] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)

    Promise.all([getChild(id), listChildInvoices(id), listChildPayments(id)])
      .then(([childData, invoiceResponse, paymentResponse]) => {
        if (!active) return
        setChild(childData)
        setInvoices(invoiceResponse.data)
        setSummary(invoiceResponse.summary ?? { total_invoiced: 0, total_paid: 0, total_outstanding: 0 })
        setPayments(paymentResponse.data)
      })
      .catch(() => {
        if (active) toast.error('Unable to load child details.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (!['results', 'attendance', 'notes'].includes(tab)) return undefined

    let active = true
    setTabLoading(true)

    const request = tab === 'results'
      ? getStudentResults('parent', id)
      : tab === 'attendance'
        ? getStudentAttendance('parent', id)
        : getChildNotes(id)

    request
      .then((response) => {
        if (!active) return
        if (tab === 'results') setResults(response)
        if (tab === 'attendance') setAttendance(response)
        if (tab === 'notes') setNotes(response ?? [])
      })
      .catch(() => {
        if (active) toast.error(`Unable to load child ${tab}.`)
      })
      .finally(() => {
        if (active) setTabLoading(false)
      })

    return () => {
      active = false
    }
  }, [tab, id])

  return (
    // Hapa tunaondoa AppLayout na MODULES_BY_ROLE kabisa. Tunabaki na div ya maudhui pekee.
    <div className="space-y-5">
      <Link to="/parent/children" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
        <FiArrowLeft className="h-4 w-4" /> Back to children
      </Link>

      {loading ? (
        <div className="rounded-xl border border-border bg-surface p-14 text-center shadow-sm"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : !child ? null : (
        <>
          <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              {child.photo_url ? (
                <img src={child.photo_url} alt={child.full_name} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary"><FiUser className="h-7 w-7" /></div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-foreground">{child.full_name}</h2>
                <p className="text-sm text-muted-foreground">{child.student_number} · {child.school_class?.name ?? child.class ?? 'No class'}</p>
                <p className="text-xs text-muted-foreground">{[child.gender, child.residence, child.parent_phone].filter(Boolean).join(' · ')}</p>
              </div>
            </div>

            <dl className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted p-3">
                <dt className="text-xs text-muted-foreground">Total invoiced</dt>
                <dd className="mt-1 font-semibold text-foreground">{formatMoney(summary.total_invoiced)}</dd>
              </div>
              <div className="rounded-lg bg-success-soft p-3">
                <dt className="text-xs text-success">Total paid</dt>
                <dd className="mt-1 font-semibold text-success">{formatMoney(summary.total_paid)}</dd>
              </div>
              <div className="rounded-lg bg-danger-soft p-3">
                <dt className="text-xs text-danger">Outstanding</dt>
                <dd className="mt-1 font-semibold text-danger">{formatMoney(summary.total_outstanding)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-surface shadow-sm">
            <div className="flex gap-1 border-b border-border px-4 pt-3">
              <button type="button" onClick={() => setTab('invoices')} className={`flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-medium ${tab === 'invoices' ? 'border-b-2 border-blue-600 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <FiFileText className="h-4 w-4" /> Invoices ({invoices.length})
              </button>
              <button type="button" onClick={() => setTab('payments')} className={`flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-medium ${tab === 'payments' ? 'border-b-2 border-blue-600 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <FiCreditCard className="h-4 w-4" /> Payments ({payments.length})
              </button>
              <button type="button" onClick={() => setTab('results')} className={`flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-medium ${tab === 'results' ? 'border-b-2 border-blue-600 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <FiAward className="h-4 w-4" /> Results
              </button>
              <button type="button" onClick={() => setTab('attendance')} className={`flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-medium ${tab === 'attendance' ? 'border-b-2 border-blue-600 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <FiCheckCircle className="h-4 w-4" /> Attendance
              </button>
              <button type="button" onClick={() => setTab('notes')} className={`flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-medium ${tab === 'notes' ? 'border-b-2 border-blue-600 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <FiBookOpen className="h-4 w-4" /> Notes ({notes.length})
              </button>
            </div>

            {tabLoading ? (
              <div className="py-14 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
            ) : tab === 'results' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr><th className="px-4 py-3">Exam</th><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Term</th><th className="px-4 py-3 text-right">Marks</th><th className="px-4 py-3">Grade</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(results?.results ?? []).length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No results published yet.</td></tr>
                    ) : results.results.map((result) => (
                      <tr key={result.id} className="hover:bg-muted/70">
                        <td className="px-4 py-3 font-medium text-foreground">{result.exam?.name ?? result.exam_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{result.subject?.name} ({result.subject?.code})</td>
                        <td className="px-4 py-3 text-muted-foreground">{result.term ?? '—'} {result.academic_year ?? ''}</td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">{result.marks}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{result.grade ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : tab === 'attendance' ? (
              <div>
                <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-5">
                  {[['Total', attendance?.summary?.total], ['Present', attendance?.summary?.present], ['Absent', attendance?.summary?.absent], ['Late', attendance?.summary?.late], ['Excused', attendance?.summary?.excused]].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold text-foreground">{value ?? 0}</p></div>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Remarks</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(attendance?.records ?? []).length === 0 ? (
                        <tr><td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">No attendance records yet.</td></tr>
                      ) : attendance.records.map((record) => (
                        <tr key={record.id} className="hover:bg-muted/70">
                          <td className="px-4 py-3 font-medium text-foreground">{formatDate(record.date)}</td>
                          <td className="px-4 py-3"><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold capitalize text-foreground">{record.status}</span></td>
                          <td className="px-4 py-3 text-muted-foreground">{record.remarks ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : tab === 'notes' ? (
              <div className="divide-y divide-slate-100">
                {notes.length === 0 ? (
                  <p className="px-4 py-10 text-center text-muted-foreground">No teacher notes for this child.</p>
                ) : notes.map((note) => (
                  <article key={note.id} className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{note.title}</h3>
                        <p className="text-xs text-muted-foreground">{note.teacher_name ?? 'Teacher'} · {formatDate(note.created_at)}</p>
                      </div>
                      <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold capitalize text-primary">{note.type}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{note.note}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                {tab === 'invoices' ? (
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Invoice</th>
                        <th className="px-4 py-3">Due date</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-right">Paid</th>
                        <th className="px-4 py-3 text-right">Balance</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No invoices yet.</td></tr>
                      ) : invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-muted/70">
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">{invoice.invoice_number}</p>
                            <p className="max-w-xs truncate text-xs text-muted-foreground">{invoice.description ?? invoice.fee_structure?.name ?? '—'}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            <p>{formatDate(invoice.due_date)}</p>
                            {invoice.is_overdue && <p className="text-xs font-medium text-danger">{invoice.days_overdue} day(s) overdue</p>}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground">{formatMoney(invoice.amount)}</td>
                          <td className="px-4 py-3 text-right text-success">{formatMoney(invoice.amount_paid)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(invoice.balance)}</td>
                          <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusClass(invoice.status)}`}>{invoice.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Control number</th>
                        <th className="px-4 py-3">Invoice</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3">Method</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No payments yet.</td></tr>
                      ) : payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-muted/70">
                          <td className="px-4 py-3 font-medium text-foreground">{payment.control_number}</td>
                          <td className="px-4 py-3 text-muted-foreground">{payment.invoice?.invoice_number ?? '—'}</td>
                          <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(payment.amount)}</td>
                          <td className="px-4 py-3 capitalize text-muted-foreground">{payment.payment_method ?? '—'}</td>
                          <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.completed_at ?? payment.created_at)}</td>
                          <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusClass(payment.status)}`}>{payment.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}