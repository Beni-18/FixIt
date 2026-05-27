export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-stone-700">{label}</label>
      )}
      <input
        className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors
          bg-white text-stone-900 placeholder-stone-400
          outline-none
          ${error
            ? 'border-crimson-400 focus:border-crimson-500 focus:ring-2 focus:ring-crimson-100'
            : 'border-[#E8E2DA] focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-crimson-600">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-stone-700">{label}</label>
      )}
      <textarea
        className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors resize-none
          bg-white text-stone-900 placeholder-stone-400 outline-none
          ${error
            ? 'border-crimson-400 focus:border-crimson-500 focus:ring-2 focus:ring-crimson-100'
            : 'border-[#E8E2DA] focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-crimson-600">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-stone-700">{label}</label>
      )}
      <select
        className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors
          bg-white text-stone-900 outline-none
          ${error
            ? 'border-crimson-400'
            : 'border-[#E8E2DA] focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}
          ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-crimson-600">{error}</p>}
    </div>
  )
}
