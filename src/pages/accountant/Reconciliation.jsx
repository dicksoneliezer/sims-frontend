import { t as translateUI } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
// src/pages/accountant/Reconciliation.jsx
import { useEffect, useRef, useState } from 'react'
import {
  FiUpload,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiX,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatMoney, formatDate } from '../../utils/format'

export default function AccountantReconciliation() {
  useLanguage()
  const [data, setData] = useState({
    reports: [],
    unmatched_transactions: [],
    matched_transactions: [],
    summary: { total_reports: 0, unmatched_count: 0, matched_count: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    bank_name: '',
    account_number: '',
    statement_date: new Date().toISOString().slice(0, 10),
    opening_balance: '',
    closing_balance: '',
    file: null,
  })

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/accountant/reconciliation')
      .then((res) => {
        if (!active) return
        const payload = res.data?.data ?? res.data ?? {}
        setData({
          reports: payload.reports ?? [],
          unmatched_transactions: payload.unmatched_transactions ?? [],
          matched_transactions: payload.matched_transactions ?? [],
          summary: payload.summary ?? { total_reports: 0, unmatched_count: 0, matched_count: 0 },
        })
      })
      .catch(() => { if (active) toast.error(translateUI("Unable to load reconciliation data.")) })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [refreshKey])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleFile = (e) => {
    setForm((p) => ({ ...p, file: e.target.files?.[0] ?? null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.file) {
      toast.error(translateUI("Please select a CSV file."))
      return
    }
    try {
      setUploading(true)
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v)
      })
      await api.post('/accountant/importstatement', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success(translateUI("Bank statement imported."))
      setShowForm(false)
      setForm({
        bank_name: '', account_number: '',
        statement_date: new Date().toISOString().slice(0, 10),
        opening_balance: '', closing_balance: '', file: null,
      })
      if (fileRef.current) fileRef.current.value = ''
      setRefreshKey((k) => k + 1)
    } catch (err) {
      toast.error(err?.response?.data?.message || translateUI("Unable to import statement."))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiFileText className="h-5 w-5 text-primary" />{translateUI(" Bank Reconciliation")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{translateUI("Import bank statements and match transactions with school records.")}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{translateUI(" Refresh")}</button>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition"
          >
            {showForm ? <FiX className="h-4 w-4" /> : <FiUpload className="h-4 w-4" />}
            {showForm ? translateUI("Close") : translateUI("Import Statement")}
          </button>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-primary-soft p-2.5 text-primary">
            <FiFileText className="h-5 w-5" />
          </div>
          <p className="mt-4 text-2xl font-semibold text-foreground">{data.summary.total_reports}</p>
          <p className="text-sm text-muted-foreground">{translateUI("Statements imported")}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-success-soft p-2.5 text-success">
            <FiCheckCircle className="h-5 w-5" />
          </div>
          <p className="mt-4 text-2xl font-semibold text-foreground">{data.summary.matched_count}</p>
          <p className="text-sm text-muted-foreground">{translateUI("Matched transactions")}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-warning-soft p-2.5 text-warning">
            <FiAlertCircle className="h-5 w-5" />
          </div>
          <p className="mt-4 text-2xl font-semibold text-foreground">{data.summary.unmatched_count}</p>
          <p className="text-sm text-muted-foreground">{translateUI("Unmatched transactions")}</p>
        </article>
      </section>

      {/* Import form */}
      {showForm && (
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h3 className="font-semibold text-foreground">{translateUI("Import bank statement (CSV)")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{translateUI("CSV format:")}<code>{translateUI("date, description, reference, debit, credit, balance")}</code>
          </p>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{translateUI("Bank name")}</span>
              <input type="text" name="bank_name" value={form.bank_name} onChange={handleChange} required className="rounded-lg border border-border bg-surface px-3 py-2" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{translateUI("Account number")}</span>
              <input type="text" name="account_number" value={form.account_number} onChange={handleChange} required className="rounded-lg border border-border bg-surface px-3 py-2" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{translateUI("Statement date")}</span>
              <input type="date" name="statement_date" value={form.statement_date} onChange={handleChange} required className="rounded-lg border border-border bg-surface px-3 py-2" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{translateUI("Opening balance")}</span>
              <input type="number" step="0.01" name="opening_balance" value={form.opening_balance} onChange={handleChange} required className="rounded-lg border border-border bg-surface px-3 py-2" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{translateUI("Closing balance")}</span>
              <input type="number" step="0.01" name="closing_balance" value={form.closing_balance} onChange={handleChange} required className="rounded-lg border border-border bg-surface px-3 py-2" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{translateUI("CSV file")}</span>
              <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} required className="rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
            </label>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={uploading} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
                {uploading ? translateUI("Uploading...") : translateUI("Import")}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border bg-surface px-4 py-2 text-sm">{translateUI("Cancel")}</button>
            </div>
          </form>
        </section>
      )}

      {/* Statements table */}
      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="p-4">
          <h3 className="font-semibold text-foreground">{translateUI("Recent statements")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{translateUI("Bank")}</th>
                <th className="px-4 py-3">{translateUI("Account")}</th>
                <th className="px-4 py-3">{translateUI("Statement date")}</th>
                <th className="px-4 py-3 text-right">{translateUI("Opening")}</th>
                <th className="px-4 py-3 text-right">{translateUI("Closing")}</th>
                <th className="px-4 py-3 text-right">{translateUI("Matched")}</th>
                <th className="px-4 py-3 text-right">{translateUI("Unmatched")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <div role="status" aria-label={translateUI("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
                  </td>
                </tr>
              ) : data.reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-muted-foreground">{translateUI("No statements imported yet.")}</td>
                </tr>
              ) : (
                data.reports.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {r.bank_statement?.bank_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.bank_statement?.account_number ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.bank_statement?.statement_date ? formatDate(r.bank_statement.statement_date) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {r.bank_statement ? formatMoney(r.bank_statement.opening_balance) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {r.bank_statement ? formatMoney(r.bank_statement.closing_balance) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-success">{r.matched_count ?? 0}</td>
                    <td className="px-4 py-3 text-right text-warning">{r.unmatched_count ?? 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Unmatched transactions */}
      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="p-4">
          <h3 className="font-semibold text-foreground">{translateUI("Unmatched bank transactions")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{translateUI("Date")}</th>
                <th className="px-4 py-3">{translateUI("Description")}</th>
                <th className="px-4 py-3">{translateUI("Reference")}</th>
                <th className="px-4 py-3 text-right">{translateUI("Debit")}</th>
                <th className="px-4 py-3 text-right">{translateUI("Credit")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center">
                    <div role="status" aria-label={translateUI("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
                  </td>
                </tr>
              ) : data.unmatched_transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-muted-foreground">{translateUI("All transactions matched! 🎉")}</td>
                </tr>
              ) : (
                data.unmatched_transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(t.transaction_date)}</td>
                    <td className="px-4 py-3 text-foreground">{t.description ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.reference ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-danger">{formatMoney(t.debit ?? 0)}</td>
                    <td className="px-4 py-3 text-right text-success">{formatMoney(t.credit ?? 0)}</td>
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