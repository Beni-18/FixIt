import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getIssues, deleteIssue } from '../api/issues'
import { useAuthStore } from '../store/authStore'
import { Navbar } from '../components/layout/Navbar'
import { PageTransition } from '../components/layout/PageTransition'
import { IssueDetailPanel } from '../components/issues/IssueDetailPanel'
import { StatusBadge, CategoryBadge } from '../components/ui/Badge'
import { formatDistanceToNow } from 'date-fns'
import {
  Plus, MapPin, ThumbsUp, MessageSquare, Clock,
  Edit2, Trash2, FileText, ChevronLeft, ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

const EASE = [0.22, 1, 0.36, 1]

const FILTERS = [
  { label: 'All',         value: '' },
  { label: 'Open',        value: 'raised' },
  { label: 'Processing',  value: 'processed' },
  { label: 'In Progress', value: 'being_resolved' },
  { label: 'Resolved',    value: 'resolved' },
]

const STATUS_ACCENT = {
  raised:         '#f59e0b',
  processed:      '#f97316',
  being_resolved: '#3b82f6',
  resolved:       '#10b981',
}

/* ── Per-card component ─────────────────────────────────────── */
function ReportCard({ issue, index, onView, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const accent = STATUS_ACCENT[issue.status] || '#94a3b8'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
      transition={{ delay: index * 0.05, duration: 0.42, ease: EASE }}
      className="relative bg-white rounded-2xl border border-[#DCE4EF] overflow-hidden
        group cursor-pointer"
      style={{ borderLeft: `3px solid ${accent}` }}
      onClick={() => !confirming && onView(issue.id)}
      whileHover={{ y: -3, boxShadow: '0 12px 36px rgba(0,0,0,0.09)' }}
    >
      <div className="p-5">
        {/* Top row: badges + hover-reveal actions */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            <StatusBadge status={issue.status} />
            <CategoryBadge category={issue.category} />
          </div>

          <div
            className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100
              transition-opacity duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => onEdit(issue.id)}
              title="Edit"
              className="p-1.5 rounded-lg transition-colors text-stone-300
                hover:text-[#106EBE] hover:bg-blue-50"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setConfirming(true)}
              title="Delete"
              className="p-1.5 rounded-lg transition-colors text-stone-300
                hover:text-red-500 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-stone-900 leading-snug mb-3 line-clamp-2 pr-1">
          {issue.title}
        </h3>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-stone-400 flex-wrap">
          <span className="flex items-center gap-1 truncate max-w-[130px]">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {issue.location}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" />
            {issue.upvotes_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {issue.comments_count || 0}
          </span>
          <span className="flex items-center gap-1 ml-auto whitespace-nowrap">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4"
            style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="w-5 h-5 text-red-400 mb-1" />
            <p className="text-sm font-semibold text-stone-800 text-center">Delete this report?</p>
            <p className="text-xs text-stone-400 text-center">This can't be undone.</p>
            <div className="flex gap-2 mt-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(issue.id)}
                className="px-4 py-1.5 rounded-xl bg-red-500 text-white text-xs font-bold
                  hover:bg-red-600 transition-colors"
              >
                Delete
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setConfirming(false)}
                className="px-4 py-1.5 rounded-xl border border-stone-200 text-stone-600
                  text-xs font-medium hover:bg-stone-50 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Skeleton loader card ────────────────────────────────────── */
function SkeletonCard({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="bg-white rounded-2xl border border-[#DCE4EF] p-5 space-y-3"
      style={{ borderLeft: '3px solid #DCE4EF' }}
    >
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full animate-pulse" style={{ background: '#EEF2F7' }} />
        <div className="h-5 w-24 rounded-full animate-pulse" style={{ background: '#EEF2F7' }} />
      </div>
      <div className="space-y-1.5">
        <div className="h-4 rounded-lg animate-pulse w-full" style={{ background: '#EEF2F7' }} />
        <div className="h-4 rounded-lg animate-pulse w-3/4" style={{ background: '#EEF2F7' }} />
      </div>
      <div className="flex gap-3">
        <div className="h-3 w-20 rounded animate-pulse" style={{ background: '#EEF2F7' }} />
        <div className="h-3 w-8 rounded animate-pulse" style={{ background: '#EEF2F7' }} />
        <div className="h-3 w-8 rounded animate-pulse" style={{ background: '#EEF2F7' }} />
      </div>
    </motion.div>
  )
}

/* ── Main page ──────────────────────────────────────────────── */
export function MyReports() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]                 = useState(1)
  const [selectedId, setSelectedId]     = useState(null)

  /* Unfiltered query — used only for the header stats */
  const { data: statsData } = useQuery({
    queryKey: ['my-reports-stats'],
    queryFn: () => getIssues({ my_issues: true, per_page: 100 }).then((r) => r.data),
    staleTime: 60_000,
  })

  /* Filtered + paginated — used for the card grid */
  const { data, isLoading } = useQuery({
    queryKey: ['my-reports', statusFilter, page],
    queryFn: () =>
      getIssues({ my_issues: true, status: statusFilter || undefined, page }).then((r) => r.data),
    keepPreviousData: true,
  })

  const allIssues  = statsData?.data  || []
  const issues     = data?.data       || []
  const pagination = data?.meta

  const total    = statsData?.meta?.total_count ?? allIssues.length
  const open     = allIssues.filter((i) => i.status !== 'resolved').length
  const resolved = allIssues.filter((i) => i.status === 'resolved').length

  const headerStats = [
    { label: 'Total',    value: total    },
    { label: 'Open',     value: open     },
    { label: 'Resolved', value: resolved },
  ]

  const { mutate: doDelete } = useMutation({
    mutationFn: (id) => deleteIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reports'] })
      queryClient.invalidateQueries({ queryKey: ['my-reports-stats'] })
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      toast.success('Report deleted')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Could not delete'),
  })

  return (
    <PageTransition>
      <div className="min-h-screen" style={{ background: '#F0F4F9' }}>
        <Navbar />

        {/* ── Dark header strip ─────────────────────────────────── */}
        <div
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #06111E 0%, #0B1D35 100%)' }}
        >
          {/* Dot grid */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          {/* Mint glow */}
          <div className="absolute top-0 right-0 w-72 h-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at right center, rgba(15,252,190,0.09) 0%, transparent 65%)',
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 pt-6 pb-8">
            {/* Title row */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex items-start justify-between mb-6"
            >
              <div>
                {/* Masked line reveal */}
                <div style={{ overflow: 'hidden' }}>
                  <motion.h1
                    className="text-2xl font-black tracking-tight"
                    initial={{ y: '110%', rotateZ: 1.2 }}
                    animate={{ y: '0%',   rotateZ: 0    }}
                    transition={{ duration: 0.75, delay: 0.1, ease: EASE }}
                  >
                    <span className="text-white">My </span>
                    <span style={{ color: '#0FFCBE' }}>Reports</span>
                  </motion.h1>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="text-sm mt-1"
                  style={{ color: 'rgba(255,255,255,0.38)' }}
                >
                  Track, edit and manage everything you've reported.
                </motion.p>
              </div>

              <Link to="/raise">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold
                    text-[#06111E] flex-shrink-0 ml-4"
                  style={{ background: '#0FFCBE', boxShadow: '0 2px 14px rgba(15,252,190,0.38)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#44F0CA'
                    e.currentTarget.style.boxShadow  = '0 4px 22px rgba(15,252,190,0.52)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0FFCBE'
                    e.currentTarget.style.boxShadow  = '0 2px 14px rgba(15,252,190,0.38)'
                  }}
                >
                  <Plus className="w-3.5 h-3.5" /> New Report
                </motion.button>
              </Link>
            </motion.div>

            {/* Stat tiles */}
            <div className="grid grid-cols-3 gap-3">
              {headerStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.45, ease: EASE }}
                  className="rounded-xl p-4"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="text-xl font-black tabular-nums text-white">{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.36)' }}>
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────── */}
        <main className="max-w-7xl mx-auto px-4 py-6">

          {/* Filter pills — sliding mint indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
            className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto"
            style={{ background: 'rgba(16,110,190,0.06)' }}
          >
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setStatusFilter(f.value); setPage(1) }}
                className="relative flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold
                  transition-colors z-10"
                style={{ color: statusFilter === f.value ? '#06111E' : 'rgba(0,0,0,0.45)' }}
              >
                {statusFilter === f.value && (
                  <motion.div
                    layoutId="status-pill"
                    className="absolute inset-0 rounded-lg -z-10"
                    style={{ background: '#0FFCBE' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {f.label}
              </button>
            ))}
          </motion.div>

          {/* Card grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} delay={i * 0.04} />
              ))}
            </div>
          ) : issues.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex flex-col items-center justify-center py-28 gap-4"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'rgba(15,252,190,0.08)',
                  border: '1px solid rgba(15,252,190,0.22)',
                }}
              >
                <FileText className="w-7 h-7" style={{ color: '#0FFCBE' }} />
              </motion.div>
              <div className="text-center">
                <p className="font-semibold text-stone-700">
                  {statusFilter ? 'No reports match this filter' : 'No reports yet'}
                </p>
                <p className="text-sm text-stone-400 mt-1">
                  {statusFilter
                    ? 'Try a different filter above.'
                    : "You haven't submitted any issues yet."}
                </p>
              </div>
              {!statusFilter && (
                <Link to="/raise">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold text-[#06111E]"
                    style={{
                      background: '#0FFCBE',
                      boxShadow: '0 2px 14px rgba(15,252,190,0.3)',
                    }}
                  >
                    Report your first issue
                  </motion.button>
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {issues.map((issue, i) => (
                  <ReportCard
                    key={issue.id}
                    issue={issue}
                    index={i}
                    onView={(id) => setSelectedId(id)}
                    onEdit={(id) => setSelectedId(id)}
                    onDelete={(id) => doDelete(id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-3 mt-10"
            >
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-[#DCE4EF] text-stone-500
                  hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              <span className="text-sm text-stone-500 tabular-nums px-2">
                {page} <span className="text-stone-300">/ {pagination.total_pages}</span>
              </span>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                disabled={page === pagination.total_pages}
                className="p-2 rounded-xl border border-[#DCE4EF] text-stone-500
                  hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </main>

        {/* Issue detail panel */}
        <AnimatePresence>
          {selectedId && (
            <IssueDetailPanel
              issueId={selectedId}
              onClose={() => {
                setSelectedId(null)
                queryClient.invalidateQueries({ queryKey: ['my-reports'] })
                queryClient.invalidateQueries({ queryKey: ['my-reports-stats'] })
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
