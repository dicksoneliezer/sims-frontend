import { FiGlobe } from 'react-icons/fi'
import { useLanguage } from '../../hooks/useLanguage'

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage()
  return (
    <label className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface pl-2.5 text-foreground">
      <FiGlobe aria-hidden="true" className="h-4 w-4" />
      <span className="sr-only">Language / Lugha</span>
      <select aria-label="Language / Lugha" value={language} onChange={(event) => setLanguage(event.target.value)} className="max-w-28 cursor-pointer rounded-lg border-0 bg-surface py-2 pl-1 pr-2 text-sm font-medium text-foreground">
        <option value="en" lang="en">English</option>
        <option value="sw" lang="sw">Kiswahili</option>
      </select>
    </label>
  )
}
