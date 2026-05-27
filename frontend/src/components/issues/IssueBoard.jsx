import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StickyNoteCard } from './StickyNoteCard'
import { IssueDetailPanel } from './IssueDetailPanel'
import { Filter } from 'lucide-react'

const STATUS_FILTERS = [
  { value: '', label: 'All Issues' },
  { value: 'raised', label: 'Raised' },
  { value: 'processed', label: 'Processed' },
  { value: 'being_resolved', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
]

const CATEGORY_FILTERS = [
  { value: '', label: 'All Categories' },
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
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />

        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange?.({ ...filters, status: f.value, page: 1 })}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                ${filters.status === f.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-stone-600 border border-[#E8E2DA] hover:border-brand-400'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-gray-200 hidden sm:block" />

        <div className="flex gap-1 flex-wrap">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange?.({ ...filters, category: f.value, page: 1 })}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                ${filters.category === f.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-stone-600 border border-[#E8E2DA] hover:border-brand-400'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Board */}
      {issues.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">No issues found. All quiet on campus!</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
          layout
        >
          <AnimatePresence>
            {issues.map((issue, idx) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.04 }}
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

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange?.(page)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                ${pagination.current_page === page
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-stone-600 border border-[#E8E2DA] hover:border-brand-400'}`}
            >
              {page}
            </button>
          ))}
        </div>
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
