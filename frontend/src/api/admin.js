import api from './axios'

export const getDashboard = () =>
  api.get('/admin/dashboard')

export const getAdminIssues = (params) =>
  api.get('/admin/issues', { params })

export const getAdminIssue = (id) =>
  api.get(`/admin/issues/${id}`)

export const updateIssueStatus = (id, status, note) =>
  api.patch(`/admin/issues/${id}/status`, { status, note })

export const assignStaff = (issueId, staffId, note) =>
  api.post(`/admin/issues/${issueId}/assign_staff`, { staff_id: staffId, note })

export const deleteAdminIssue = (id) =>
  api.delete(`/admin/issues/${id}`)

export const getAdminUsers = (params) =>
  api.get('/admin/users', { params })

export const getAdminUser = (id) =>
  api.get(`/admin/users/${id}`)

export const verifyUser = (id) =>
  api.patch(`/admin/users/${id}/verify`)

export const toggleUserActive = (id) =>
  api.patch(`/admin/users/${id}/toggle_active`)

export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`)

export const getStaffList = () =>
  api.get('/admin/staff_list')
