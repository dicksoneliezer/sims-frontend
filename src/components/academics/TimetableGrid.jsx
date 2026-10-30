import { FiEdit2, FiTrash2 } from 'react-icons/fi'

export function TimetableGrid({ slots, onEdit, onDelete }) {
  if (!slots.length) {
    return (
      <div className="px-6 py-14 text-center text-sm text-muted-foreground">
        No timetable slots match the current filters.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Day</th>
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Subject</th>
            <th className="px-4 py-3">Class</th>
            <th className="px-4 py-3">Teacher</th>
            <th className="px-4 py-3">Room</th>
            {(onEdit || onDelete) && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {slots.map((slot) => (
            <tr key={slot.id} className="hover:bg-muted/70">
              <td className="px-4 py-3 font-medium text-foreground">{slot.day_of_week}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {slot.start_time} - {slot.end_time}
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-foreground">{slot.subject?.name ?? '-'}</p>
                <p className="text-xs text-muted-foreground">{slot.subject?.code}</p>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{slot.class_name ?? '-'}</td>
              <td className="px-4 py-3 text-muted-foreground">{slot.teacher?.full_name ?? 'Not assigned'}</td>
              <td className="px-4 py-3 text-muted-foreground">{slot.room ?? '-'}</td>
              {(onEdit || onDelete) && (
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(slot)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-warning-soft hover:text-warning"
                        aria-label="Edit slot"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(slot)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                        aria-label="Delete slot"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
