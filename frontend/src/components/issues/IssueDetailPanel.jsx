import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, MapPin, ThumbsUp, Send, Clock, ChevronRight, Edit2, Trash2, Save,
  Monitor, Wifi, Zap, Droplets, Wind, Shield, Armchair, HelpCircle } from 'lucide-react'
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
  { label: 'Classroom Equipment', Icon: Monitor  },
  { label: 'Electrical',          Icon: Zap      },
  { label: 'Wi-Fi / Network',     Icon: Wifi     },
  { label: 'Plumbing',            Icon: Droplets },
  { label: 'Sanitation',          Icon: Wind     },
  { label: 'Security',            Icon: Shield   },
  { label: 'Furniture',           Icon: Armchair },
  { label: 'Other',               Icon: HelpCircle },
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
        <div
          className="flex items-start justify-between px-5 py-4 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #06111E 0%, #0B1D35 100%)' }}
        >
          <div className="flex-1 min-w-0 mr-3">
            {!editing && issue && (
              <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: 'rgba(15,252,190,0.7)' }}>
                {issue.category}
              </p>
            )}
            <h2 className="text-sm font-semibold text-white leading-snug">
              {editing ? 'Edit Issue' : (issue?.title || 'Issue Detail')}
            </h2>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {isOwner && !editing && !isLoading && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  title="Edit this issue"
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#0FFCBE'; e.currentTarget.style.background = 'rgba(15,252,190,0.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'transparent' }}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this issue? This cannot be undone.')) removeIssue()
                  }}
                  title="Delete issue"
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'transparent' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            {editing && (
              <button
                onClick={() => setEditing(false)}
                className="text-xs px-2 py-1 rounded-lg mr-1 transition-colors"
                style={{ color: 'rgba(255,255,255,0.45)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'transparent' }}
              >
                Cancel
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'rgba(255,255,255,0.45)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'transparent' }}
            >
              <X className="w-4 h-4" />
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
                <motion.div
                  key="edit-form"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  {/* Title */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                        Title
                      </label>
                      <span className="text-[10px] tabular-nums" style={{ color: 'rgba(0,0,0,0.28)' }}>
                        {editForm.title.length}/120
                      </span>
                    </div>
                    <input
                      value={editForm.title}
                      onChange={setField('title')}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white text-stone-900 outline-none transition-all"
                      style={{ border: '2px solid #DCE4EF' }}
                      onFocus={(e) => { e.target.style.borderColor = '#0FFCBE'; e.target.style.boxShadow = '0 0 0 4px rgba(15,252,190,0.08)' }}
                      onBlur={(e)  => { e.target.style.borderColor = '#DCE4EF'; e.target.style.boxShadow = 'none' }}
                      maxLength={120}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={setField('description')}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white text-stone-900 outline-none transition-all resize-none"
                      style={{ border: '2px solid #DCE4EF' }}
                      onFocus={(e) => { e.target.style.borderColor = '#0FFCBE'; e.target.style.boxShadow = '0 0 0 4px rgba(15,252,190,0.08)' }}
                      onBlur={(e)  => { e.target.style.borderColor = '#DCE4EF'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                      Location
                    </label>
                    <select
                      value={editForm.location}
                      onChange={setField('location')}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white text-stone-900 outline-none transition-all cursor-pointer"
                      style={{ border: '2px solid #DCE4EF' }}
                      onFocus={(e) => { e.target.style.borderColor = '#0FFCBE' }}
                      onBlur={(e)  => { e.target.style.borderColor = '#DCE4EF' }}
                    >
                      {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  {/* Category pills */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                      Category
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map(({ label, Icon: CatIcon }) => {
                        const active = editForm.category === label
                        return (
                          <motion.button
                            key={label}
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setEditForm((p) => ({ ...p, category: label }))}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left"
                            style={{
                              border:     `2px solid ${active ? '#0FFCBE' : '#DCE4EF'}`,
                              background:  active ? 'rgba(15,252,190,0.07)' : 'white',
                              color:       active ? '#0A569B' : '#64748b',
                              boxShadow:   active ? '0 0 0 3px rgba(15,252,190,0.12)' : 'none',
                            }}
                          >
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                              style={{ background: active ? 'rgba(15,252,190,0.18)' : '#F0F4F9' }}
                            >
                              <CatIcon className="w-3.5 h-3.5"
                                style={{ color: active ? '#0FFCBE' : '#94a3b8' }} />
                            </div>
                            <span className="truncate">{label.split(' / ')[0]}</span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Save */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={saveEdit}
                    disabled={saving}
                    className="w-full py-3 rounded-xl text-sm font-bold text-[#06111E]
                      flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                    style={{ background: '#0FFCBE', boxShadow: '0 2px 14px rgba(15,252,190,0.28)' }}
                    onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = '#44F0CA' }}
                    onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = '#0FFCBE' }}
                  >
                    {saving
                      ? <div className="w-4 h-4 border-2 border-[#06111E]/30 border-t-[#06111E] rounded-full animate-spin" />
                      : <Save className="w-4 h-4" />}
                    {saving ? 'Saving…' : 'Save Changes'}
                  </motion.button>
                </motion.div>
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
