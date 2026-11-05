import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiPlus, FiSearch } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { Modal } from '../../components/common/Modal'
import { useLanguage } from '../../hooks/useLanguage'
import { t } from '../../utils/i18n'

const inputClass = 'mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground'
const buttonClass = 'min-h-11 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50'

function SchoolForm({ school, onClose, onSaved }) {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ defaultValues: { name: school?.name ?? '' } })
  const fields = school ? [['name', 'School name', 'text', true]] : [
    ['name', 'School name', 'text', true],
    ['code', 'School code (optional)', 'text', false],
    ['admin.full_name', 'Administrator full name', 'text', true],
    ['admin.username', 'Username', 'text', true],
    ['admin.email', 'Email', 'email', false],
    ['admin.phone', 'Phone', 'tel', false],
    ['admin.password', 'Password', 'password', true],
    ['admin.password_confirmation', 'Confirm password', 'password', true],
  ]
  async function save(values) {
    try {
      const response = school ? await api.patch(`/system/schools/${school.id}`, values) : await api.post('/system/schools', values)
      toast.success(t(school ? 'School updated.' : 'School and administrator created.'))
      onSaved(school ? null : response.data.data)
    } catch (error) {
      Object.entries(error.response?.data?.errors ?? {}).forEach(([field, messages]) => setError(field, { message: messages[0] }))
      toast.error(error.response?.data?.message ?? t('Unable to save school.'))
    }
  }
  return (
    <Modal title={school ? 'Edit school' : 'Register school'} onClose={() => { if (!isSubmitting) onClose() }}>
      <form onSubmit={handleSubmit(save)} className="space-y-5">
        {!school && <p className="text-sm text-muted-foreground">{t('A school ID is generated automatically. Everyone registered by this administrator will belong to this school.')}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([name, label, type, required]) => {
            const error = name.startsWith('admin.') ? errors.admin?.[name.split('.')[1]] : errors[name]
            return <label key={name} className="text-sm font-medium text-foreground" htmlFor={`school-${name}`}>
              {t(label)}{required && ' *'}
              <input id={`school-${name}`} type={type} className={inputClass} autoComplete={type === 'password' ? 'new-password' : 'off'} aria-invalid={Boolean(error)} aria-describedby={error ? `error-${name}` : undefined}
                {...register(name, { required: required ? t('This field is required.') : false, ...(type === 'password' ? { minLength: { value: 8, message: t('At least 8 characters.') } } : {}) })} />
              {error && <span id={`error-${name}`} className="mt-1 block text-xs text-danger">{error.message}</span>}
            </label>
          })}
        </div>
        {!school && <p className="text-sm text-muted-foreground">{t('The administrator signs in with their username and password. No school ID is needed at login.')}</p>}
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <button type="button" disabled={isSubmitting} className={buttonClass} onClick={onClose}>{t('Cancel')}</button>
          <button type="submit" disabled={isSubmitting} className="min-h-11 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{t(isSubmitting ? 'Saving...' : school ? 'Save changes' : 'Register school')}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Schools() {
  useLanguage()
  const [result, setResult] = useState({ data: [], meta: {} })
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [form, setForm] = useState(null)
  const [created, setCreated] = useState(null)
  const [updating, setUpdating] = useState(null)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setFailed(false)
    api.get('/system/schools', { params: { page, search }, signal: controller.signal })
      .then(({ data }) => setResult(data))
      .catch(() => { if (!controller.signal.aborted) setFailed(true) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [page, search, version])
  async function toggle(school) {
    setUpdating(school.id)
    try {
      await api.patch(`/system/schools/${school.id}`, { is_active: !school.is_active })
      setVersion(v => v + 1)
      toast.success(t('School updated.'))
    } catch { toast.error(t('Unable to save school.')) }
    finally { setUpdating(null) }
  }
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 className="text-2xl font-semibold text-foreground">{t('Schools')}</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('Register each school and its administrator. School accounts and records stay separate.')}</p></div>
      <button type="button" onClick={() => setForm({})} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><FiPlus />{t('Register school')}</button>
    </div>
    {created && <div role="status" className="rounded-xl border border-border bg-success-soft p-4 text-foreground">
      <p className="font-semibold">{t('School and administrator created.')}</p>
      <p className="mt-1 text-sm">{created.school.name} · {created.school.code} · {t('School ID')}: {created.school.id}</p>
      <p className="text-sm">{t('Username')}: <strong>{created.admin.username}</strong></p>
    </div>}
    <form className="flex flex-wrap gap-2" onSubmit={event => { event.preventDefault(); setPage(1); setSearch(query.trim()) }}>
      <input aria-label={t('Search schools')} placeholder={t('Search schools')} value={query} onChange={event => setQuery(event.target.value)} className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-foreground sm:w-80" />
      <button className={`${buttonClass} inline-flex items-center gap-2`}><FiSearch />{t('Search')}</button>
    </form>
    {loading ? <p role="status" className="py-10 text-center text-muted-foreground">{t('Loading data')}</p> : failed ? <div role="alert" className="rounded-xl border border-border p-5"><p>{t('Unable to load schools.')}</p><button className={`${buttonClass} mt-3`} onClick={() => setVersion(v => v + 1)}>{t('Try again')}</button></div> : <>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm text-foreground"><thead className="bg-muted text-muted-foreground"><tr>{['School', 'School ID', 'School administrators', 'Status', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-3 font-medium">{t(label)}</th>)}</tr></thead>
          <tbody>{result.data.map(school => <tr key={school.id} className="border-t border-border">
            <td className="px-4 py-4"><p className="font-semibold">{school.name}</p><p className="text-xs text-muted-foreground">{school.code}</p></td>
            <td className="px-4 py-4">{school.id}</td>
            <td className="px-4 py-4">{school.administrators?.map(admin => <p key={admin.id}>{admin.full_name} <span className="text-muted-foreground">@{admin.username}</span></p>)}</td>
            <td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-xs font-medium ${school.is_active ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>{t(school.is_active ? 'Active' : 'Inactive')}</span></td>
            <td className="px-4 py-4"><div className="flex gap-2"><button className={buttonClass} onClick={() => setForm(school)}>{t('Edit')}</button><button disabled={updating !== null} className={buttonClass} onClick={() => toggle(school)}>{t(updating === school.id ? 'Saving...' : school.is_active ? 'Deactivate' : 'Activate')}</button></div></td>
          </tr>)}</tbody>
        </table>
        {!result.data.length && <p className="p-8 text-center text-muted-foreground">{t('No schools found.')}</p>}
      </div>
      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground"><span>{t('Page {0} of {1}', [result.meta.current_page ?? 1, result.meta.last_page ?? 1])}</span><div className="flex gap-2"><button className={buttonClass} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t('Previous')}</button><button className={buttonClass} disabled={page >= (result.meta.last_page ?? 1)} onClick={() => setPage(p => p + 1)}>{t('Next')}</button></div></div>
    </>}
    {form && <SchoolForm school={form.id ? form : null} onClose={() => setForm(null)} onSaved={data => { if (data) setCreated(data); setForm(null); setVersion(v => v + 1) }} />}
  </div>
}
