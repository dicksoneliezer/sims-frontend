import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
export function PageLoader() {
  useLanguage()
  return (
    <div role="status" aria-live="polite" className="mx-auto w-full max-w-7xl space-y-5 p-6">
      <p className="text-sm font-medium text-muted-foreground">{t("Opening page…")}</p>
      <div aria-hidden="true" className="space-y-5 motion-safe:animate-pulse">
        <div className="h-7 w-48 rounded-lg bg-muted" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-28 rounded-xl border border-border bg-surface" />)}
        </div>
        <div className="h-64 rounded-xl border border-border bg-surface" />
      </div>
    </div>
  )
}
