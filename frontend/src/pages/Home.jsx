import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getIssues } from '../api/issues'
import { IssueBoard } from '../components/issues/IssueBoard'
import { useAuthStore } from '../store/authStore'
import { Navbar } from '../components/layout/Navbar'
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

  // Quick stats from current data
  const stats = [
    { icon: AlertCircle, label: 'Open Issues',   value: issues.filter(i => i.status !== 'resolved').length, color: 'text-amber-600',  bg: 'bg-amber-50' },
    { icon: Clock,       label: 'In Progress',   value: issues.filter(i => i.status === 'being_resolved').length, color: 'text-sky-600', bg: 'bg-sky-50' },
    { icon: CheckCircle, label: 'Resolved',      value: issues.filter(i => i.status === 'resolved').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: TrendingUp,  label: 'Total Upvotes', value: issues.reduce((s, i) => s + i.upvotes_count, 0), color: 'text-brand-700',   bg: 'bg-brand-50' },
  ]

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Greeting banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'admin' ? 'Admin Overview' : `Hey, ${user?.name?.split(' ')[0]} 👋`}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {user?.role === 'admin'
                ? 'All campus issues, sorted by community priority.'
                : 'See what your campus is reporting. Upvote issues that affect you too.'}
            </p>
          </div>
          {user?.role !== 'admin' && (
            <Link to="/raise">
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm
                  font-medium rounded-xl shadow-sm hover:bg-brand-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Report Issue
              </motion.button>
            </Link>
          )}
        </motion.div>

        {/* Quick stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-xl ${s.bg} px-4 py-3 flex items-center gap-3`}
            >
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Board */}
        {!user?.verified && user?.role === 'student' && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <span className="text-amber-500">⚠️</span>
            <p className="text-sm text-amber-800">
              Your account is pending ID verification.{' '}
              <Link to="/profile" className="font-medium underline">Upload your ID card</Link> to get verified.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-gray-200 animate-pulse" />
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
  )
}
