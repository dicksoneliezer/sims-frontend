import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { formatDate, formatMoney, statusClass } from '../../utils/format'

export function BillTable({ invoices = [], showStudent = false, showPayments = false }) {
  useLanguage()
  return <div className="overflow-x-auto rounded-xl border border-border bg-surface"><table className="w-full text-left text-sm text-foreground">
    <thead className="bg-muted text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">{t('Bill ID')}</th>{showStudent && <th className="px-4 py-3">{t('Student')}</th>}<th className="px-4 py-3">{t('Period')}</th>{['Amount', 'Paid', 'Balance'].map(label => <th key={label} className="px-4 py-3 text-right">{t(label)}</th>)}<th className="px-4 py-3">{t('Due date')}</th>{showPayments && <th className="px-4 py-3">{t('Payment ID')}</th>}<th className="px-4 py-3">{t('Status')}</th></tr></thead>
    <tbody>{invoices.map(bill => <tr key={bill.id} className="border-t border-border">
      <td className="px-4 py-3 font-medium">{bill.invoice_number}</td>{showStudent && <td className="px-4 py-3">{bill.student?.full_name}<p className="text-xs text-muted-foreground">{bill.student?.student_number}</p></td>}
      <td className="whitespace-nowrap px-4 py-3">{bill.period ?? '—'}</td><td className="px-4 py-3 text-right">{formatMoney(bill.amount)}</td><td className="px-4 py-3 text-right text-success">{formatMoney(bill.amount_paid)}</td><td className={`px-4 py-3 text-right font-semibold ${Number(bill.balance) > 0 ? 'text-danger' : 'text-muted-foreground'}`}>{formatMoney(bill.balance)}</td><td className="whitespace-nowrap px-4 py-3">{formatDate(bill.due_date)}</td>{showPayments && <td className="max-w-64 break-words px-4 py-3 text-xs">{bill.payment_ids?.join(', ') || '—'}</td>}<td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(bill.status)}`}>{t(bill.status)}</span></td>
    </tr>)}</tbody>
  </table>{!invoices.length && <p className="p-8 text-center text-muted-foreground">{t('No bills found.')}</p>}</div>
}
