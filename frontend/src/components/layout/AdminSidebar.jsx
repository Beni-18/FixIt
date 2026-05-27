import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, AlertCircle, Users, Wrench } from 'lucide-react'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/issues', label: 'Issues', icon: AlertCircle },
  { to: '/admin/users', label: 'Users', icon: Users },
]

export function AdminSidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="hidden md:flex flex-col w-52 min-h-[calc(100vh-56px)] bg-white border-r border-gray-100 pt-4">
      <div className="px-4 mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin Panel</p>
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {links.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
                transition-colors ${active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto px-4 pb-6">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Wrench className="w-3.5 h-3.5" />
          <span>FixIT Admin v1.0</span>
        </div>
      </div>
    </aside>
  )
}
