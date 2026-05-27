import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

import { Landing }        from './pages/Landing'
import { Home }           from './pages/Home'
import { RaiseComplaint } from './pages/RaiseComplaint'
import { Profile }        from './pages/Profile'
import { AdminLayout }    from './pages/admin/AdminLayout'
import { Dashboard }      from './pages/admin/Dashboard'
import { AdminIssues }    from './pages/admin/AdminIssues'
import { AdminUsers }     from './pages/admin/AdminUsers'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

function RequireAuth({ children }) {
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/" replace />
}

/* Group top-level path segments so admin sub-routes share the same
   transition key — avoids AdminLayout remounting on tab switches */
function routeKey(pathname) {
  return '/' + pathname.split('/')[1]
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={routeKey(location.pathname)}>
        <Route path="/" element={<Landing />} />

        <Route path="/home" element={
          <RequireAuth><Home /></RequireAuth>
        } />

        <Route path="/raise" element={
          <RequireAuth><RaiseComplaint /></RequireAuth>
        } />

        <Route path="/profile" element={
          <RequireAuth><Profile /></RequireAuth>
        } />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="issues" element={<AdminIssues />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnimatedRoutes />

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontSize: '13px',
              borderRadius: '10px',
              border: '1px solid #DCE4EF',
            },
            success: { iconTheme: { primary: '#0FFCBE', secondary: '#06111E' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff'   } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
