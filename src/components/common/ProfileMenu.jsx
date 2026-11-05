import { SchoolImage } from './SchoolImage'
import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useId, useRef, useState } from 'react'
import { FiChevronDown, FiLogOut, FiUser } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLogout } from '../../hooks/useLogout'

export function ProfileMenu({ profilePath = '/profile' }) {
  useLanguage()
  const { user } = useAuth()
  const { signOut, busy } = useLogout()
  const [open, setOpen] = useState(false)
  const [failedImage, setFailedImage] = useState(null)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const panelId = useId()
  const picture = user?.profile_pic_url
  const photoUrl = picture && (/^https?:\/\//i.test(picture) ? picture : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${picture.startsWith('/') ? '' : '/'}${picture}`)

  useEffect(() => {
    if (!open) return
    const closeOutside = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false) }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus() }
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative shrink-0" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
      <button ref={triggerRef} type="button" aria-label={t("Account options")} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)} className="flex min-h-10 items-center gap-2 rounded-full border border-border bg-surface p-1 pr-2 transition hover:bg-muted">
        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-primary">
          {photoUrl && failedImage !== photoUrl ? <SchoolImage src={photoUrl} alt="" onError={() => setFailedImage(photoUrl)} className="h-full w-full object-cover" /> : <FiUser className="h-5 w-5" />}
        </span>
        <FiChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      {open && (
        <div id={panelId} className="absolute right-0 top-full z-50 mt-2 w-60 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface p-2 shadow-card">
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-semibold text-foreground">{user?.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">@{user?.username}</p>
            {user?.school && <p className="mt-1 text-xs text-muted-foreground">{user.school.name} · {user.school.code}</p>}
          </div>
          <Link to={profilePath} onClick={() => setOpen(false)} className="mt-1 flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"><FiUser className="h-4 w-4" />{t(" My Profile")}</Link>
          <button type="button" disabled={busy} aria-busy={busy} onClick={signOut} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger-soft"><FiLogOut className="h-4 w-4" />{busy ? t("Signing out…") : t("Logout")}</button>
        </div>
      )}
    </div>
  )
}
