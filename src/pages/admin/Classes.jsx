// src/pages/admin/Classes.jsx
import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import {
  FiLayers,
  FiPlus,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiX,
  FiUsers,
  FiBookOpen,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { AppLayout } from '../../components/layouts/AppLayout'
import { MODULES_BY_ROLE } from '../../utils/constants'

const LEVELS = [
  { value: 'pre_primary', label: 'Pre-primary' },
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
]

const EMPTY_FORM = {
  name: '',
  level: 'secondary',
  section: '',
  capacity: 40,
  class_teacher_id: '',
}

export default function AdminClasses() {
  useLanguage()
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    let active = true
    setLoading(true)

    Promise.all([
      api.get('/admin/classes', { params: { per_page: 100 } }).catch(() => ({ data: { data: [] } })),
      api.get('/admin/teachers', { params: { per_page: 100 } }).catch(() => ({ data: { data: [] } })),
    ])
      .then(([classesRes, teachersRes]) => {
        if (!active) return

        const classesData = Array.isArray(classesRes.data?.data)
          ? classesRes.data.data
          : Array.isArray(classesRes.data)
          ? classesRes.data
          : []

        const teachersData = Array.isArray(teachersRes.data?.data)
          ? teachersRes.data.data
          : Array.isArray(teachersRes.data)
          ? teachersRes.data
          : []

        setClasses(classesData)
        setTeachers(teachersData)
      })
      .catch(() => {
        if (active) toast.error(t("Unable to load classes."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [refreshKey])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error(t("Class name is required."))
      return
    }

    const payload = {
      name: form.name.trim(),
      level: form.level,
      section: form.section || null,
      capacity: Number(form.capacity) || 0,
      class_teacher_id: form.class_teacher_id ? Number(form.class_teacher_id) : null,
    }

    try {
      setSaving(true)

      if (editingId) {
        await api.put(`/admin/classes/${editingId}`, payload)
        toast.success(t("Class updated."))
      } else {
        await api.post('/admin/classes', payload)
        toast.success(t("Class created."))
      }

      setShowForm(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      const errors = err?.response?.data?.errors
      toast.error(
        errors
          ? Object.values(errors).flat()[0]
          : err?.response?.data?.message ?? t("Unable to save class."),
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cls) => {
    if (!window.confirm(t("Delete {0}? This cannot be undone.", [cls.name]))) return

    try {
      await api.delete(`/admin/classes/${cls.id}`)
      toast.success(t("Class deleted."))
      setRefreshKey((k) => k + 1)
    } catch (err) {
      toast.error(err?.response?.data?.message ?? t("Unable to delete class."))
    }
  }

  const openEdit = (cls) => {
    setEditingId(cls.id)
    setForm({
      name: cls.name ?? '',
      level: cls.level ?? 'secondary',
      section: cls.section ?? '',
      capacity: cls.capacity ?? 40,
      class_teacher_id: cls.class_teacher_id ?? '',
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  return (
    <AppLayout modules={MODULES_BY_ROLE.super_admin} title={t("Manage Classes")}>
      <div className="space-y-6">
        {/* Header */}
        <section className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <FiLayers className="h-5 w-5 text-primary" /> {t("Manage Classes")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("Create and manage school classes. These appear in the student registration dropdown.")}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> {t("Refresh")}
            </button>
            <button
              type="button"
              onClick={showForm ? closeForm : openCreate}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition"
            >
              {showForm ? <FiX className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
              {showForm ? t("Close") : t("Add Class")}
            </button>
          </div>
        </section>

        {/* Form */}
        {showForm && (
          <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="font-semibold text-foreground">
              {editingId ? t("Edit class") : t("Create new class")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {editingId
                ? t("Update the details of this class.")
                : t("Fill in the details to create a new class.")}
            </p>

            <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted-foreground">{t("Class name *")}</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder={t("e.g. Form 1A")}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted-foreground">{t("Level *")}</span>
                <select
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  required
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
                >
                  {LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>{t(l.label)}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted-foreground">{t("Section")}</span>
                <input
                  type="text"
                  name="section"
                  value={form.section}
                  onChange={handleChange}
                  placeholder={t("e.g. A")}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted-foreground">{t("Capacity")}</span>
                <input
                  type="number"
                  name="capacity"
                  min="0"
                  value={form.capacity}
                  onChange={handleChange}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span className="text-muted-foreground">{t("Class teacher (optional)")}</span>
                <select
                  name="class_teacher_id"
                  value={form.class_teacher_id}
                  onChange={handleChange}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
                >
                  <option value="">{t("No class teacher")}</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
              </label>

              <div className="sm:col-span-2 flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
                >
                  {saving ? t("Saving...") : editingId ? t("Update class") : t("Create class")}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {t("Cancel")}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Summary */}
        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="inline-flex rounded-lg bg-primary-soft p-2.5 text-primary">
              <FiLayers className="h-5 w-5" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-foreground">{classes.length}</p>
            <p className="text-sm text-muted-foreground">{t("Total classes")}</p>
          </article>
          <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="inline-flex rounded-lg bg-success-soft p-2.5 text-success">
              <FiUsers className="h-5 w-5" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-foreground">
              {classes.reduce((sum, c) => sum + (Number(c.capacity) || 0), 0)}
            </p>
            <p className="text-sm text-muted-foreground">{t("Total capacity")}</p>
          </article>
          <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="inline-flex rounded-lg bg-info-soft p-2.5 text-info">
              <FiBookOpen className="h-5 w-5" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-foreground">
              {classes.filter((c) => c.class_teacher_id).length}
            </p>
            <p className="text-sm text-muted-foreground">{t("With class teacher")}</p>
          </article>
        </section>

        {/* Table */}
        <section className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-semibold text-foreground">{t("All classes")}</h3>
            <p className="text-sm text-muted-foreground">
              {classes.length} {classes.length === 1 ? t("class") : t("classes")} {t("found")}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{t("Name")}</th>
                  <th className="px-4 py-3">{t("Level")}</th>
                  <th className="px-4 py-3">{t("Section")}</th>
                  <th className="px-4 py-3 text-right">{t("Capacity")}</th>
                  <th className="px-4 py-3">{t("Class teacher")}</th>
                  <th className="px-4 py-3">{t("Status")}</th>
                  <th className="px-4 py-3 text-right">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
                    </td>
                  </tr>
                ) : classes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center text-muted-foreground">
                      {t("No classes yet. Create one to get started.")}
                    </td>
                  </tr>
                ) : (
                  classes.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/70">
                      <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{c.level}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.section ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {c.capacity ?? 0}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.class_teacher?.full_name ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            c.is_active
                              ? 'bg-success-soft text-success'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {c.is_active ? t("Active") : t("Inactive")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-warning-soft hover:text-warning"
                            title={t("Edit")}
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                            title={t("Delete")}
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
    </AppLayout>
  )
}