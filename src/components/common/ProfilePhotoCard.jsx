import { useRef, useState } from 'react'
import { FiCamera, FiUser } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { uploadAvatar } from '../../api/profile'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { t } from '../../utils/i18n'
import { profilePhotoUrl, validateProfilePhoto } from '../../utils/profilePhoto'

export function ProfilePhotoCard({ fullName, subtitle, embedded = false }) {
  useLanguage()
  const { user, updateUser } = useAuth()
  const inputRef = useRef(null)
  const inFlight = useRef(false)
  const [uploading, setUploading] = useState(false)
  const [failedImage, setFailedImage] = useState(null)
  const imageUrl = profilePhotoUrl(user?.profile_pic_url)

  const handlePhoto = async (event) => {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ''
    if (!file || inFlight.current) return
    const errorMessage = validateProfilePhoto(file)
    if (errorMessage) { toast.error(t(errorMessage)); return }

    inFlight.current = true
    setUploading(true)
    try {
      const response = await uploadAvatar(file)
      // Updating only the photo leaves other account data and unsaved form values intact.
      updateUser({ ...user, profile_pic: response.profile_pic, profile_pic_url: response.profile_pic_url })
      toast.success(t('Profile picture updated'))
    } catch (error) {
      const errors = error.response?.data?.errors
      toast.error(errors ? Object.values(errors).flat()[0] : error.response?.data?.message ?? t('Unable to upload photo.'))
    } finally {
      inFlight.current = false
      setUploading(false)
    }
  }

  return (
    <section aria-label={t('Photo')} className={embedded ? 'mb-6 border-b border-border pb-6' : 'rounded-xl border border-border bg-surface p-5 shadow-sm'}>
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary-soft text-primary">
          {imageUrl && failedImage !== imageUrl ? (
            <img src={imageUrl} alt={fullName ?? user?.full_name ?? t('Photo')} onError={() => setFailedImage(imageUrl)} className="h-full w-full object-cover" />
          ) : <FiUser className="h-10 w-10" />}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground">{fullName ?? user?.full_name}</h3>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" aria-label={t('Change photo')} className="hidden" disabled={uploading} onChange={handlePhoto} />
          <button type="button" disabled={uploading} aria-busy={uploading} onClick={() => inputRef.current?.click()} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50">
            <FiCamera className="h-4 w-4" />{uploading ? t('Uploading...') : t('Change photo')}
          </button>
          <p className="mt-2 text-xs text-muted-foreground">{t('JPG, PNG or WebP, up to 2 MB.')}</p>
        </div>
      </div>
    </section>
  )
}
