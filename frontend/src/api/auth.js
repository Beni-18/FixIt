import api from './axios'

export const login = (email, password) =>
  api.post('/auth/login', { user: { email, password } })

export const register = (data) =>
  api.post('/auth/register', { user: data })

export const logout = () =>
  api.delete('/auth/logout')

export const getMe = () =>
  api.get('/auth/me')

export const updateProfile = (data) =>
  api.patch('/auth/profile', { user: data })

export const uploadIdCard = (file) => {
  const form = new FormData()
  form.append('id_card_image', file)
  // Do NOT set Content-Type manually — the browser must set it so it includes
  // the multipart boundary (e.g. "multipart/form-data; boundary=----XYZ").
  // Setting it explicitly without the boundary causes Rails to reject the body.
  // Setting to undefined removes the instance-level "application/json" default.
  return api.post('/auth/upload_id_card', form, {
    headers: { 'Content-Type': undefined },
  })
}
