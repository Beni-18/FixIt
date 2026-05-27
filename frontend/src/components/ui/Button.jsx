import { motion } from 'framer-motion'

const variants = {
  primary:   'bg-brand-600 hover:bg-brand-700 text-white shadow-sm',
  crimson:   'bg-crimson-600 hover:bg-crimson-700 text-white shadow-sm',
  secondary: 'bg-white hover:bg-stone-50 text-stone-700 border border-[#E8E2DA] shadow-sm',
  danger:    'bg-crimson-600 hover:bg-crimson-700 text-white shadow-sm',
  ghost:     'text-stone-600 hover:bg-stone-100',
  success:   'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export function Button({
  children, variant = 'primary', size = 'md',
  className = '', loading = false, disabled = false, ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center gap-2 font-medium rounded-lg transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
        </svg>
      )}
      {children}
    </motion.button>
  )
}
