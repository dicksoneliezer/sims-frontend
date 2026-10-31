import { t } from '../utils/i18n'
import { useLanguage } from '../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiCamera, FiLock, FiSave, FiUser } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { changePassword, getProfile, updateProfile, uploadAvatar } from '../api/profile'
import { AppLayout } from '../components/layouts/AppLayout'
import { useAuth } from '../hooks/useAuth'
import { ROLE_LABELS } from '../utils/constants'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function photoUrl(value) {
  if (!value) return null
  return value.startsWith('http') ? value : `${BACKEND_URL}${value}`
}

export default function Profile() {
  useLanguage()
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [details, setDetails] = useState({ full_name: '', email: '', phone: '' })
  const [passwords, setPasswords] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    let active = true

    getProfile()
      .then((response) => {
        if (!active) return
        setProfile(response)
        setDetails({
          full_name: response.full_name ?? '',
          email: response.email ?? '',
          phone: response.phone ?? '',
        })
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load your profile."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleDetails = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      const response = await updateProfile({
        full_name: details.full_name,
        email: details.email || null,
        phone: details.phone || null,
      })
      setProfile(response)
      updateUser({ ...user, ...response })
      toast.success(t("Profile updated"))
    } catch (error) {
      const errors = error.response?.data?.errors
      toast.error(errors ? Object.values(errors).flat()[0] : error.response?.data?.message ?? t("Unable to update profile."))
    } finally {
      setSaving(false)
    }
  }

  const handleAvatar = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const response = await uploadAvatar(file)
      setProfile(response)
      updateUser({ ...user, ...response })
      toast.success(t("Profile picture updated"))
    } catch (error) {
      const errors = error.response?.data?.errors
      toast.error(errors ? Object.values(errors).flat()[0] : error.response?.data?.message ?? t("Unable to upload photo."))
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handlePassword = async (event) => {
    event.preventDefault()
    setSavingPassword(true)

    try {
      await changePassword(passwords)
      toast.success(t("Password changed. Please sign in again."))
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      const errors = error.response?.data?.errors
      toast.error(errors ? Object.values(errors).flat()[0] : error.response?.data?.message ?? t("Unable to change password."))
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <AppLayout title={t("My Profile")}>
      <div className="space-y-5">
        <section>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiUser className="h-5 w-5 text-primary" />{t(" My profile")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Manage your account details, photo and password.")}</p>
        </section>

        {loading ? (
          <div className="rounded-xl border border-border bg-surface py-14 text-center shadow-sm"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-3">
            <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex flex-col items-center text-center">
                {profile?.profile_pic_url ? (
                  <img src={photoUrl(profile.profile_pic_url)} alt={profile.full_name} className="h-24 w-24 rounded-full object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-soft text-3xl font-semibold text-primary">
                    {(profile?.full_name ?? 'U').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                  </div>
                )}
                <h3 className="mt-4 font-semibold text-foreground">{profile?.full_name}</h3>
                <p className="text-sm text-muted-foreground">@{profile?.username}</p>
                <span className="mt-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">{t(ROLE_LABELS[profile?.role] ?? profile?.role)}</span>

                <label className={`mt-5 flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted ${uploading ? 'opacity-50' : ''}`}>
                  <FiCamera className="h-4 w-4" /> {uploading ? t("Uploading...") : t("Change photo")}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={uploading} onChange={handleAvatar} />
                </label>
                <p className="mt-2 text-xs text-muted-foreground">{t("JPG, PNG or WebP, up to 2 MB.")}</p>
              </div>

              <dl className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{t("Employment ID")}</dt><dd className="font-medium text-foreground">{profile?.employment_id ?? '—'}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{t("NIN")}</dt><dd className="font-medium text-foreground">{profile?.nin_number ?? '—'}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{t("Status")}</dt><dd className={`font-medium ${profile?.is_active ? 'text-success' : 'text-danger'}`}>{profile?.is_active ? t("Active") : t("Inactive")}</dd></div>
              </dl>
            </section>

            <section className="rounded-xl border border-border bg-surface p-5 shadow-sm xl:col-span-2">
              <h3 className="font-semibold text-foreground">{t("Account details")}</h3>
              <form onSubmit={handleDetails} className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-foreground">{t("Full name")}</span>
                    <input required maxLength={150} value={details.full_name} onChange={(event) => setDetails({ ...details, full_name: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-foreground">{t("Username")}</span>
                    <input disabled value={profile?.username ?? ''} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-muted-foreground" />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-foreground">{t("Email")}</span>
                    <input type="email" maxLength={150} value={details.email} onChange={(event) => setDetails({ ...details, email: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-foreground">{t("Phone")}</span>
                    <input maxLength={30} value={details.phone} onChange={(event) => setDetails({ ...details, phone: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
                  </label>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">
                    <FiSave className="h-4 w-4" /> {saving ? t("Saving...") : t("Save details")}
                  </button>
                </div>
              </form>

              <h3 className="mt-8 flex items-center gap-2 border-t border-border pt-6 font-semibold text-foreground">
                <FiLock className="h-4 w-4 text-muted-foreground" />{t(" Change password")}</h3>
              <form onSubmit={handlePassword} className="mt-4 space-y-4">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-foreground">{t("Current password")}</span>
                  <input type="password" required value={passwords.current_password} onChange={(event) => setPasswords({ ...passwords, current_password: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-foreground">{t("New password")}</span>
                    <input type="password" required minLength={8} value={passwords.password} onChange={(event) => setPasswords({ ...passwords, password: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-foreground">{t("Confirm new password")}</span>
                    <input type="password" required minLength={8} value={passwords.password_confirmation} onChange={(event) => setPasswords({ ...passwords, password_confirmation: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">{t("Changing your password signs you out of all sessions.")}</p>
                <div className="flex justify-end">
                  <button type="submit" disabled={savingPassword} className="rounded-lg bg-sidebar px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-sidebar-hover disabled:opacity-50">{savingPassword ? t("Changing...") : t("Change password")}</button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
