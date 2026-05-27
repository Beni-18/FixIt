import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminIssues, updateIssueStatus, assignStaff, deleteAdminIssue, getStaffList } from '../../api/admin'
import { StatusBadge, CategoryBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronRight, Trash2, UserCheck, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_NEXT = {
  raised:         { next: 'processed',      label: 'Mark Processed' },
  processed:      { next: 'being_resolved', label: 'Mark In Progress' },
  being_resolved: { next: 'resolved',       label: 'Mark Resolved' },
}

const STATUSES = ['', 'raised', 'processed', 'being_resolved', 'resolved']
const STATUS_LABELS = { '': 'All', raised: 'Raised', processed: 'Processed', being_resolved: 'In Progress', resolved: 'Resolved' }

export function AdminIssues() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({ status: '', search: '', page: 1 })
  const [selected, setSelected] = useState(null)
  const [noteMap, setNoteMap] = useState({})

  const { data, isLoading } = useQuery({
    queryKey: ['admin-issues', filters],
    queryFn: () => getAdminIssues(filters).then((r) => r.data),
  })

  const { data: staffData } = useQuery({
    queryKey: ['staff-list'],
    queryFn: () => getStaffList().then((r) => r.data),
  })

  const { mutate: advance, isPending: advancing } = useMutation({
    mutationFn: ({ id, status, note }) => updateIssueStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-issues'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      toast.success('Status updated')
      setSelected(null)
    },
    onError: (err) => toast.error(err.response?.data?.errors?.[0] || 'Failed to update status'),
  })

  const { mutate: assign } = useMutation({
    mutationFn: ({ issueId, staffId }) => assignStaff(issueId, staffId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-issues'] }); toast.success('Staff assigned') },
    onError: () => toast.error('Could not assign staff'),
  })

  const { mutate: remove } = useMutation({
    mutationFn: (id) => deleteAdminIssue(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-issues'] }); toast.success('Issue deleted') },
    onError: () => toast.error('Could not delete issue'),
  })

  const issues     = data?.data || []
  const pagination = data?.meta
  const staffList  = staffData || []

  return (
    <div className="p-6 space-y-4 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900">Issues Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
            placeholder="Search issues…"
            className="pl-9 pr-4 py-2 text-sm border border-[#E8E2DA] rounded-lg focus:border-brand-500
              focus:ring-2 focus:ring-brand-100 outline-none w-56"
          />
        </div>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilters((f) => ({ ...f, status: s, page: 1 }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${filters.status === s
                ? 'bg-brand-600 text-white'
                : 'bg-white text-stone-600 border border-[#E8E2DA] hover:border-brand-400'}`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Issue</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Votes</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 line-clamp-1">{issue.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{issue.location} · {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <CategoryBadge category={issue.category} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={issue.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-gray-700">{issue.upvotes_count}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelected(selected?.id === issue.id ? null : issue)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-700
                          bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
                      >
                        <ChevronRight className="w-3 h-3" /> Manage
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this issue?')) remove(issue.id)
                        }}
                        className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {issues.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                    No issues found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setFilters((f) => ({ ...f, page }))}
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

      {/* Manage panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white rounded-2xl border border-brand-200 shadow-md p-5 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{selected.title}</h3>
                <StatusBadge status={selected.status} className="mt-1" />
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
            </div>

            {/* Advance status */}
            {STATUS_NEXT[selected.status] && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Note (optional)</label>
                <input
                  value={noteMap[selected.id] || ''}
                  onChange={(e) => setNoteMap((p) => ({ ...p, [selected.id]: e.target.value }))}
                  placeholder="Add a note about this status change…"
                  className="w-full px-3 py-2 text-sm border border-[#E8E2DA] rounded-lg
                    focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                />
                <Button
                  size="sm"
                  loading={advancing}
                  onClick={() => advance({
                    id: selected.id,
                    status: STATUS_NEXT[selected.status].next,
                    note: noteMap[selected.id],
                  })}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  {STATUS_NEXT[selected.status].label}
                </Button>
              </div>
            )}

            {/* Assign staff */}
            {staffList.length > 0 && selected.status !== 'resolved' && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-600">Assign to staff</p>
                <div className="flex flex-wrap gap-2">
                  {staffList.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => assign({ issueId: selected.id, staffId: s.id })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                        bg-stone-50 border border-[#E8E2DA] rounded-lg hover:border-brand-400
                        hover:bg-brand-50 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
