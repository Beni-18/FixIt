import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wrench, Plus, User, LogOut, LayoutDashboard, Menu, X, FileText } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { logout } from '../../api/auth'
import toast from 'react-hot-toast'

export function Navbar() {
  const { user, clearAuth } = useAuthStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    try { await logout() } catch {}
    clearAuth()
    navigate('/')
    toast.success('Logged out')
  }

  const active     = (path) => location.pathname === path
  const adminActive = location.pathname.startsWith('/admin')

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#DCE4EF]"
      style={{ boxShadow: '0 1px 0 rgba(16,110,190,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all
            group-hover:scale-105"
            style={{ background: '#106EBE' }}>
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-stone-900 text-base">FixIT</span>
          <span className="text-stone-400 text-xs font-normal hidden sm:block">
            Rathinam TC
          </span>
        </Link>

        {/* Desktop nav */}
        {user && (
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/home" active={active('/home')}>Feed</NavLink>

            {user.role !== 'admin' && (
              <NavLink to="/my-reports" active={active('/my-reports')}>
                <FileText className="w-3.5 h-3.5" /> My Reports
              </NavLink>
            )}

            {user.role !== 'admin' && (
              <Link to="/raise">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
                    text-[#06111E] transition-all ml-1"
                  style={{
                    background:  '#0FFCBE',
                    boxShadow: '0 2px 10px rgba(15,252,190,0.35)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background  = '#44F0CA'
                    e.currentTarget.style.boxShadow   = '0 4px 18px rgba(15,252,190,0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background  = '#0FFCBE'
                    e.currentTarget.style.boxShadow   = '0 2px 10px rgba(15,252,190,0.35)'
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Report Issue
                </motion.button>
              </Link>
            )}

            {user.role === 'admin' && (
              <NavLink to="/admin" active={adminActive}>
                <LayoutDashboard className="w-3.5 h-3.5" /> Admin
              </NavLink>
            )}

            <NavLink to="/profile" active={active('/profile')}>
              <User className="w-3.5 h-3.5" />
              <span className="max-w-24 truncate">{user.name?.split(' ')[0]}</span>
              {!user.verified && user.role !== 'admin' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Identity not verified" />
              )}
            </NavLink>

            <button
              onClick={handleLogout}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100
                rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </nav>
        )}

        {/* Mobile hamburger */}
        {user && (
          <button
            onClick={() => setOpen(!open)}
            className="sm:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Mobile dropdown */}
      {open && user && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="sm:hidden border-t border-[#DCE4EF] bg-white px-4 py-3 flex flex-col gap-1"
        >
          <MobileLink to="/home" onClick={() => setOpen(false)}>Feed</MobileLink>
          {user.role !== 'admin' && (
            <MobileLink to="/my-reports" onClick={() => setOpen(false)}>My Reports</MobileLink>
          )}
          {user.role !== 'admin' && (
            <Link
              to="/raise"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold
                text-[#06111E] my-1"
              style={{ background: '#0FFCBE' }}
            >
              <Plus className="w-4 h-4" />
              Report Issue
            </Link>
          )}
          {user.role === 'admin' && (
            <MobileLink to="/admin" onClick={() => setOpen(false)}>Admin Panel</MobileLink>
          )}
          <MobileLink to="/profile" onClick={() => setOpen(false)}>My Profile</MobileLink>
          <button
            onClick={() => { setOpen(false); handleLogout() }}
            className="text-left text-sm text-crimson-600 px-3 py-2 rounded-lg hover:bg-crimson-50
              transition-colors"
          >
            Logout
          </button>
        </motion.div>
      )}
    </header>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
        transition-colors
        ${active
          ? 'bg-brand-50 text-brand-700'
          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}`}
    >
      {children}
    </Link>
  )
}

function MobileLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="text-sm text-stone-700 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
    >
      {children}
    </Link>
  )
}
