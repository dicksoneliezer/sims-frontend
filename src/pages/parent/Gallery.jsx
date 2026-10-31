import { t } from '../../utils/i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useEffect, useState } from 'react'
import { FiImage, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const SAMPLE_GALLERY = [
  { id: 1, title: 'Graduation Day 2025', category: 'Events', image_url: null },
  { id: 2, title: 'Sports Day', category: 'Sports', image_url: null },
  { id: 3, title: 'Science Fair', category: 'Academics', image_url: null },
  { id: 4, title: 'Cultural Day', category: 'Events', image_url: null },
]

export default function Gallery() {
  useLanguage()
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/parent/gallery')
      .then((res) => {
        if (active) {
          const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
          setImages(data.length > 0 ? data : SAMPLE_GALLERY)
        }
      })
      .catch(() => {
        if (active) setImages(SAMPLE_GALLERY)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [refreshKey])

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiImage className="h-5 w-5 text-primary" />{t(" School Gallery")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Photos and moments from school events.")}</p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t(" Refresh")}</button>
      </section>

      {loading ? (
        <div className="rounded-xl border border-border bg-surface p-14 text-center shadow-sm">
          <div role="status" aria-label={t("Loading data")} className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-14 text-center text-muted-foreground shadow-sm">{t("No gallery images yet.")}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <article key={image.id} className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-brand/20 flex items-center justify-center">
                {image.image_url ? (
                  <img src={image.image_url} alt={image.title} className="h-full w-full object-cover" />
                ) : (
                  <FiImage className="h-12 w-12 text-primary/40" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground">{image.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{image.category}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}