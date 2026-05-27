import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, Upload, X, ArrowLeft, MapPin } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createIssue } from '../api/issues'
import { Navbar } from '../components/layout/Navbar'
import { Button } from '../components/ui/Button'
import { Input, Textarea, Select } from '../components/ui/Input'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'Classroom Equipment', 'Electrical', 'Wi-Fi / Network',
  'Plumbing', 'Sanitation', 'Security', 'Furniture', 'Other',
]

const LOCATIONS = [
  'Block A', 'Block B', 'Block C', 'Block D',
  'Computer Lab 1', 'Computer Lab 2', 'Computer Lab 3',
  'Seminar Hall', 'Library', 'Cafeteria', 'Hostel Block',
  'Sports Ground', 'Main Road', 'Parking Area', 'Other',
]

export function RaiseComplaint() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef()
  const cameraInputRef = useRef()

  const [form, setForm] = useState({
    title: '', description: '', location: '', category: '',
  })
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [errors, setErrors] = useState({})

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }))
    setErrors((p) => ({ ...p, [k]: '' }))
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
        if (e.toLowerCase().includes('title'))       errMap.title = e
        else if (e.toLowerCase().includes('description')) errMap.description = e
        else if (e.toLowerCase().includes('location'))  errMap.location = e
        else if (e.toLowerCase().includes('category'))  errMap.category = e
      })
      setErrors(errMap)
      if (errs.length > 0) toast.error(errs[0])
    },
  })

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.location)           e.location = 'Location is required'
    if (!form.category)           e.category = 'Category is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) submit()
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          {/* Header with sticky note flair */}
          <div className="bg-amber-100 border-b border-amber-200 px-6 py-5">
            <h1 className="text-xl font-bold text-gray-900">Report a Campus Issue</h1>
            <p className="text-sm text-amber-700 mt-1">
              Your report will appear on the board. The community upvotes what matters.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <Input
              label="Issue title"
              placeholder="Short, descriptive title (e.g. Projector not working in Room 301)"
              value={form.title}
              onChange={set('title')}
              error={errors.title}
              maxLength={120}
            />

            <Textarea
              label="Describe the problem"
              placeholder="What exactly is broken? How long has this been an issue? How does it affect you?"
              value={form.description}
              onChange={set('description')}
              error={errors.description}
              rows={4}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Location"
                value={form.location}
                onChange={set('location')}
                error={errors.location}
              >
                <option value="">Select location…</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>

              <Select
                label="Category"
                value={form.category}
                onChange={set('category')}
                error={errors.category}
              >
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>

            {/* Photo upload — camera on mobile */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Photo (optional)
              </label>

              {preview ? (
                <div className="relative inline-block">
                  <img src={preview} alt="Preview" className="w-full max-h-48 object-cover rounded-xl border" />
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); setPreview(null) }}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full
                      flex items-center justify-center hover:bg-black/70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  {/* Camera button — uses device camera on mobile */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed
                      border-[#E8E2DA] rounded-xl text-sm text-stone-500 hover:border-brand-400
                      hover:text-brand-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" /> Take Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed
                      border-[#E8E2DA] rounded-xl text-sm text-stone-500 hover:border-brand-400
                      hover:text-brand-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" /> Upload File
                  </button>
                </div>
              )}

              {/* Camera input (triggers device camera on mobile) */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handlePhoto(e.target.files[0])}
              />
              {/* File picker input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhoto(e.target.files[0])}
              />
            </div>

            {/* Preview card */}
            {form.title && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs text-amber-600 font-medium mb-2 uppercase tracking-wide">Preview</p>
                <p className="text-sm font-semibold text-gray-800">{form.title}</p>
                {form.location && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {form.location}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="flex-1 justify-center">
                Cancel
              </Button>
              <Button type="submit" loading={isPending} className="flex-1 justify-center">
                Submit Report
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  )
}
