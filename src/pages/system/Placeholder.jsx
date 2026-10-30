// src/pages/system/Placeholder.jsx
export default function SystemPlaceholder({ title, icon: Icon, description }) {
  return (
    <div className="space-y-5">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
        {Icon && <Icon className="h-5 w-5 text-primary" />} {title}
      </h2>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">This page is under construction. Coming soon.</p>
      </div>
    </div>
  )
}