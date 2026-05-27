import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Camera, Upload, X, ArrowLeft, MapPin, ArrowRight,
  Monitor, Wifi, Zap, Droplets, Wind, Shield, Armchair, HelpCircle,
  Wrench,
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createIssue } from '../api/issues'
import { Navbar } from '../components/layout/Navbar'
import { PageTransition } from '../components/layout/PageTransition'
import toast from 'react-hot-toast'

const CATEGORY_OPTIONS = [
  { Icon: Monitor,    label: 'Classroom',  value: 'Classroom Equipment' },
  { Icon: Zap,        label: 'Electrical', value: 'Electrical' },
  { Icon: Wifi,       label: 'Wi-Fi',      value: 'Wi-Fi / Network' },
  { Icon: Droplets,   label: 'Plumbing',   value: 'Plumbing' },
  { Icon: Wind,       label: 'Sanitation', value: 'Sanitation' },
  { Icon: Shield,     label: 'Security',   value: 'Security' },
  { Icon: Armchair,   label: 'Furniture',  value: 'Furniture' },
  { Icon: HelpCircle, label: 'Other',      value: 'Other' },
]

const LOCATIONS = [
  'Block A', 'Block B', 'Block C', 'Block D',
  'Computer Lab 1', 'Computer Lab 2', 'Computer Lab 3',
  'Seminar Hall', 'Library', 'Cafeteria', 'Hostel Block',
  'Sports Ground', 'Main Road', 'Parking Area', 'Other',
]

function FieldLabel({ children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-3">
      {children}
    </p>
  )
}

function FieldError({ msg }) {
  if (!msg) return null
  return <p className="text-xs text-crimson-600 mt-1.5">{msg}</p>
}

