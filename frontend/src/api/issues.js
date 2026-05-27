import api from './axios'

export const getIssues = (params) =>
  api.get('/issues', { params })

export const getIssue = (id) =>
  api.get(`/issues/${id}`)

export const createIssue = (data) => {
  const form = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) form.append(`issue[${k}]`, v)
  })
  return api.post('/issues', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const updateIssue = (id, data) =>
  api.patch(`/issues/${id}`, { issue: data })

export const deleteIssue = (id) =>
  api.delete(`/issues/${id}`)

export const toggleUpvote = (issueId) =>
  api.post(`/issues/${issueId}/upvote`)

export const addComment = (issueId, content) =>
  api.post(`/issues/${issueId}/comments`, { comment: { content } })

export const updateComment = (issueId, commentId, content) =>
  api.patch(`/issues/${issueId}/comments/${commentId}`, { comment: { content } })

export const deleteComment = (issueId, commentId) =>
  api.delete(`/issues/${issueId}/comments/${commentId}`)
