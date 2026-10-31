import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiRefreshCw, FiSearch, FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { listStudentsFor } from '../../api/students'
import { createNote, deleteNote, getNotes, updateNote } from '../../api/teaching'
import { Modal } from '../../components/common/Modal'
import { formatDate } from '../../utils/format'

const TYPES = ['general', 'academic', 'behavior', 'attendance', 'performance']

const emptyForm = {
  id: null,
  student_id: '',
  title: '',
  note: '',
  type: 'general',
}

export default function TeacherNotes() {
  useLanguage()
  const [notes, setNotes] = useState([])
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState(null)

  useEffect(() => {
    let active = true

    listStudentsFor('teacher', { per_page: 100 })
      .then((response) => {
        if (active) setStudents(response.data ?? [])
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load your students."))
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)

    getNotes({ search: search || undefined, type: type || undefined, per_page: 100 })
      .then((response) => {
        if (active) setNotes(response.data ?? [])
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load notes."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [search, type, refreshKey])

  const openCreate = () => setForm({ ...emptyForm })

  const openEdit = (note) => {
    setForm({
      id: note.id,
      student_id: note.student_id ?? '',
      title: note.title,
      note: note.note,
      type: note.type,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    const payload = {
      student_id: form.student_id ? Number(form.student_id) : null,
      title: form.title,
      note: form.note,
      type: form.type,
    }

    try {
      if (form.id) {
        await updateNote(form.id, payload)
        toast.success(t("Note updated"))
      } else {
        await createNote(payload)
        toast.success(t("Note created"))
      }

      setForm(null)
      setRefreshKey((key) => key + 1)
    } catch (error) {
      const errors = error.response?.data?.errors
      toast.error(errors ? Object.values(errors).flat()[0] : error.response?.data?.message ?? t("Unable to save note."))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (note) => {
    if (!window.confirm(t("Delete note \"{0}\"?", [note.title]))) return

    try {
      await deleteNote(note.id)
      toast.success(t("Note deleted"))
      setRefreshKey((key) => key + 1)
    } catch (error) {
      toast.error(error.response?.data?.message ?? t("Unable to delete note."))
    }
  }

  return (
    // Hapa tunaondoa AppLayout na MODULES_BY_ROLE kabisa. Tunabaki na div ya maudhui pekee.
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{t("Teacher notes")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Record academic, attendance and performance observations for your students.")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
          <button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
            <FiPlus className="h-4 w-4" />{t(" New note")}</button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("Search note title or content")}
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
            <option value="">{t("All note types")}</option>
            {TYPES.map((item) => <option key={item} value={item} className="capitalize">{item}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="py-14 text-center"><div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
        ) : notes.length === 0 ? (
          <p className="px-4 py-14 text-center text-muted-foreground">{t("No notes match your filters.")}</p>
        ) : (
          <div className="grid gap-4 p-4 lg:grid-cols-2">
            {notes.map((note) => (
              <article key={note.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{note.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {note.student ? `${note.student.full_name} · ${note.student.student_number}` : t("General note")} · {formatDate(note.created_at)}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold capitalize text-primary">{note.type}</span>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{note.note}</p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className={`text-xs font-medium ${note.is_read ? 'text-success' : 'text-muted-foreground'}`}>{note.is_read ? t("Read by student") : t("Not yet read")}</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => openEdit(note)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary" aria-label={t("Edit note")}><FiEdit2 className="h-4 w-4" /></button>
                    <button type="button" onClick={() => handleDelete(note)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-danger-soft hover:text-danger" aria-label={t("Delete note")}><FiTrash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {form && (
        <Modal title={form.id ? t("Edit note") : t("New note")} onClose={() => setForm(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-foreground">{t("Student (optional)")}</span>
              <select value={form.student_id} onChange={(event) => setForm({ ...form, student_id: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary">
                <option value="">{t("General note")}</option>
                {students.map((student) => <option key={student.id} value={student.id}>{student.full_name} ({student.student_number})</option>)}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Title")}</span>
                <input required maxLength={150} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("Type")}</span>
                <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 capitalize outline-none focus:border-primary">
                  {TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-foreground">{t("Note")}</span>
              <textarea required rows={5} maxLength={5000} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary" />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t("Cancel")}</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">{saving ? t("Saving...") : t("Save note")}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}