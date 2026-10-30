import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { FiCalendar, FiCheckCircle, FiMail, FiPhone, FiUser } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { getStudentAttendance, getStudentFor, getStudentResults } from '../../api/students'
import { getStudentInvoices, getStudentTransactions } from '../../api/finance'
import { statusClass } from '../../utils/format'
import { Modal } from '../common/Modal'

const LEVEL_LABELS = {
  pre_primary: 'Pre-primary',
  primary: 'Primary',
  secondary: 'Secondary',
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0))
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function StatusBadge({ active }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        active ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-muted px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

export function StudentDetails({ studentId, rolePrefix, canViewReports, showFinance = false, onClose }) {
  const [student, setStudent] = useState(null)
  const [results, setResults] = useState(null)
  const [attendance, setAttendance] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [invoiceSummary, setInvoiceSummary] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [tab, setTab] = useState('profile')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const requests = [getStudentFor(rolePrefix, studentId)]

    if (canViewReports) {
      requests.push(getStudentResults(rolePrefix, studentId))
      requests.push(getStudentAttendance(rolePrefix, studentId))
    }

    if (showFinance) {
      requests.push(getStudentInvoices(rolePrefix, studentId))
      requests.push(getStudentTransactions(rolePrefix, studentId))
    }

    Promise.all(requests)
      .then(([studentData, resultsData, attendanceData, invoiceData, transactionData]) => {
        if (!active) return
        setStudent(studentData)
        setResults(resultsData ?? null)
        setAttendance(attendanceData ?? null)
        setInvoices(invoiceData?.data ?? [])
        setInvoiceSummary(invoiceData?.summary ?? null)
        setTransactions(transactionData?.data ?? [])
      })
      .catch(() => {
        if (active) toast.error('Unable to load student details.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [studentId, rolePrefix, canViewReports, showFinance])

  const tabs = [
    { key: 'profile', label: 'Profile' },
    ...(canViewReports ? [
      { key: 'results', label: 'Results' },
      { key: 'attendance', label: 'Attendance' },
    ] : []),
    ...(showFinance ? [
      { key: 'invoices', label: 'Invoices' },
      { key: 'transactions', label: 'Transactions' },
    ] : []),
  ]

  return (
    <Modal title="Student details" onClose={onClose} width="max-w-3xl">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : !student ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Student could not be loaded.</p>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            {student.photo_url ? (
              <img
                src={student.photo_url}
                alt={student.full_name}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-200"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                {initials(student.full_name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">{student.full_name}</h3>
                <StatusBadge active={student.is_active} />
              </div>
              <p className="text-sm text-muted-foreground">
                {student.student_number}
                {student.class ? ` · ${student.class}` : ''}
                {student.school_level ? ` · ${LEVEL_LABELS[student.school_level]}` : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Opening balance</p>
              <p className="text-lg font-semibold text-foreground">
                {formatMoney(student.opening_balance)}
              </p>
            </div>
          </div>

          <div className="flex gap-1 border-b border-border">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
                  tab === item.key
                    ? 'border-blue-600 text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === 'profile' && (
            <div className="space-y-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                    <FiUser className="h-3.5 w-3.5" /> Gender
                  </dt>
                  <dd className="mt-1 text-sm font-medium capitalize text-foreground">
                    {student.gender ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                    <FiCalendar className="h-3.5 w-3.5" /> Date of birth
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {student.date_of_birth ? dayjs(student.date_of_birth).format('D MMMM YYYY') : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                    <FiPhone className="h-3.5 w-3.5" /> Parent phone
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {student.parent_phone ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                    <FiMail className="h-3.5 w-3.5" /> Email
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">{student.email ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Residence</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {student.residence ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Balance as of</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {student.as_of_date ? dayjs(student.as_of_date).format('D MMMM YYYY') : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">PSLE number</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {student.psle_number ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Index number</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {student.index_number ?? '—'}
                  </dd>
                </div>
              </dl>

              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FiCheckCircle className="h-4 w-4 text-muted-foreground" /> Parents / guardians
                </h4>
                {student.parents?.length ? (
                  <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-border">
                    {student.parents.map((parent) => (
                      <li key={parent.id} className="flex flex-wrap justify-between gap-2 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {parent.full_name}
                            {parent.is_primary && (
                              <span className="ml-2 rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                                Primary
                              </span>
                            )}
                          </p>
                          <p className="text-xs capitalize text-muted-foreground">{parent.relationship}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{parent.phone ?? '—'}</p>
                          <p>{parent.email ?? ''}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">No parent linked yet.</p>
                )}
              </div>
            </div>
          )}

          {tab === 'results' && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-4">
                <SummaryCard label="Records" value={results?.summary.count ?? 0} />
                <SummaryCard label="Average" value={results?.summary.average ?? '—'} />
                <SummaryCard label="Highest" value={results?.summary.highest ?? '—'} />
                <SummaryCard label="Lowest" value={results?.summary.lowest ?? '—'} />
              </div>

              {results?.results?.length ? (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2.5">Subject</th>
                        <th className="px-4 py-2.5">Exam</th>
                        <th className="px-4 py-2.5">Term</th>
                        <th className="px-4 py-2.5">Year</th>
                        <th className="px-4 py-2.5 text-right">Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {results.results.map((result) => (
                        <tr key={result.id}>
                          <td className="px-4 py-2.5">
                            <span className="font-medium text-foreground">
                              {result.subject?.name ?? '—'}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {result.subject?.code}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">{result.exam_name}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{result.term}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{result.academic_year}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-foreground">
                            {result.marks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  No exam results recorded yet.
                </p>
              )}
            </div>
          )}

          {tab === 'attendance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <SummaryCard label="Total" value={attendance?.summary.total ?? 0} />
                <SummaryCard label="Present" value={attendance?.summary.present ?? 0} />
                <SummaryCard label="Absent" value={attendance?.summary.absent ?? 0} />
                <SummaryCard label="Late" value={attendance?.summary.late ?? 0} />
                <SummaryCard label="Excused" value={attendance?.summary.excused ?? 0} />
              </div>

              {attendance?.records?.length ? (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2.5">Date</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendance.records.map((record) => (
                        <tr key={record.id}>
                          <td className="px-4 py-2.5 text-foreground">
                            {dayjs(record.date).format('ddd, D MMM YYYY')}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize text-foreground">
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">{record.remarks ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  No attendance records yet.
                </p>
              )}
            </div>
          )}

          {tab === 'invoices' && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryCard label="Invoiced" value={formatMoney(invoiceSummary?.total_invoiced ?? 0)} />
                <SummaryCard label="Paid" value={formatMoney(invoiceSummary?.total_paid ?? 0)} />
                <SummaryCard label="Outstanding" value={formatMoney(invoiceSummary?.total_outstanding ?? 0)} />
              </div>

              {invoices.length ? (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2.5">Invoice</th>
                        <th className="px-4 py-2.5">Due date</th>
                        <th className="px-4 py-2.5 text-right">Amount</th>
                        <th className="px-4 py-2.5 text-right">Balance</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-foreground">{invoice.invoice_number}</p>
                            <p className="max-w-[16rem] truncate text-xs text-muted-foreground">{invoice.description ?? '—'}</p>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">{invoice.due_date ? dayjs(invoice.due_date).format('D MMM YYYY') : '—'}</td>
                          <td className="px-4 py-2.5 text-right text-foreground">{formatMoney(invoice.amount)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-foreground">{formatMoney(invoice.balance)}</td>
                          <td className="px-4 py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusClass(invoice.status)}`}>{invoice.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  No invoices recorded yet.
                </p>
              )}
            </div>
          )}

          {tab === 'transactions' && (
            <div className="space-y-4">
              {transactions.length ? (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2.5">Reference</th>
                        <th className="px-4 py-2.5">Type</th>
                        <th className="px-4 py-2.5">Method</th>
                        <th className="px-4 py-2.5 text-right">Amount</th>
                        <th className="px-4 py-2.5">Date</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-foreground">{transaction.transaction_ref}</p>
                            <p className="text-xs text-muted-foreground">{transaction.invoice?.invoice_number ?? '—'}</p>
                          </td>
                          <td className="px-4 py-2.5 capitalize text-muted-foreground">{transaction.type}</td>
                          <td className="px-4 py-2.5 capitalize text-muted-foreground">{transaction.payment_method ?? '—'}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-foreground">{formatMoney(transaction.amount)}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{dayjs(transaction.created_at).format('D MMM YYYY')}</td>
                          <td className="px-4 py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusClass(transaction.status)}`}>{transaction.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  No transactions recorded yet.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
