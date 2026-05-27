import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getIssues } from '../api/issues'
import { IssueBoard } from '../components/issues/IssueBoard'
import { useAuthStore } from '../store/authStore'
import { Navbar } from '../components/layout/Navbar'
import { PageTransition } from '../components/layout/PageTransition'
import { ChatBot } from '../components/chat/ChatBot'
import { Plus, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export function Home() {
  const { user } = useAuthStore()
  const [filters, setFilters] = useState({ status: '', category: '', page: 1 })

  const { data, isLoading } = useQuery({
    queryKey: ['issues', filters],
    queryFn: () => getIssues(filters).then((r) => r.data),
    keepPreviousData: true,
  })

  const issues     = data?.data || []
  const pagination = data?.meta

  const stats = [
    { Icon: AlertCircle, label: 'Open',        value: issues.filter(i => i.status !== 'resolved').length },
    { Icon: Clock,       label: 'In Progress',  value: issues.filter(i => i.status === 'being_resolved').length },
    { Icon: CheckCircle, label: 'Resolved',     value: issues.filter(i => i.status === 'resolved').length },
    { Icon: TrendingUp,  label: 'Total Upvotes',value: issues.reduce((s, i) => s + i.upvotes_count, 0) },
  ]

  return (
    <PageTransition>
      <div className="min-h-screen" style={{ background: '#F0F4F9' }}>
        <Navbar />

        {/* ── Dark header strip — same language as landing ── */}
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
          {/* Mint glow top-right */}
          <div className="absolute top-0 right-0 w-72 h-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at right center, rgba(15,252,190,0.09) 0%, transparent 65%)',
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 pt-6 pb-8">
            {/* Greeting row */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start justify-between mb-6"
            >
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {user?.role === 'admin'
                    ? 'Admin Overview'
                    : `Hey, ${user?.name?.split(' ')[0]}`}
                </h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  {user?.role === 'admin'
                    ? 'All campus issues, sorted by community priority.'
                    : 'See what your campus is reporting. Upvote issues that affect you.'}
                </p>
              </div>

              {user?.role !== 'admin' && (
                <Link to="/raise">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                      text-xs font-bold text-[#06111E] flex-shrink-0 ml-4"
                    style={{
                      background: '#0FFCBE',
                      boxShadow: '0 2px 14px rgba(15,252,190,0.38)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background  = '#44F0CA'
                      e.currentTarget.style.boxShadow   = '0 4px 22px rgba(15,252,190,0.52)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background  = '#0FFCBE'
                      e.currentTarget.style.boxShadow   = '0 2px 14px rgba(15,252,190,0.38)'
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Report Issue
                  </motion.button>
                </Link>
              )}
            </motion.div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(15,252,190,0.1)' }}>
                    <s.Icon className="w-4 h-4" style={{ color: '#0FFCBE' }} />
                  </div>
                  <div>
                    <div className="text-xl font-black tabular-nums text-white">{s.value}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.36)' }}>{s.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Board area ── */}
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
          {/* Verification warning */}
          {!user?.verified && user?.role === 'student' && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-800">
                Your account is pending ID verification.{' '}
                <Link to="/profile" className="font-medium underline">Upload your ID card</Link> to get verified.
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 pt-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-48 rounded-lg animate-pulse"
                  style={{ background: '#DCE4EF' }} />
              ))}
            </div>
          ) : (
            <IssueBoard
              issues={issues}
              filters={filters}
              onFilterChange={setFilters}
              pagination={pagination}
              onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            />
          )}
        </main>

        <ChatBot />
      </div>
    </PageTransition>
  )
}
