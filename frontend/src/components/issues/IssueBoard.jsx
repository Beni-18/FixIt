import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StickyNoteCard } from './StickyNoteCard'
import { IssueDetailPanel } from './IssueDetailPanel'
import { Filter, Inbox, ChevronLeft, ChevronRight } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1]

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'raised', label: 'Raised' },
  { value: 'processed', label: 'Processed' },
  { value: 'being_resolved', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
]

const CATEGORY_FILTERS = [
  { value: '', label: 'All' },
  { value: 'Classroom Equipment', label: 'Classroom' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Wi-Fi / Network', label: 'Wi-Fi' },
  { value: 'Plumbing', label: 'Plumbing' },
  { value: 'Sanitation', label: 'Sanitation' },
  { value: 'Security', label: 'Security' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'Other', label: 'Other' },
]

export function IssueBoard({ issues = [], onFilterChange, filters = {}, pagination, onPageChange }) {
  const [selectedId, setSelectedId] = useState(null)

  return (
    <div className="flex flex-col gap-5">

      {/* ── Filter bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap"
      >
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-stone-400 flex-shrink-0">
          <Filter className="w-3.5 h-3.5" /> Filter
        </span>

        {/* Status pills */}
        <div className="flex gap-1 p-1 rounded-xl flex-wrap" style={{ background: 'rgba(16,110,190,0.06)' }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange?.({ ...filters, status: f.value, page: 1 })}
              className="relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors z-10"
              style={{ color: filters.status === f.value ? '#06111E' : 'rgba(0,0,0,0.45)' }}
            >
              {filters.status === f.value && (
                <motion.div
                  layoutId="board-status-pill"
                  className="absolute inset-0 rounded-lg -z-10"
                  style={{ background: '#0FFCBE' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {f.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-stone-200" />

        {/* Category pills */}
        <div className="flex gap-1 p-1 rounded-xl flex-wrap" style={{ background: 'rgba(16,110,190,0.06)' }}>
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange?.({ ...filters, category: f.value, page: 1 })}
              className="relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors z-10"
              style={{ color: filters.category === f.value ? '#06111E' : 'rgba(0,0,0,0.45)' }}
            >
              {filters.category === f.value && (
                <motion.div
                  layoutId="board-category-pill"
                  className="absolute inset-0 rounded-lg -z-10"
                  style={{ background: 'rgba(16,110,190,0.14)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Board ── */}
      {issues.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="text-center py-24 text-stone-400 flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Inbox className="w-10 h-10 text-stone-300" />
          </motion.div>
          <p className="text-sm">No issues found. All quiet on campus!</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
          layout
        >
          <AnimatePresence mode="popLayout">
            {issues.map((issue, idx) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 36, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.18 } }}
                transition={{
                  delay: 0.06 + idx * 0.055,
                  duration: 0.52,
                  ease: EASE,
                }}
              >
                <StickyNoteCard
                  issue={issue}
                  index={idx}
                  onClick={setSelectedId}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Pagination ── */}
      {pagination && pagination.total_pages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 pt-2"
        >
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onPageChange?.(Math.max(1, (pagination.current_page || 1) - 1))}
            disabled={(pagination.current_page || 1) === 1}
            className="p-2 rounded-xl border border-[#DCE4EF] text-stone-400
              hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>

          <div className="flex gap-1">
            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
              <motion.button
                key={page}
                whileTap={{ scale: 0.9 }}
                onClick={() => onPageChange?.(page)}
                className="relative w-8 h-8 rounded-xl text-xs font-bold transition-colors"
                style={{ color: pagination.current_page === page ? '#06111E' : 'rgba(0,0,0,0.4)' }}
              >
                {pagination.current_page === page && (
                  <motion.div
                    layoutId="page-pill"
                    className="absolute inset-0 rounded-xl -z-10"
                    style={{ background: '#0FFCBE' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {page}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onPageChange?.(Math.min(pagination.total_pages, (pagination.current_page || 1) + 1))}
            disabled={(pagination.current_page || 1) === pagination.total_pages}
            className="p-2 rounded-xl border border-[#DCE4EF] text-stone-400
              hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}

      {/* Issue detail side panel */}
      <AnimatePresence>
        {selectedId && (
          <IssueDetailPanel
            issueId={selectedId}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
