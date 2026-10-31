import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { createTimetable, updateTimetable } from '../../api/academics'

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'
const labelClass = 'text-sm font-medium text-foreground'
const errorClass = 'mt-1 text-xs text-danger'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function TimetableForm({ slot, options, onClose, onSaved }) {
  useLanguage()
  const isEdit = Boolean(slot)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      class_id: slot?.class_id ?? '',
      subject_id: slot?.subject_id ?? '',
      teacher_id: slot?.teacher_id ?? '',
      day_of_week: slot?.day_of_week ?? 'Monday',
      start_time: slot?.start_time?.slice(0, 5) ?? '08:00',
      end_time: slot?.end_time?.slice(0, 5) ?? '08:40',
      room: slot?.room ?? '',
      term: slot?.term ?? 'Term 1',
      academic_year: slot?.academic_year ?? '2026',
    },
  })

  const onSubmit = async (values) => {
    const payload = {
      class_id: Number(values.class_id),
      subject_id: Number(values.subject_id),
      teacher_id: values.teacher_id ? Number(values.teacher_id) : null,
      day_of_week: values.day_of_week,
      start_time: values.start_time,
      end_time: values.end_time,
      room: values.room || null,
      term: values.term || null,
      academic_year: values.academic_year || null,
    }

    try {
      if (isEdit) {
        await updateTimetable(slot.id, payload)
        toast.success(t("Timetable slot updated"))
      } else {
        await createTimetable(payload)
        toast.success(t("Timetable slot created"))
      }

      onSaved()
      onClose()
    } catch (error) {
      const data = error.response?.data
      Object.entries(data?.errors ?? {}).forEach(([field, messages]) => {
        setError(field, { type: 'server', message: messages[0] })
      })
      toast.error(data?.message ?? t("Unable to save timetable slot."))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="class_id" className={labelClass}>{t("Class")}<span className="text-red-500">*</span>
          </label>
          <select
            id="class_id"
            className={`${inputClass} mt-1.5`}
            {...register('class_id', { required: t("Class is required.") })}
          >
            <option value="">{t("Select class")}</option>
            {options.classes.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>
                {schoolClass.name}
              </option>
            ))}
          </select>
          {errors.class_id && <p className={errorClass}>{errors.class_id.message}</p>}
        </div>
        <div>
          <label htmlFor="subject_id" className={labelClass}>{t("Subject")}<span className="text-red-500">*</span>
          </label>
          <select
            id="subject_id"
            className={`${inputClass} mt-1.5`}
            {...register('subject_id', { required: t("Subject is required.") })}
          >
            <option value="">{t("Select subject")}</option>
            {options.subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.code} - {subject.name}
              </option>
            ))}
          </select>
          {errors.subject_id && <p className={errorClass}>{errors.subject_id.message}</p>}
        </div>
        <div>
          <label htmlFor="teacher_id" className={labelClass}>{t("Teacher")}</label>
          <select id="teacher_id" className={`${inputClass} mt-1.5`} {...register('teacher_id')}>
            <option value="">{t("Not assigned")}</option>
            {options.teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.full_name}
              </option>
            ))}
          </select>
          {errors.teacher_id && <p className={errorClass}>{errors.teacher_id.message}</p>}
        </div>
        <div>
          <label htmlFor="day_of_week" className={labelClass}>{t("Day")}<span className="text-red-500">*</span>
          </label>
          <select id="day_of_week" className={`${inputClass} mt-1.5`} {...register('day_of_week')}>
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {t(day)}
              </option>
            ))}
          </select>
          {errors.day_of_week && <p className={errorClass}>{errors.day_of_week.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="start_time" className={labelClass}>{t("Start")}<span className="text-red-500">*</span>
            </label>
            <input
              id="start_time"
              type="time"
              className={`${inputClass} mt-1.5`}
              {...register('start_time', { required: t("Start time is required.") })}
            />
            {errors.start_time && <p className={errorClass}>{errors.start_time.message}</p>}
          </div>
          <div>
            <label htmlFor="end_time" className={labelClass}>{t("End")}<span className="text-red-500">*</span>
            </label>
            <input
              id="end_time"
              type="time"
              className={`${inputClass} mt-1.5`}
              {...register('end_time', { required: t("End time is required.") })}
            />
            {errors.end_time && <p className={errorClass}>{errors.end_time.message}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="room" className={labelClass}>{t("Room")}</label>
          <input id="room" className={`${inputClass} mt-1.5`} placeholder={t("e.g. Room 1")} {...register('room')} />
          {errors.room && <p className={errorClass}>{errors.room.message}</p>}
        </div>
        <div>
          <label htmlFor="term" className={labelClass}>{t("Term")}</label>
          <input id="term" className={`${inputClass} mt-1.5`} placeholder={t("e.g. Term 1")} {...register('term')} />
          {errors.term && <p className={errorClass}>{errors.term.message}</p>}
        </div>
        <div>
          <label htmlFor="academic_year" className={labelClass}>{t("Academic year")}</label>
          <input
            id="academic_year"
            className={`${inputClass} mt-1.5`}
            placeholder="e.g. 2026"
            {...register('academic_year')}
          />
          {errors.academic_year && <p className={errorClass}>{errors.academic_year.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >{t("Cancel")}</button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
        >
          {isSubmitting ? t("Saving...") : isEdit ? t("Save changes") : t("Create slot")}
        </button>
      </div>
    </form>
  )
}
