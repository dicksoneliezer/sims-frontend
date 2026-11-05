import { useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { isSchoolFileUrl } from '../../utils/schoolFiles'
import { t } from '../../utils/i18n'

export function SchoolFileLink({ href, children, ...props }) {
  const [busy, setBusy] = useState(false)
  async function open(event) {
    if (!isSchoolFileUrl(href, api.defaults.baseURL, window.location.origin)) return
    event.preventDefault()
    if (busy) return
    const preview = window.open('about:blank', '_blank')
    if (preview) preview.opener = null
    setBusy(true)
    try {
      const { data } = await api.get(href, { responseType: 'blob' })
      const url = URL.createObjectURL(data)
      if (preview && !preview.closed) preview.location.replace(url)
      else {
        const link = document.createElement('a')
        link.href = url
        link.download = 'receipt'
        link.click()
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch {
      preview?.close()
      toast.error(t('Unable to open file.'))
    } finally { setBusy(false) }
  }
  return <a {...props} href={href} onClick={open} aria-busy={busy}>{children}</a>
}
