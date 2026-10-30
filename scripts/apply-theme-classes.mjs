import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve('src')

const replacements = [
  ['hover:bg-blue-50/50', 'hover:bg-primary-soft/50'],
  ['hover:bg-blue-50', 'hover:bg-primary-soft'],
  ['hover:border-blue-300', 'hover:border-primary/40'],
  ['hover:text-blue-700', 'hover:text-primary'],
  ['hover:text-blue-600', 'hover:text-primary'],
  ['focus:border-blue-500', 'focus:border-primary'],
  ['focus:ring-blue-100', 'focus:ring-primary/20'],
  ['ring-blue-500/40', 'ring-primary/40'],
  ['bg-blue-600/20', 'bg-primary/20'],
  ['bg-blue-600/30', 'bg-primary/30'],
  ['bg-blue-50/60', 'bg-primary-soft/60'],
  ['border-t-blue-600', 'border-t-primary'],
  ['hover:bg-blue-700', 'hover:bg-primary-hover'],
  ['text-blue-900/60', 'text-muted-foreground'],
  ['text-blue-100/80', 'text-brand-muted'],
  ['text-blue-200/70', 'text-brand-muted'],
  ['text-blue-200', 'text-brand-muted'],
  ['text-blue-100', 'text-brand-muted'],
  ['text-blue-50', 'text-brand-foreground'],
  ['bg-blue-900/60', 'bg-primary/40'],
  ['bg-blue-50', 'bg-primary-soft'],
  ['text-blue-700', 'text-primary'],
  ['text-blue-600', 'text-primary'],
  ['bg-blue-600', 'bg-primary'],
  ['from-slate-900', 'from-brand'],
  ['to-blue-800', 'to-primary'],
  ['bg-slate-900/60', 'bg-overlay'],
  ['hover:bg-slate-800', 'hover:bg-sidebar-hover'],
  ['bg-slate-800/60', 'bg-sidebar-hover/60'],
  ['bg-slate-800', 'bg-sidebar-hover'],
  ['border-slate-800', 'border-sidebar-border'],
  ['bg-slate-900', 'bg-sidebar'],
  ['disabled:bg-slate-50', 'disabled:bg-muted'],
  ['disabled:text-slate-500', 'disabled:text-muted-foreground'],
  ['hover:bg-slate-50', 'hover:bg-muted'],
  ['hover:bg-slate-100', 'hover:bg-muted'],
  ['hover:text-slate-700', 'hover:text-foreground'],
  ['hover:text-white', 'hover:text-brand-foreground'],
  ['bg-slate-50/70', 'bg-muted/70'],
  ['bg-slate-50', 'bg-muted'],
  ['bg-slate-100', 'bg-muted'],
  ['text-slate-900', 'text-foreground'],
  ['text-slate-800', 'text-foreground'],
  ['text-slate-700', 'text-foreground'],
  ['text-slate-600', 'text-muted-foreground'],
  ['text-slate-500', 'text-muted-foreground'],
  ['text-slate-400', 'text-muted-foreground'],
  ['text-slate-300', 'text-sidebar-muted'],
  ['border-slate-300', 'border-border'],
  ['border-slate-200', 'border-border'],
  ['border-slate-100', 'border-border'],
  ['bg-white/90', 'bg-surface/90'],
  ['bg-white/10', 'bg-brand-foreground/10'],
  ['bg-white', 'bg-surface'],
  ['text-white', 'text-primary-foreground'],
  ['hover:bg-rose-50', 'hover:bg-danger-soft'],
  ['hover:text-rose-600', 'hover:text-danger'],
  ['bg-rose-50', 'bg-danger-soft'],
  ['text-rose-700', 'text-danger'],
  ['text-rose-600', 'text-danger'],
  ['bg-red-50', 'bg-danger-soft'],
  ['text-red-700', 'text-danger'],
  ['text-red-600', 'text-danger'],
  ['border-red-200', 'border-danger/30'],
  ['bg-emerald-500/15', 'bg-success/15'],
  ['text-emerald-300', 'text-success'],
  ['bg-emerald-50', 'bg-success-soft'],
  ['text-emerald-700', 'text-success'],
  ['text-emerald-600', 'text-success'],
  ['text-emerald-400', 'text-success'],
  ['bg-amber-50', 'bg-warning-soft'],
  ['text-amber-700', 'text-warning'],
  ['text-amber-600', 'text-warning'],
  ['bg-cyan-50', 'bg-info-soft'],
  ['text-cyan-600', 'text-info'],
  ['bg-violet-50', 'bg-info-soft'],
  ['text-violet-600', 'text-info'],
]

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(full))
    } else if (/\.(jsx|js|css)$/.test(entry.name)) {
      files.push(full)
    }
  }

  return files
}

let changed = 0

for (const file of walk(root)) {
  let source = fs.readFileSync(file, 'utf8')
  let next = source

  for (const [from, to] of replacements) {
    next = next.split(from).join(to)
  }

  if (next !== source) {
    fs.writeFileSync(file, next)
    changed += 1
    console.log(path.relative(process.cwd(), file))
  }
}

console.log(`Updated ${changed} files`)
