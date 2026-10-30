import { useEffect, useState } from 'react'
import { FiAward, FiRefreshCw, FiDownload } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { formatMoney } from '../../utils/format'

const SAMPLE_CHILDREN = [
  { id: 1, full_name: 'Amina Hassan', class: 'Form 1A', student_number: 'SIMS-2026-0001' },
  { id: 2, full_name: 'Neema Joseph', class: 'Form 2B', student_number: 'SIMS-2026-0003' },
]

export default function ReportCard() {
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState('')
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)

    api.get('/parent/children')
      .then((res) => {
        if (active) {
          const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
          setChildren(data.length > 0 ? data : SAMPLE_CHILDREN)
          if (data.length > 0) setSelectedChild(String(data[0].id))
        }
      })
      .catch(() => {
        if (active) {
          setChildren(SAMPLE_CHILDREN)
          setSelectedChild(String(SAMPLE_CHILDREN[0].id))
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  const handleDownload = () => {
    if (!selectedChild) return
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      toast.info('Report card download simulated. PDF generation coming soon.')
    }, 800)
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiAward className="h-5 w-5 text-primary" /> Report Cards
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Download your child's report card.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-foreground">Select Child</span>
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
          >
            <option value="">Select a child</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.full_name} — {child.class}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleDownload}
          disabled={!selectedChild || downloading}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          <FiDownload className="h-4 w-4" /> {downloading ? 'Generating...' : 'Download Report Card'}
        </button>

        <div className="rounded-lg bg-muted p-4 text-xs text-muted-foreground">
          <p>
            Report cards will be generated as PDF files containing all term results, teacher
            comments, and overall performance.
          </p>
        </div>
      </section>
    </div>
  )
}