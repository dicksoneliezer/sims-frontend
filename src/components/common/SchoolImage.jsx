import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { isSchoolFileUrl } from '../../utils/schoolFiles'

export function SchoolImage({ src, onError, alt = '', ...props }) {
  const [loaded, setLoaded] = useState(null)
  const protectedFile = isSchoolFileUrl(src, api.defaults.baseURL, globalThis.location?.origin ?? 'http://localhost')
  useEffect(() => {
    if (!protectedFile) return
    const controller = new AbortController()
    let objectUrl
    api.get(src, { responseType: 'blob', signal: controller.signal }).then(({ data }) => {
      if (controller.signal.aborted) return
      objectUrl = URL.createObjectURL(data)
      setLoaded({ src, url: objectUrl })
    }).catch(() => {
      if (!controller.signal.aborted) setLoaded({ src, failed: true })
    })
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [src, protectedFile])
  useEffect(() => {
    if (loaded?.src === src && loaded.failed) onError?.()
  }, [loaded, src, onError])
  const display = protectedFile ? (loaded?.src === src ? loaded.url : undefined) : src
  return <img {...props} src={display || undefined} alt={alt} onError={onError} />
}
