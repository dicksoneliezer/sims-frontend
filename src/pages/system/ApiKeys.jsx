import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiKey, FiPlus, FiRefreshCw, FiCopy, FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-toastify'

const STORAGE_KEY = 'system_api_keys'

function loadApiKeys() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveApiKeys(keys) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
}

function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = 'sims_'
  for (let i = 0; i < 40; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

export default function SystemAdminApiKeys() {
  useLanguage()
  const [keys, setKeys] = useState([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', permissions: 'read' })

  useEffect(() => {
    setKeys(loadApiKeys())
  }, [])

  const handleGenerate = (e) => {
    e.preventDefault()
    setCreating(true)

    try {
      const now = new Date()
      const newKey = {
        id: Date.now(),
        name: form.name || 'Untitled Key',
        key: generateKey(),
        permissions: form.permissions,
        created_at: now.toISOString(),
        last_used_at: null,
        status: 'active',
      }

      const updated = [newKey, ...keys]
      setKeys(updated)
      saveApiKeys(updated)
      setForm({ name: '', permissions: 'read' })
      toast.success(t("API key generated successfully"))
    } catch (error) {
      toast.error(t("Unable to generate API key."))
    } finally {
      setCreating(false)
    }
  }

  const handleCopy = async (key) => {
    try {
      await navigator.clipboard.writeText(key)
      toast.success(t("API key copied to clipboard"))
    } catch {
      toast.error(t("Unable to copy API key."))
    }
  }

  const handleRevoke = (apiKey) => {
    if (!window.confirm(t("Revoke API key \"{0}\"?", [apiKey.name]))) return

    const updated = keys.map((k) =>
      k.id === apiKey.id ? { ...k, status: 'revoked' } : k
    )
    setKeys(updated)
    saveApiKeys(updated)
    toast.success(t("API key revoked"))
  }

  const handleDelete = (apiKey) => {
    if (!window.confirm(t("Delete API key \"{0}\"?", [apiKey.name]))) return

    const updated = keys.filter((k) => k.id !== apiKey.id)
    setKeys(updated)
    saveApiKeys(updated)
    toast.success(t("API key deleted"))
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString()
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiKey className="h-5 w-5 text-primary" />{t(" API Keys")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Manage API keys for external integrations.")}</p>
        </div>
        <button
          type="button"
          onClick={() => setKeys(loadApiKeys())}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <FiRefreshCw className="h-4 w-4" />{t(" Refresh")}</button>
      </section>

      <form onSubmit={handleGenerate} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-foreground">{t("Generate New API Key")}</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-foreground">{t("Key Name")}</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("e.g. Mobile App Integration")}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">{t("Permissions")}</span>
            <select
              value={form.permissions}
              onChange={(e) => setForm({ ...form, permissions: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
            >
              <option value="read">{t("Read Only")}</option>
              <option value="read-write">{t("Read & Write")}</option>
              <option value="admin">{t("Full Admin")}</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={creating}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            <FiPlus className="h-4 w-4" /> {creating ? t("Generating...") : t("Generate Key")}
          </button>
        </div>
      </form>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Name")}</th>
                <th className="px-4 py-3">{t("Key")}</th>
                <th className="px-4 py-3">{t("Permissions")}</th>
                <th className="px-4 py-3">{t("Status")}</th>
                <th className="px-4 py-3">{t("Created")}</th>
                <th className="px-4 py-3 text-right">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-muted-foreground">{t("No API keys yet. Generate one above to get started.")}</td>
                </tr>
              ) : (
                keys.map((apiKey) => (
                  <tr key={apiKey.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3 font-medium text-foreground">{apiKey.name}</td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-muted px-2 py-1 font-mono text-xs text-foreground">
                        {apiKey.key.slice(0, 12)}...{apiKey.key.slice(-4)}
                      </code>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{apiKey.permissions.replace('-', ' ')}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        apiKey.status === 'active' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                      }`}>
                        {t(apiKey.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(apiKey.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(apiKey.key)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-primary-soft hover:text-primary"
                          aria-label={t("Copy {0}", [apiKey.name])}
                        >
                          <FiCopy className="h-4 w-4" />
                        </button>
                        {apiKey.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => handleRevoke(apiKey)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-warning-soft hover:text-warning"
                            aria-label={t("Revoke {0}", [apiKey.name])}
                          >
                            <FiKey className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(apiKey)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                          aria-label={t("Delete {0}", [apiKey.name])}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}