import { useState } from 'react'
import { FiCalendar, FiSettings, FiSliders } from 'react-icons/fi'
import { CalendarPanel } from '../../components/admin/CalendarPanel'
import { GradingPanel } from '../../components/admin/GradingPanel'
import { SchoolProfilePanel } from '../../components/admin/SchoolProfilePanel'
import { AppLayout } from '../../components/layouts/AppLayout'
import { MODULES_BY_ROLE } from '../../utils/constants'

const TABS = [
  { key: 'school', label: 'School Profile', icon: FiSettings },
  { key: 'grading', label: 'Grading System', icon: FiSliders },
  { key: 'calendar', label: 'Academic Calendar', icon: FiCalendar },
]

export default function Settings() {
  const [tab, setTab] = useState('school')

  return (
    <AppLayout modules={MODULES_BY_ROLE.super_admin} title="Settings">
      <div className="space-y-5">
        <section>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <FiSettings className="h-5 w-5 text-primary" /> Settings
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Configure school information, grading boundaries and the academic calendar.</p>
        </section>

        <section className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex flex-wrap gap-1 border-b border-border px-4 py-3">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${tab === item.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === 'school' && <SchoolProfilePanel />}
            {tab === 'grading' && <GradingPanel />}
            {tab === 'calendar' && <CalendarPanel />}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
