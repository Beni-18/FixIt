const STATUS_STYLES = {
  raised:          'bg-crimson-50  text-crimson-800 border-crimson-200',
  processed:       'bg-amber-50    text-amber-800   border-amber-200',
  being_resolved:  'bg-sky-50      text-sky-800     border-sky-200',
  resolved:        'bg-emerald-50  text-emerald-800 border-emerald-200',
}

const STATUS_LABELS = {
  raised:          'Raised',
  processed:       'Processed',
  being_resolved:  'In Progress',
  resolved:        'Resolved',
}

export function StatusBadge({ status, className = '' }) {
  const style = STATUS_STYLES[status] || 'bg-stone-100 text-stone-700 border-stone-200'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
      font-medium border ${style} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export function CategoryBadge({ category, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
      bg-brand-50 text-brand-700 border border-brand-100 ${className}`}>
      {category}
    </span>
  )
}

export function HotBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
      font-semibold bg-crimson-50 text-crimson-700 border border-crimson-100">
      🔥 Trending
    </span>
  )
}
