import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiUser, FiMail, FiPhone, FiBookOpen, FiHash, FiUsers, FiLock, FiSave } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'

export default function StudentProfile() {
  useLanguage()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/student/profile')
      .then((res) => {
        if (active) setProfile(res.data.data || res.data)
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load profile."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (passwordForm.password !== passwordForm.password_confirmation) {
      toast.error(t("New passwords do not match."))
      return
    }

    setSavingPassword(true)

    try {
      await api.post('/profile/password', {
        current_password: passwordForm.current_password,
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation,
      })
      toast.success(t("Password changed successfully"))
      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: '',
      })
    } catch (error) {
      const errors = error.response?.data?.errors
      toast.error(
        errors
          ? Object.values(errors).flat()[0]
          : error.response?.data?.message ?? t("Unable to change password."),
      )
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">{t("Unable to load your profile. Please try again later.")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
        <FiUser className="h-5 w-5 text-primary" />{t(" My Profile")}</h2>

      {/* Profile details */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
            {profile.full_name?.charAt(0) || '?'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{profile.full_name}</h3>
            <p className="text-sm text-muted-foreground">{profile.student_number}</p>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("Full Name")}</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{profile.full_name || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("Student Number")}</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{profile.student_number || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("Class")}</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{profile.class || profile.school_class?.name || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("Gender")}</dt>
            <dd className="mt-1 text-sm font-medium text-foreground capitalize">{profile.gender || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("Parent Phone")}</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{profile.parent_phone || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("Email")}</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{profile.email || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("Residence")}</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{profile.residence || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("Date of Birth")}</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{profile.date_of_birth || '—'}</dd>
          </div>
        </dl>
      </div>

      {/* Change password */}
      <form onSubmit={handleChangePassword} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="flex items-center gap-2 font-semibold text-foreground">
          <FiLock className="h-4 w-4 text-primary" />{t(" Change password")}</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-foreground">{t("Current password")}</span>
            <input
              type="password"
              required
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">{t("New password")}</span>
            <input
              type="password"
              required
              minLength={8}
              value={passwordForm.password}
              onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">{t("Confirm new password")}</span>
            <input
              type="password"
              required
              minLength={8}
              value={passwordForm.password_confirmation}
              onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            <FiLock className="h-4 w-4" /> {savingPassword ? t("Changing...") : t("Change password")}
          </button>
        </div>
      </form>
    </div>
  )
}