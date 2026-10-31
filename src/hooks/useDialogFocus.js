import { useEffect, useRef } from 'react'

export function useDialogFocus(dialogRef, onClose, isOpen = true) {
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])

  useEffect(() => {
    if (!isOpen || !dialogRef.current) return
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    const dialog = dialogRef.current
    dialog.focus({ preventScroll: true })
    const onKeyDown = (event) => {
      // Only the topmost modal handles keys when a workflow opens another dialog.
      const dialogs = document.querySelectorAll('[role="dialog"]')
      if (dialogs[dialogs.length - 1] !== dialog) return
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        closeRef.current()
      }
      if (event.key === 'Tab') {
        const focusable = [...dialog.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
          .filter((element) => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length > 0)
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (!first) {
          event.preventDefault()
          dialog.focus()
        } else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [isOpen, dialogRef])
}
