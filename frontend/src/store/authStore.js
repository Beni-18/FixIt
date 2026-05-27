import { create } from 'zustand'

const stored = () => {
  try {
    const u = localStorage.getItem('fixit_user')
    return u ? JSON.parse(u) : null
  } catch { return null }
}

export const useAuthStore = create((set) => ({
  user:  stored(),
  token: localStorage.getItem('fixit_token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('fixit_token', token)
    localStorage.setItem('fixit_user', JSON.stringify(user))
    set({ user, token })
  },

  updateUser: (user) => {
    localStorage.setItem('fixit_user', JSON.stringify(user))
    set({ user })
  },

  clearAuth: () => {
    localStorage.removeItem('fixit_token')
    localStorage.removeItem('fixit_user')
    set({ user: null, token: null })
  },

  isAdmin:   () => stored()?.role === 'admin',
  isStudent: () => stored()?.role === 'student',
  isStaff:   () => stored()?.role === 'staff',
}))
