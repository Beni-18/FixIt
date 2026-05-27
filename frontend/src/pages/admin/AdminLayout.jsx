import { Outlet, Navigate } from 'react-router-dom'
import { Navbar } from '../../components/layout/Navbar'
import { AdminSidebar } from '../../components/layout/AdminSidebar'
import { useAuthStore } from '../../store/authStore'

export function AdminLayout() {
  const { user } = useAuthStore()

  if (!user || user.role !== 'admin') {
    return <Navigate to="/home" replace />
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <Navbar />
      <div className="flex max-w-screen-2xl mx-auto">
        <AdminSidebar />
        <main className="flex-1 min-w-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
