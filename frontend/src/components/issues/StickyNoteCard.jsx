import { motion } from 'framer-motion'
import { MessageSquare, MapPin, ThumbsUp, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { StatusBadge, CategoryBadge, HotBadge } from '../ui/Badge'
import { toggleUpvote } from '../../api/issues'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

// Tilt angles per card index to give organic sticky note feel
const TILTS = [-1.2, 0.8, -0.5, 1.5, -1.8, 0.4, -0.9, 1.1]

const STATUS_BG = {
  raised:          'bg-amber-50  border-amber-200',
  processed:       'bg-orange-50 border-orange-200',
  being_resolved:  'bg-sky-50    border-sky-200',
  resolved:        'bg-emerald-50 border-emerald-200',
}

const STATUS_HEADER = {
  raised:          'bg-amber-200/60',
  processed:       'bg-orange-200/60',
  being_resolved:  'bg-sky-200/60',
  resolved:        'bg-emerald-200/60',
}

export function StickyNoteCard({ issue, index = 0, onClick }) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const tilt = TILTS[index % TILTS.length]

  const { mutate: vote, isPending: voting } = useMutation({
    mutationFn: () => toggleUpvote(issue.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issues'] }),
    onError: (err) => toast.error(err.response?.data?.errors?.[0] || 'Could not upvote'),
  })

  const handleVote = (e) => {
    e.stopPropagation()
    if (!user) return toast.error('Log in to upvote')
    vote()
  }

  const bgClass     = STATUS_BG[issue.status]     || 'bg-gray-50 border-gray-200'
  const headerClass = STATUS_HEADER[issue.status]  || 'bg-gray-200/60'

  return (
    <motion.div
      className={`sticky-note relative flex flex-col rounded-lg border shadow-md
        cursor-pointer select-none overflow-hidden ${bgClass}`}
      style={{ '--tilt': `${tilt}deg`, transform: `rotate(${tilt}deg)` }}
      whileHover={{ scale: 1.03, rotate: 0, zIndex: 10, shadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={() => onClick?.(issue.id)}
      layout
    >
      {/* Tape strip at top */}
      <div className={`h-2 w-full ${headerClass}`} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 flex-1">
            {issue.title}
          </h3>
          {issue.hot && <HotBadge />}
        </div>

        {/* Category + status */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusBadge status={issue.status} />
          <CategoryBadge category={issue.category} />
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{issue.location}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-black/5">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <button
              onClick={handleVote}
              disabled={voting}
              className={`flex items-center gap-1 transition-colors rounded px-1 py-0.5
                ${issue.user_voted
                  ? 'text-brand-700 font-semibold'
                  : 'text-gray-500 hover:text-brand-700'}`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${issue.user_voted ? 'fill-brand-600' : ''}`} />
              {issue.upvotes_count}
            </button>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {issue.comments_count || 0}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
