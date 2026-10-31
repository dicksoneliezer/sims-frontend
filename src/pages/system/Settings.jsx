import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiSettings, FiSave } from 'react-icons/fi'
import { toast } from 'react-toastify'

const DEFAULT_SETTINGS = {
  school_name: 'SIMS Secondary School',
  school_motto: 'Knowledge, Integrity and Service',
  school_address: 'P.O. Box 123, Dar es Salaam, Tanzania',
  school_phone: '+255 22 123 4567',
  school_email: 'info@sims.ac.tz',
  academic_year: '2026',
  current_term: 'Term 1',
  currency: 'TZS',
  timezone: 'Africa/Dar_es_Salaam',
}

export default function SystemAdminSettings() {
  useLanguage()
  const [form, setForm] = useState(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('system_settings')
    if (saved) {
      try {
        setForm({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) })
      } catch {
        // ignore parse error
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Kwa sasa tunahifadhi kwenye localStorage
      // Baadaye, tunaweza kubadilisha hii kuwa API call: await api.put('/system/settings', form)
      localStorage.setItem('system_settings', JSON.stringify(form))
      toast.success(t("System settings saved"))
    } catch (error) {
      toast.error(t("Unable to save settings."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <section>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <FiSettings className="h-5 w-5 text-primary" />{t(" System Settings")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("Configure global system settings.")}</p>
      </section>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">{t("School Name")}</span>
            <input
              value={form.school_name}
              onChange={(e) => setForm({ ...form, school_name: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">{t("School Motto")}</span>
            <input
              value={form.school_motto}
              onChange={(e) => setForm({ ...form, school_motto: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-foreground">{t("School Address")}</span>
            <input
              value={form.school_address}
              onChange={(e) => setForm({ ...form, school_address: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">{t("School Phone")}</span>
            <input
              value={form.school_phone}
              onChange={(e) => setForm({ ...form, school_phone: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">{t("School Email")}</span>
            <input
              type="email"
              value={form.school_email}
              onChange={(e) => setForm({ ...form, school_email: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">{t("Academic Year")}</span>
            <input
              value={form.academic_year}
              onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">{t("Current Term")}</span>
            <select
              value={form.current_term}
              onChange={(e) => setForm({ ...form, current_term: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            >
              <option value="Term 1">{t("Term 1")}</option>
              <option value="Term 2">{t("Term 2")}</option>
              <option value="Term 3">{t("Term 3")}</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">{t("Currency")}</span>
            <input
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">{t("Timezone")}</span>
            <input
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            <FiSave className="h-4 w-4" /> {saving ? t("Saving...") : t("Save Settings")}
          </button>
        </div>
      </form>
    </div>
  )
}