export function RaiseComplaint() {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const fileInputRef = useRef()
  const cameraInputRef = useRef()

  const [form, setForm] = useState({
    title: '', description: '', location: '', category: '',
  })
  const [photo,   setPhoto]   = useState(null)
  const [preview, setPreview] = useState(null)
  const [errors,  setErrors]  = useState({})

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }))
    setErrors((p) => ({ ...p, [k]: '' }))
  }

  const setCategory = (v) => {
    setForm((p) => ({ ...p, category: v }))
    setErrors((p) => ({ ...p, category: '' }))
  }

  const handlePhoto = (file) => {
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () => createIssue({ ...form, photo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      toast.success('Issue reported! The community can now see and upvote it.')
      navigate('/home')
    },
    onError: (err) => {
      const errs = err.response?.data?.errors || []
      const errMap = {}
      errs.forEach((e) => {
        if (e.toLowerCase().includes('title'))            errMap.title       = e
        else if (e.toLowerCase().includes('description')) errMap.description = e
        else if (e.toLowerCase().includes('location'))    errMap.location    = e
        else if (e.toLowerCase().includes('category'))    errMap.category    = e
      })
      setErrors(errMap)
      if (errs.length > 0) toast.error(errs[0])
    },
  })

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title       = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.location)           e.location    = 'Location is required'
    if (!form.category)           e.category    = 'Select a category'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) submit()
  }

  return (
    <PageTransition>
    <div className="min-h-screen" style={{ background: '#F0F4F9' }}>
      <Navbar />

      {/* Page header */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #06111E 0%, #0B1D35 60%, #106EBE 100%)' }}
      >
        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        {/* Mint glow */}
        <div className="absolute bottom-0 right-24 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(15,252,190,0.12) 0%, transparent 70%)',
            filter: 'blur(32px)',
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-5 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-medium mb-5 transition-colors"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/15"
              style={{ background: 'rgba(16,110,190,0.5)' }}>
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Report a Campus Issue
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Your report goes live on the board. The community upvotes what matters.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-5 py-8">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-5"
        >

          {/* Section: What's the issue? */}
          <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
            <FieldLabel>What's the issue?</FieldLabel>

            <div>
              <input
                className={`w-full px-4 py-3 rounded-xl border text-sm bg-stone-50 text-stone-900
                  placeholder-stone-400 outline-none transition-all font-medium
                  ${errors.title
                    ? 'border-crimson-300 focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100'
                    : 'border-stone-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white'}`}
                placeholder="Short descriptive title — e.g. Projector not working in Room 301"
                value={form.title}
                onChange={set('title')}
                maxLength={120}
              />
              <FieldError msg={errors.title} />
            </div>

            <div>
              <textarea
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border text-sm bg-stone-50 text-stone-900
                  placeholder-stone-400 outline-none transition-all resize-none leading-relaxed
                  ${errors.description
                    ? 'border-crimson-300 focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100'
                    : 'border-stone-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white'}`}
                placeholder="Describe what's broken, how long it's been an issue, and how it affects you or others…"
                value={form.description}
                onChange={set('description')}
              />
              <FieldError msg={errors.description} />
            </div>
          </section>

          {/* Section: Classify */}
          <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
            <FieldLabel>Classify</FieldLabel>

            {/* Location select */}
            <div>
              <label className="text-xs text-stone-500 font-semibold mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Location
              </label>
              <select
                value={form.location}
                onChange={set('location')}
                className={`w-full px-4 py-3 rounded-xl border text-sm bg-stone-50 text-stone-900
                  outline-none transition-all appearance-none cursor-pointer
                  ${errors.location
                    ? 'border-crimson-300 focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100'
                    : 'border-stone-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white'}`}
              >
                <option value="">Select location…</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <FieldError msg={errors.location} />
            </div>

            {/* Category pills */}
            <div>
              <label className="text-xs text-stone-500 font-semibold mb-2.5 block">
                Category
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORY_OPTIONS.map(({ Icon, label, value }) => {
                  const active = form.category === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCategory(value)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs
                        font-semibold transition-all"
                      style={{
                        background:   active ? '#EBF5FF' : '#F8FAFC',
                        borderColor:  active ? '#106EBE' : '#E2E8F0',
                        color:        active ? '#106EBE' : '#8896AA',
                        boxShadow:    active ? '0 0 0 2px rgba(16,110,190,0.15)' : 'none',
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  )
                })}
              </div>
              <FieldError msg={errors.category} />
            </div>
          </section>

          {/* Section: Photo */}
          <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <FieldLabel>Photo (optional)</FieldLabel>

            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview"
                  className="w-full max-h-56 object-cover rounded-xl border border-stone-200" />
                <button
                  type="button"
                  onClick={() => { setPhoto(null); setPreview(null) }}
                  className="absolute top-2.5 right-2.5 w-7 h-7 bg-black/50 text-white rounded-full
                    flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-xl
                    border-2 border-dashed text-sm font-medium transition-all"
                  style={{ borderColor: '#DCE4EF', color: '#8896AA' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#106EBE'
                    e.currentTarget.style.color        = '#106EBE'
                    e.currentTarget.style.background   = '#EBF5FF'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#DCE4EF'
                    e.currentTarget.style.color        = '#8896AA'
                    e.currentTarget.style.background   = 'transparent'
                  }}
                >
                  <Camera className="w-5 h-5" />
                  Take Photo
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-xl
                    border-2 border-dashed text-sm font-medium transition-all"
                  style={{ borderColor: '#DCE4EF', color: '#8896AA' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#106EBE'
                    e.currentTarget.style.color        = '#106EBE'
                    e.currentTarget.style.background   = '#EBF5FF'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#DCE4EF'
                    e.currentTarget.style.color        = '#8896AA'
                    e.currentTarget.style.background   = 'transparent'
                  }}
                >
                  <Upload className="w-5 h-5" />
                  Upload File
                </button>
              </div>
            )}

            <input ref={cameraInputRef} type="file" accept="image/*"
              capture="environment" className="hidden"
              onChange={(e) => handlePhoto(e.target.files[0])} />
            <input ref={fileInputRef} type="file" accept="image/*"
              className="hidden"
              onChange={(e) => handlePhoto(e.target.files[0])} />
          </section>

          {/* Live preview */}
          {form.title && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border p-4"
              style={{ background: '#EBF5FF', borderColor: '#CCDEFF' }}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2"
                style={{ color: '#106EBE' }}>
                Preview
              </p>
              <p className="text-sm font-semibold text-stone-800">{form.title}</p>
              {(form.location || form.category) && (
                <div className="flex items-center gap-3 mt-1.5">
                  {form.location && (
                    <span className="text-xs text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {form.location}
                    </span>
                  )}
                  {form.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: '#CCDEFF', color: '#106EBE' }}>
                      {form.category}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-stone-600
                border border-stone-200 bg-white hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                text-sm font-bold text-[#06111E] transition-all disabled:opacity-50"
              style={{ background: '#0FFCBE', boxShadow: '0 2px 14px rgba(15,252,190,0.35)' }}
              onMouseEnter={(e) => !isPending && (e.currentTarget.style.background = '#44F0CA')}
              onMouseLeave={(e) => !isPending && (e.currentTarget.style.background = '#0FFCBE')}
            >
              {isPending ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                </svg>
              ) : null}
              Submit Report
              {!isPending && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </motion.form>
      </main>
    </div>
    </PageTransition>
  )
}
