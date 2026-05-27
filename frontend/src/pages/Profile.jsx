import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, CheckCircle, AlertTriangle, Edit2, Save, X, Shield } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getMe, updateProfile, uploadIdCard } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { Navbar } from '../components/layout/Navbar'
import { PageTransition } from '../components/layout/PageTransition'
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

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : '—'

  return (
    <PageTransition>
      <div className="min-h-screen" style={{ background: '#F0F4F9' }}>
        <Navbar />

        {/* ── Dark header strip ── */}
        <div
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #06111E 0%, #0B1D35 100%)' }}
        >
          {/* Dot grid */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          {/* Mint glow top-right */}
          <div className="absolute top-0 right-0 w-72 h-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at right center, rgba(15,252,190,0.09) 0%, transparent 65%)',
            }}
          />

          {/*
            IMAGE PLACEHOLDER — Profile cover photo
            Add a wide campus/abstract photo at: frontend/public/images/profile-cover.jpg
            Recommended size: 1200×240px
            Then uncomment the line below:
            <img src="/images/profile-cover.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none" />
          */}

          <div className="relative z-10 max-w-2xl mx-auto px-6 pt-8 pb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-5"
            >
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(15,252,190,0.2) 0%, rgba(16,110,190,0.3) 100%)',
                  border: '2px solid rgba(15,252,190,0.3)',
                }}
              >
                <span style={{ color: '#0FFCBE' }}>{user.name?.[0]?.toUpperCase()}</span>
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-black text-white tracking-tight truncate">{user.name}</h1>
                <p className="text-sm mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{user.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize"
                    style={{ background: 'rgba(15,252,190,0.15)', color: '#0FFCBE', border: '1px solid rgba(15,252,190,0.3)' }}
                  >
                    {user.role}
                  </span>
                  {user.verified ? (
                    <span
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: 'rgba(15,252,190,0.1)', color: '#0FFCBE', border: '1px solid rgba(15,252,190,0.2)' }}
                    >
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
                    >
                      <AlertTriangle className="w-3 h-3" /> Pending verification
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Quick-stat tiles */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { label: 'Department', value: user.department || '—' },
                { label: 'Student ID',  value: user.student_id  || '—' },
                { label: 'Member since', value: memberSince },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-xl p-3"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="text-sm font-bold text-white truncate">{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.36)' }}>{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content area ── */}
        <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">

          {/* Verification nudge (only when not verified) */}
          {!user.verified && user.role === 'student' && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
            >
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Upload your ID card to get verified</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Admin will review and approve your account so you can report and upvote issues.
                </p>
              </div>
            </motion.div>
          )}

          {/* Profile details card */}
          <div className="bg-white rounded-2xl border border-[#DCE4EF] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#DCE4EF] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-stone-700">Profile Details</h2>
              {!editing && (
                <button
                  onClick={startEdit}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: '#106EBE' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#EBF5FF' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              )}
            </div>

            <div className="p-5">
              {!editing ? (
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { label: 'Full Name',   value: user.name           || '—' },
                    { label: 'Phone',       value: user.phone          || '—' },
                    { label: 'Student ID',  value: user.student_id     || '—' },
                    { label: 'Department',  value: user.department     || '—' },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-xs text-stone-400 uppercase tracking-wide">{f.label}</p>
                      <p className="text-sm text-stone-800 font-medium mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
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
          <div className="bg-white rounded-2xl border border-[#DCE4EF] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#DCE4EF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-stone-400" />
                <h2 className="text-sm font-semibold text-stone-700">College ID Verification</h2>
              </div>
              {user.verified && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>

            <div className="p-5 space-y-4">
              {user.id_card_url ? (
                <div className="space-y-2">
                  <img src={user.id_card_url} alt="ID Card" className="w-full rounded-xl border border-[#DCE4EF] object-cover max-h-48" />
                  <p className="text-xs text-stone-400">
                    {user.verified ? 'Your ID card has been verified by admin.' : 'Uploaded — awaiting admin review.'}
                  </p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => cameraRef.current?.click()}
                    disabled={uploading}
                    className="flex-1 flex items-center justify-center gap-2 py-6 border-2 border-dashed
                      border-[#DCE4EF] rounded-xl text-sm text-stone-500 transition-colors disabled:opacity-50"
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0FFCBE'; e.currentTarget.style.color = '#106EBE' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#DCE4EF'; e.currentTarget.style.color = '' }}
                  >
                    <Camera className="w-4 h-4" /> Take Photo
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex-1 flex items-center justify-center gap-2 py-6 border-2 border-dashed
                      border-[#DCE4EF] rounded-xl text-sm text-stone-500 transition-colors disabled:opacity-50"
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0FFCBE'; e.currentTarget.style.color = '#106EBE' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#DCE4EF'; e.currentTarget.style.color = '' }}
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

              {/* Hidden file inputs */}
              <input ref={cameraRef} type="file" accept="image/*" capture="environment"
                className="hidden" onChange={(e) => handleIdCard(e.target.files[0])} />
              <input ref={fileRef} type="file" accept="image/*"
                className="hidden" onChange={(e) => handleIdCard(e.target.files[0])} />

              <p className="text-xs text-stone-400">
                Upload a clear photo of your Rathinam Technical Campus student ID card.
                Your data is kept secure and used only for identity verification.
              </p>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  )
}
