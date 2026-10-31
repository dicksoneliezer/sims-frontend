import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useId, useRef } from 'react'
import { FiX } from 'react-icons/fi'
import { useDialogFocus } from '../../hooks/useDialogFocus'

export function Modal({ title, description, onClose, children, width = 'max-w-2xl' }) {
  useLanguage()
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useDialogFocus(dialogRef, onClose)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-overlay p-4 sm:p-6">
      <button type="button" aria-label={t("Close modal")} className="fixed inset-0" onClick={onClose} />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} tabIndex={-1} className={`relative z-10 my-4 w-full ${width} rounded-2xl border border-border bg-surface shadow-xl`}>
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-foreground">{t(title)}</h2>
            {description && <p id={descriptionId} className="mt-0.5 text-sm text-muted-foreground">{t(description)}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label={t("Close")}
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
