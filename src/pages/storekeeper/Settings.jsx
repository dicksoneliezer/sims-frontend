import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { FiSettings } from 'react-icons/fi'

export default function StoreKeeperSettings() {
  useLanguage()
  return (
    <div className="space-y-5">
      <section>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <FiSettings className="h-5 w-5 text-primary" />{t(" Store Keeper Settings")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("Configure store settings and preferences.")}</p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">{t("Settings page is under construction. Coming soon.")}</p>
      </section>
    </div>
  )
}