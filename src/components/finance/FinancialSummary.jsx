import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { formatMoney } from '../../utils/format'

export function FinancialSummary({ summary }) {
  useLanguage()
  const net = Number(summary?.net_balance ?? 0)
  const tone = net > 0 ? 'bg-success-soft text-success' : net < 0 ? 'bg-danger-soft text-danger' : 'bg-muted text-muted-foreground'
  return <section aria-label={t('Financial Summary')} className="space-y-3">
    <h3 className="font-semibold text-foreground">{t('Financial Summary')}</h3>
    <dl className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-surface p-4"><dt className="text-sm text-muted-foreground">{t('Total Bills')}</dt><dd className="mt-2 text-xl font-semibold text-foreground">{formatMoney(summary?.total_invoiced ?? 0)}</dd></div>
      <div className="rounded-xl border border-border bg-surface p-4"><dt className="text-sm text-muted-foreground">{t('Total Payments')}</dt><dd className="mt-2 text-xl font-semibold text-foreground">{formatMoney(summary?.total_paid ?? 0)}</dd></div>
      <div className={`rounded-xl border border-border p-4 ${tone}`}><dt className="text-sm">{t('Net Balance')}</dt><dd className="mt-2 text-xl font-semibold">{net > 0 ? '+' : ''}{net === 0 ? '0' : formatMoney(net)}</dd><p className="mt-1 text-xs">{t(net > 0 ? 'Credit available' : net < 0 ? 'Amount owed' : 'Fully settled')}</p></div>
    </dl>
    {(Number(summary?.credit_received) > 0 || Number(summary?.credit_transferred) > 0) && <p className="text-xs text-muted-foreground">{t('Transferred credit received: {0}. Transferred to another child: {1}.', [formatMoney(summary.credit_received), formatMoney(summary.credit_transferred)])}</p>}
    {Number(summary?.legacy_paid_adjustment) > 0 && <p className="text-xs text-muted-foreground">{t('Includes {0} recorded as historical paid balance.', [formatMoney(summary.legacy_paid_adjustment)])}</p>}
  </section>
}
