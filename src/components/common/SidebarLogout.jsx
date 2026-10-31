import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { FiLogOut } from 'react-icons/fi'
import { useLogout } from '../../hooks/useLogout'

export function SidebarLogout() {
  useLanguage()
  const { signOut, busy } = useLogout()
  return (
    <button type="button" disabled={busy} aria-busy={busy} onClick={signOut} className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition hover:bg-sidebar-hover">
      <FiLogOut className="h-4 w-4" />{busy ? t("Signing out…") : t("Logout")}
    </button>
  )
}
