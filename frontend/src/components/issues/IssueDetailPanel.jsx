import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, MapPin, ThumbsUp, Send, Clock, ChevronRight, Edit2, Trash2, Save } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getIssue, addComment, deleteComment, toggleUpvote, updateIssue, deleteIssue } from '../../api/issues'
import { StatusBadge, CategoryBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { useAuthStore } from '../../store/authStore'
import { formatDistanceToNow, format } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_STEPS  = ['raised', 'processed', 'being_resolved', 'resolved']
const STEP_LABELS   = { raised: 'Raised', processed: 'Processed', being_resolved: 'In Progress', resolved: 'Resolved' }

const CATEGORIES = [
  'Classroom Equipment', 'Electrical', 'Wi-Fi / Network',
  'Plumbing', 'Sanitation', 'Security', 'Furniture', 'Other',
]
const LOCATIONS = [
  'Block A', 'Block B', 'Block C', 'Block D',
  'Computer Lab 1', 'Computer Lab 2', 'Computer Lab 3',
  'Seminar Hall', 'Library', 'Cafeteria', 'Hostel Block',
  'Sports Ground', 'Main Road', 'Parking Area', 'Other',
]

export function IssueDetailPanel({ issueId, onClose }) {
  const { user }       = useAuthStore()
  const queryClient    = useQueryClient()
  const [comment,  setComment]  = useState('')
  const [editing,  setEditing]  = useState(false)
  const [editForm, setEditForm] = useState({ title: '', description: '', location: '', category: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: () => getIssue(issueId).then((r) => r.data),
  })

  const issue = data

  // Populate edit form when issue loads
  useEffect(() => {
    if (issue) setEditForm({
      title:       issue.title,
      description: issue.description,
      location:    issue.location,
      category:    issue.category,
    })
  }, [issue?.id])

  const { mutate: vote } = useMutation({
    mutationFn: () => toggleUpvote(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] })
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })

  const { mutate: postComment, isPending: posting } = useMutation({
    mutationFn: () => addComment(issueId, comment),
    onSuccess: () => {
      setComment('')
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] })
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
    onError: () => toast.error('Failed to post comment'),
  })

  const { mutate: removeComment } = useMutation({
    mutationFn: (cid) => deleteComment(issueId, cid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issue', issueId] }),
  })

  const { mutate: saveEdit, isPending: saving } = useMutation({
    mutationFn: () => updateIssue(issueId, editForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] })
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      setEditing(false)
      toast.success('Issue updated')
    },
    onError: (err) => toast.error(err.response?.data?.errors?.[0] || 'Update failed'),
  })

  const { mutate: removeIssue } = useMutation({
    mutationFn: () => deleteIssue(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      onClose()
      toast.success('Issue deleted')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Could not delete'),
  })

  const isOwner = user?.id === issue?.user?.id

  const setField = (k) => (e) => setEditForm((p) => ({ ...p, [k]: e.target.value }))

  return (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50
          flex flex-col overflow-hidden"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E2DA]">
          <h2 className="text-sm font-semibold text-stone-700">
            {editing ? 'Edit Issue' : 'Issue Detail'}
          </h2>
          <div className="flex items-center gap-1">
            {isOwner && !editing && !isLoading && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  title="Edit this issue"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this issue? This cannot be undone.')) removeIssue()
                  }}
                  title="Delete issue"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-crimson-600 hover:bg-crimson-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            {editing && (
              <button
                onClick={() => setEditing(false)}
                className="text-xs text-stone-400 hover:text-stone-600 px-2 py-1 rounded-lg
                  hover:bg-stone-100 mr-1 transition-colors"
              >
                Cancel
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
              <X className="w-4 h-4 text-stone-500" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : issue ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-5">

              {editing ? (
                /* ── Edit form ──────────────────────────────────── */
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-amber-700 font-medium">Editing your issue</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-stone-600">Title</label>
                    <input
                      value={editForm.title}
                      onChange={setField('title')}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8E2DA]
                        focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                      maxLength={120}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-stone-600">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={setField('description')}
                      rows={4}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8E2DA] resize-none
                        focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-stone-600">Location</label>
                      <select
                        value={editForm.location}
                        onChange={setField('location')}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8E2DA]
                          focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none bg-white"
                      >
                        {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-stone-600">Category</label>
                      <select
                        value={editForm.category}
                        onChange={setField('category')}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[#E8E2DA]
                          focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none bg-white"
                      >
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={saveEdit}
                    loading={saving}
                    className="w-full justify-center"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </Button>
                </div>
              ) : (
                /* ── View mode ──────────────────────────────────── */
                <>
                  {/* Title & badges */}
                  <div className="space-y-2">
                    <h1 className="text-lg font-semibold text-stone-900 leading-tight">{issue.title}</h1>
                    <div className="flex flex-wrap gap-1.5">
                      <StatusBadge status={issue.status} />
                      <CategoryBadge category={issue.category} />
                    </div>
                  </div>

                  {/* Location + upvote */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-stone-500">
                      <MapPin className="w-3.5 h-3.5" /> {issue.location}
                    </span>
                    <button
                      onClick={() => user ? vote() : toast.error('Log in to upvote')}
                      className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg
                        transition-colors border
                        ${issue.user_voted
                          ? 'bg-brand-50 text-brand-700 border-brand-200'
                          : 'bg-white text-stone-600 border-[#E8E2DA] hover:border-brand-400'}`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${issue.user_voted ? 'fill-brand-600' : ''}`} />
                      {issue.upvotes_count}
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-stone-700 leading-relaxed">{issue.description}</p>

                  {/* Photo */}
                  {issue.photo_url && (
                    <img src={issue.photo_url} alt="Issue" className="w-full rounded-lg border object-cover max-h-48" />
                  )}

                  {/* Reported by + time */}
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Reported by <span className="font-medium text-stone-600">{issue.user?.name}</span>
                      {' · '}
                      {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Status timeline */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Status</h3>
                    {/* Progress bar */}
                    <div className="flex items-center gap-1 mb-2">
                      {STATUS_STEPS.map((step, i) => {
                        const currentIdx = STATUS_STEPS.indexOf(issue.status)
                        const done = i <= currentIdx
                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs
                              flex-shrink-0 transition-colors
                              ${done ? 'bg-brand-600 text-white' : 'bg-stone-100 text-stone-400 border border-stone-200'}`}>
                              {done ? '✓' : i + 1}
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div className={`h-0.5 flex-1 mx-1 ${i < currentIdx ? 'bg-brand-600' : 'bg-stone-200'}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] text-stone-400">
                      {STATUS_STEPS.map((s) => <span key={s}>{STEP_LABELS[s]}</span>)}
                    </div>

                    {/* Log entries */}
                    {issue.issue_status_logs?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {issue.issue_status_logs.map((log) => (
                          <div key={log.id} className="flex items-start gap-2 text-xs text-stone-600">
                            <ChevronRight className="w-3 h-3 mt-0.5 text-brand-500 flex-shrink-0" />
                            <div>
                              <span className="font-medium">{STEP_LABELS[log.from_status]}</span>
                              {' → '}
                              <span className="font-medium">{STEP_LABELS[log.to_status]}</span>
                              <span className="text-stone-400 ml-1">
                                by {log.changed_by?.name} · {format(new Date(log.created_at), 'dd MMM, h:mm a')}
                              </span>
                              {log.note && <p className="text-stone-500 mt-0.5 italic">"{log.note}"</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Comments */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                      Comments ({issue.comments?.length || 0})
                    </h3>
                    <div className="space-y-3">
                      {(issue.comments || []).map((c) => (
                        <div key={c.id} className="flex gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center
                            text-xs font-semibold text-brand-700 flex-shrink-0">
                            {c.user?.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 bg-stone-50 rounded-lg px-3 py-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-stone-700">{c.user?.name}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-stone-400">
                                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                                </span>
                                {user?.id === c.user?.id && (
                                  <button onClick={() => removeComment(c.id)}
                                    className="text-xs text-rose-400 hover:text-rose-600">delete</button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-stone-700">{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}

        {/* Comment input */}
        {user && !editing && (
          <div className="border-t border-[#E8E2DA] p-4">
            <div className="flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && comment.trim() && postComment()}
                placeholder="Add a comment…"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#E8E2DA]
                  focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              />
              <Button size="sm" onClick={() => comment.trim() && postComment()}
                loading={posting} disabled={!comment.trim()}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  )
}
