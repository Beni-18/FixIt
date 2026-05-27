import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminUsers, verifyUser, toggleUserActive, deleteUser } from '../../api/admin'
import { Button } from '../../components/ui/Button'
import { Search, CheckCircle, XCircle, Trash2, ShieldCheck, UserX } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const ROLES = ['', 'student', 'staff', 'admin']
const ROLE_LABELS = { '': 'All', student: 'Students', staff: 'Staff', admin: 'Admins' }

export function AdminUsers() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({ role: 'student', search: '', page: 1 })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => getAdminUsers(filters).then((r) => r.data),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })

  const { mutate: verify } = useMutation({
    mutationFn: (id) => verifyUser(id),
    onSuccess: () => { invalidate(); toast.success('Verification status updated') },
  })

  const { mutate: toggleActive } = useMutation({
    mutationFn: (id) => toggleUserActive(id),
    onSuccess: () => { invalidate(); toast.success('User status updated') },
  })

  const { mutate: remove } = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => { invalidate(); toast.success('User deleted') },
    onError: (err) => toast.error(err.response?.data?.error || 'Cannot delete'),
  })

  const users      = data?.data || []
  const pagination = data?.meta

  const totalStudents  = pagination?.total_entries || 0

  return (
    <div className="p-6 space-y-4 max-w-6xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          {filters.role === 'student' && (
            <p className="text-sm text-gray-500 mt-0.5">{totalStudents} registered students</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
            placeholder="Search name or email…"
            className="pl-9 pr-4 py-2 text-sm border border-[#E8E2DA] rounded-lg outline-none
              focus:border-brand-500 focus:ring-2 focus:ring-brand-100 w-56"
          />
        </div>
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setFilters((f) => ({ ...f, role: r, page: 1 }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${filters.role === r
                ? 'bg-brand-600 text-white'
                : 'bg-white text-stone-600 border border-[#E8E2DA] hover:border-brand-400'}`}
          >
            {ROLE_LABELS[r]}
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
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Student ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Verified</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center
                        text-xs font-semibold text-brand-700 flex-shrink-0">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-gray-500">{user.student_id || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize
                      ${user.role === 'admin' ? 'bg-brand-50 text-brand-700'
                        : user.role === 'staff' ? 'bg-stone-100 text-stone-700'
                        : 'bg-gray-100 text-gray-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.verified
                      ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                      : <XCircle className="w-4 h-4 text-gray-300" />}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${user.active ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {user.active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {user.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => verify(user.id)}
                            title={user.verified ? 'Revoke verification' : 'Verify user'}
                            className={`p-1.5 rounded-lg transition-colors
                              ${user.verified
                                ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleActive(user.id)}
                            title={user.active ? 'Suspend user' : 'Activate user'}
                            className={`p-1.5 rounded-lg transition-colors
                              ${user.active
                                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                                : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`}
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => confirm(`Delete ${user.name}?`) && remove(user.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    No users found.
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
    </div>
  )
}
