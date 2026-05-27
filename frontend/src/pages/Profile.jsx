import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, CheckCircle, AlertTriangle, User, Edit2, Save, X } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getMe, updateProfile, uploadIdCard } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { Navbar } from '../components/layout/Navbar'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import toast from 'react-hot-toast'

export function Profile() {
  const { user: storeUser, updateUser } = useAuthStore()
  const cameraRef = useRef()
  const fileRef = useRef()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)

  const { data: user, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: () => getMe().then((r) => r.data),
    initialData: storeUser,
    onSuccess: (data) => updateUser(data),
  })

  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationFn: () => updateProfile(form),
    onSuccess: (res) => {
      updateUser(res.data)
      setEditing(false)
      toast.success('Profile updated')
      refetch()
    },
    onError: () => toast.error('Could not update profile'),
  })

  const { mutate: uploadCard, isPending: uploading } = useMutation({
    mutationFn: (file) => uploadIdCard(file),
    onSuccess: () => {
      toast.success('ID card uploaded! Awaiting admin verification.')
      refetch()
    },
    onError: () => toast.error('Upload failed. Try again.'),
  })

  const startEdit = () => {
    setForm({ name: user.name, phone: user.phone || '', department: user.department || '', student_id: user.student_id || '' })
    setEditing(true)
  }

  const handleIdCard = (file) => {
    if (!file) return
    uploadCard(file)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>

        {/* Verification banner */}
        {!user.verified ? (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
          >
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Identity not verified</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Upload your college ID card below to verify your identity as a Rathinam student.
                Admin will review and approve.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <p className="text-sm text-emerald-800 font-medium">Identity verified</p>
          </div>
        )}

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Avatar header */}
          <div className="bg-brand-600 px-6 py-8 flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="text-white">
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-brand-200 text-sm">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs capitalize">
                {user.role}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {!editing ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Student ID', value: user.student_id || '—' },
                    { label: 'Department', value: user.department || '—' },
                    { label: 'Phone', value: user.phone || '—' },
                    { label: 'Member since', value: user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{f.label}</p>
                      <p className="text-sm text-gray-800 font-medium mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" size="sm" onClick={startEdit}>
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <Input label="Full name" value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Student ID" value={form.student_id}
                    onChange={(e) => setForm((p) => ({ ...p, student_id: e.target.value }))} />
                  <Input label="Department" value={form.department}
                    onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} />
                </div>
                <Input label="Phone" value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveProfile} loading={saving}>
                    <Save className="w-3.5 h-3.5" /> Save
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
                    <X className="w-3.5 h-3.5" /> Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ID Verification card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">College ID Verification</h2>
            {user.verified && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Verified
              </span>
            )}
          </div>

          {user.id_card_url ? (
            <div className="space-y-2">
              <img src={user.id_card_url} alt="ID Card" className="w-full rounded-xl border object-cover max-h-48" />
              <p className="text-xs text-gray-500">
                {user.verified ? 'Your ID card has been verified by admin.' : 'Uploaded. Awaiting admin review.'}
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => cameraRef.current?.click()}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 py-6 border-2 border-dashed
                  border-[#E8E2DA] rounded-xl text-sm text-stone-500 hover:border-brand-400
                  hover:text-brand-700 transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4" /> Take Photo of ID
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 py-6 border-2 border-dashed
                  border-[#E8E2DA] rounded-xl text-sm text-stone-500 hover:border-brand-400
                  hover:text-brand-700 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Upload ID Card
              </button>
            </div>
          )}

          {/* Camera capture (mobile) */}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment"
            className="hidden" onChange={(e) => handleIdCard(e.target.files[0])} />
          <input ref={fileRef} type="file" accept="image/*"
            className="hidden" onChange={(e) => handleIdCard(e.target.files[0])} />

          <p className="text-xs text-gray-400">
            Upload a clear photo of your Rathinam Technical Campus student ID card.
            Your personal data is kept secure and used only for identity verification.
          </p>
        </div>
      </main>
    </div>
  )
}
