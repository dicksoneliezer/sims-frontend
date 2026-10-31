import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
// src/pages/system/Profile.jsx
import { useEffect, useState } from 'react'
import { FiUser, FiMail, FiPhone, FiSave, FiLock } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'

export default function SystemAdminProfile() {
  useLanguage()
  const { user } = useAuth()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
      })
    }
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.put('/profile', form)
      toast.success(t("Profile updated successfully"))
    } catch (error) {
      toast.error(error.response?.data?.message ?? t("Unable to update profile."))
    } finally {
      setSaving(false)
    }
  }

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

  return (
    <div className="space-y-6">
      <section>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <FiUser className="h-5 w-5 text-primary" />{t(" My Profile")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("Update your personal details and change your password.")}</p>
      </section>

      {/* Personal details */}
      <form onSubmit={handleSave} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="font-semibold text-foreground">{t("Personal details")}</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-foreground">{t("Full name")}</span>
            <input
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">{t("Email")}</span>
            <div className="relative">
              <FiMail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-border pl-9 pr-3 py-2 outline-none focus:border-primary"
              />
            </div>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">{t("Phone")}</span>
            <div className="relative">
              <FiPhone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-border pl-9 pr-3 py-2 outline-none focus:border-primary"
              />
            </div>
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            <FiSave className="h-4 w-4" /> {saving ? t("Saving...") : t("Save changes")}
          </button>
        </div>
      </form>

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