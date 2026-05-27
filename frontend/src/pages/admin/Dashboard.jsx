import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../../api/admin'
import { motion } from 'framer-motion'
import { StatusBadge, CategoryBadge } from '../../components/ui/Badge'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertCircle, CheckCircle, Clock, Users, ThumbsUp, MessageSquare, TrendingUp, Layers
} from 'lucide-react'

export function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => getDashboard().then((r) => r.data),
    refetchInterval: 30000,
  })

  if (isLoading) return <LoadingSkeleton />

  const { stats, top_issues, recent_issues, issues_by_category, issues_by_location } = data

  const statCards = [
    { label: 'Raised',       value: stats.raised,          icon: AlertCircle,    color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200' },
    { label: 'Processed',    value: stats.processed,       icon: Layers,         color: 'text-orange-600', bg: 'bg-orange-50',  border: 'border-orange-200' },
    { label: 'In Progress',  value: stats.being_resolved,  icon: Clock,          color: 'text-sky-600',    bg: 'bg-sky-50',     border: 'border-sky-200' },
    { label: 'Resolved',     value: stats.resolved,        icon: CheckCircle,    color: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { label: 'Total Users',  value: stats.total_users,     icon: Users,          color: 'text-stone-700',  bg: 'bg-stone-100',  border: 'border-stone-200' },
    { label: 'Verified',     value: stats.verified_users,  icon: Users,          color: 'text-brand-700',  bg: 'bg-brand-50',   border: 'border-brand-200' },
    { label: 'Total Upvotes',value: stats.total_upvotes,   icon: ThumbsUp,       color: 'text-rose-600',   bg: 'bg-rose-50',    border: 'border-rose-200' },
    { label: 'Comments',     value: stats.total_comments,  icon: MessageSquare,  color: 'text-teal-600',   bg: 'bg-teal-50',    border: 'border-teal-200' },
  ]

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Live overview — Rathinam Technical Campus</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl border ${s.bg} ${s.border} px-4 py-3`}
          >
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top issues by upvotes */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <h2 className="text-sm font-semibold text-gray-800">Trending Issues</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {(top_issues || []).map((issue) => (
              <div key={issue.id} className="flex items-start gap-3 px-5 py-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                  <span className="text-xs font-bold text-rose-600">
                    {issue.upvotes_count}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{issue.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StatusBadge status={issue.status} />
                    <span className="text-xs text-gray-400">{issue.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <Layers className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-semibold text-gray-800">Issues by Category</h2>
          </div>
          <div className="p-5 space-y-3">
            {Object.entries(issues_by_category || {}).map(([cat, count]) => {
              const total = Object.values(issues_by_category).reduce((a, b) => a + b, 0)
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 text-xs font-medium">{cat}</span>
                    <span className="text-gray-500 text-xs">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full bg-brand-600 rounded-full"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent issues */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <Clock className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-800">Recent Issues</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {(recent_issues || []).map((issue) => (
              <div key={issue.id} className="flex items-start gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{issue.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StatusBadge status={issue.status} />
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <CategoryBadge category={issue.category} />
              </div>
            ))}
          </div>
        </div>

        {/* Top locations */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Most Reported Locations</h2>
          </div>
          <div className="p-5 space-y-2">
            {Object.entries(issues_by_location || {}).slice(0, 6).map(([loc, count], i) => (
              <div key={loc} className="flex items-center gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1 text-gray-700 text-xs truncate">{loc}</span>
                <span className="text-xs text-gray-500 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-5 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
