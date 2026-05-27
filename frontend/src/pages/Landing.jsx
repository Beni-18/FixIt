import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Wrench, Eye, EyeOff, ShieldCheck, CheckCircle,
  Monitor, Wifi, Zap, Droplets, Wind, Shield, Armchair, HelpCircle,
  FileText, ThumbsUp, CheckCircle2, Image, ArrowRight,
} from 'lucide-react'
import { login, register } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

/* ─── Demo cards ────────────────────────────────────────────── */
const DEMO_CARDS = [
  { Icon: Monitor,   title: 'Projector out — Room 301', loc: 'Block A',   votes: 24, accent: 'bg-brand-50 text-brand-600' },
  { Icon: Wifi,      title: 'Wi-Fi dead in Library 2F',  loc: 'Library',   votes: 31, accent: 'bg-sky-50 text-sky-600' },
  { Icon: Zap,       title: 'Street light near hostel',  loc: 'Main Road', votes: 18, accent: 'bg-amber-50 text-amber-600' },
  { Icon: Armchair,  title: 'Broken desks — 8 chairs',  loc: 'Block A',   votes: 12, accent: 'bg-mint-50 text-mint-700' },
  { Icon: Droplets,  title: 'Leaking tap, Block B',      loc: 'Block B',   votes: 9,  accent: 'bg-crimson-50 text-crimson-600' },
]

const FAN = [
  { x: -148, y: 24, rotate: -17 },
  { x:  -74, y:  9, rotate:  -8.5 },
  { x:    0, y:  0, rotate:   0   },
  { x:   74, y:  9, rotate:   8.5 },
  { x:  148, y: 24, rotate:  17   },
]

function CardFan() {
  const [dealt, setDealt] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setDealt(true), 700)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative h-36 flex items-center justify-center">
      {DEMO_CARDS.map((card, i) => {
        const pos = FAN[i]
        const { Icon } = card
        return (
          <motion.div
            key={i}
            className="absolute w-[118px] bg-white rounded-xl shadow-xl overflow-hidden cursor-pointer"
            initial={{ x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.85 }}
            animate={dealt
              ? { x: pos.x, y: pos.y, rotate: pos.rotate, opacity: 1, scale: 1 }
              : { x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.85 }}
            style={{ zIndex: dealt ? (i === 2 ? 5 : i) : 0 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 260, damping: 22 }}
            whileHover={{ y: pos.y - 14, scale: 1.07, zIndex: 30, transition: { duration: 0.12 } }}
          >
            <div className="h-1.5 w-full" style={{ background: '#106EBE' }} />
            <div className="p-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${card.accent}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <p className="text-[10.5px] font-semibold text-stone-800 line-clamp-2 leading-snug mb-2">
                {card.title}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded-full border border-stone-100 truncate max-w-[60px]">
                  {card.loc}
                </span>
                <span className="text-[10px] font-bold" style={{ color: '#0FFCBE' }}>+{card.votes}</span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ─── Count-up ──────────────────────────────────────────────── */
function CountUp({ value, loading }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView || loading || value == null) return
    const dur   = 1400
    const start = Date.now()
    const tick  = () => {
      const p = Math.min((Date.now() - start) / dur, 1)
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * value))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, value, loading])

  return <span ref={ref}>{loading ? '—' : count}</span>
}

/* ─── Form primitives ───────────────────────────────────────── */
function FormInput({ label, error, showToggle, onToggle, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`w-full px-3.5 py-3 rounded-xl border text-sm bg-white text-stone-900
            placeholder-stone-300 outline-none transition-all
            ${error
              ? 'border-crimson-300 focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100'
              : 'border-stone-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100'}`}
          {...props}
        />
        {showToggle !== undefined && (
          <button type="button" onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
            {showToggle ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-crimson-600">{error}</p>}
    </div>
  )
}

function SubmitBtn({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 rounded-xl text-sm font-bold text-[#06111E]
        transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      style={{ background: '#0FFCBE' }}
      onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#00D8A0')}
      onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#0FFCBE')}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
        </svg>
      )}
      {children}
    </button>
  )
}

/* ─── Data ──────────────────────────────────────────────────── */
const STAT_KEYS = [
  { key: 'total_issues',    label: 'Issues Reported' },
  { key: 'resolved',        label: 'Resolved' },
  { key: 'active_students', label: 'Students Active' },
  { key: 'total_upvotes',   label: 'Upvotes Cast' },
]

const CATS = [
  { Icon: Monitor,    l: 'Classroom Equipment' },
  { Icon: Zap,        l: 'Electrical'          },
  { Icon: Wifi,       l: 'Wi-Fi / Network'     },
  { Icon: Droplets,   l: 'Plumbing'            },
  { Icon: Wind,       l: 'Sanitation'          },
  { Icon: Shield,     l: 'Security'            },
  { Icon: Armchair,   l: 'Furniture'           },
  { Icon: HelpCircle, l: 'Other'               },
]

const STEPS = [
  {
    num: '01', title: 'Spot & Report', Icon: FileText,
    body: 'Photo, description, exact location. Takes under a minute.',
  },
  {
    num: '02', title: 'Community Upvotes', Icon: ThumbsUp,
    body: 'Other students upvote what affects them. Priority auto-sorts.',
  },
  {
    num: '03', title: 'Admin Resolves', Icon: CheckCircle2,
    body: 'Full audit trail: raised → processed → in-progress → resolved.',
  },
]

/* ─── Landing ───────────────────────────────────────────────── */
export function Landing() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const formRef = useRef(null)

  const [mode,      setMode]      = useState('login')
  const [loginType, setLoginType] = useState('student')
  const [showPw,    setShowPw]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [errors,    setErrors]    = useState({})
  const [form,      setForm]      = useState({
    name: '', email: '', password: '', password_confirmation: '',
    student_id: '', department: '', phone: '',
  })

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['public-stats'],
    queryFn:  () => api.get('/stats').then((r) => r.data),
    retry: false,
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res   = await login(form.email, form.password)
      const token = res.headers['authorization']?.replace('Bearer ', '')
      setAuth(res.data.user, token)
      res.data.user.role === 'admin' ? navigate('/admin') : navigate('/home')
      toast.success(`Welcome back, ${res.data.user.name?.split(' ')[0]}!`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const res   = await register(form)
      const token = res.headers['authorization']?.replace('Bearer ', '')
      setAuth(res.data.user, token)
      navigate('/home')
      toast.success('Account created — welcome to FixIT.')
    } catch (err) {
      const errs   = err.response?.data?.errors || ['Registration failed']
      const errMap = {}
      errs.forEach((e) => {
        if (e.toLowerCase().includes('email'))         errMap.email    = e
        else if (e.toLowerCase().includes('password')) errMap.password = e
        else if (e.toLowerCase().includes('name'))     errMap.name     = e
        else errMap.general = e
      })
      setErrors(errMap)
      if (errMap.general) toast.error(errMap.general)
    } finally { setLoading(false) }
  }

  const scrollToForm = () => {
    setMode('register')
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F0F4F9' }}>

      {/* ═══════════════════════════════════════════════════════
          HERO — full viewport, dark navy
          ═══════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row min-h-screen">

        {/* ── Left: brand + card fan ─────────────────────────── */}
        <div
          className="lg:w-[54%] relative flex flex-col justify-between p-8 lg:p-14 overflow-hidden"
          style={{ background: 'linear-gradient(155deg, #06111E 0%, #0B1D35 60%, #0F2648 100%)' }}
        >
          {/* Grid texture */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
            }}
          />

          {/* Ambient glow blobs */}
          <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(16,110,190,0.2) 0%, transparent 65%)',
              filter: 'blur(50px)',
              animation: 'glow-pulse 6s ease-in-out infinite',
            }}
          />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(15,252,190,0.1) 0%, transparent 65%)',
              filter: 'blur(40px)',
              animation: 'glow-pulse 8s ease-in-out infinite 2s',
            }}
          />

          {/*
            IMAGE OPPORTUNITY — Campus hero background
            Add a campus photo behind the gradient:
              <img src="/images/campus-hero.jpg"
                className="absolute inset-0 w-full h-full object-cover opacity-10" />
            Recommended: 1200×900px campus exterior, desaturated.
          */}

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/15"
              style={{ background: 'rgba(16,110,190,0.4)' }}>
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-lg leading-none tracking-tight">FixIT</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Rathinam Technical Campus
              </div>
            </div>
          </motion.div>

          {/* Main content */}
          <div className="relative z-10 space-y-10">

            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#0FFCBE' }} />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{ color: '#0FFCBE' }}>
                Campus Issue Tracker
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.02] tracking-tight"
            >
              Campus<br />
              issues,<br />
              <span style={{ color: '#0FFCBE' }}>actually<br />fixed.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base leading-relaxed max-w-xs"
              style={{ color: 'rgba(255,255,255,0.48)' }}
            >
              Report problems, upvote what matters —
              admins resolve them with a full audit trail.
            </motion.p>

            {/* Card fan */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-5"
                style={{ color: 'rgba(255,255,255,0.2)' }}>
                Live on campus right now
              </p>
              <CardFan />
            </motion.div>

            {/* CTA + bullets */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="flex flex-col sm:flex-row items-start gap-6"
            >
              <button
                onClick={scrollToForm}
                className="group flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold
                  text-[#06111E] transition-all flex-shrink-0"
                style={{
                  background: '#0FFCBE',
                  boxShadow: '0 0 30px rgba(15,252,190,0.35)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background    = '#44F0CA'
                  e.currentTarget.style.boxShadow = '0 0 44px rgba(15,252,190,0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background    = '#0FFCBE'
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(15,252,190,0.35)'
                }}
              >
                Report an Issue
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <ul className="space-y-2">
                {[
                  'Upvote issues that affect you',
                  'Real-time status tracking',
                  'Admin accountability',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm"
                    style={{ color: 'rgba(255,255,255,0.42)' }}>
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: '#0FFCBE' }} />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <p className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
            © 2025 FixIT · Rathinam Technical Campus
          </p>
        </div>

        {/* ── Right: auth form ──────────────────────────────────── */}
        <div
          ref={formRef}
          className="flex-1 flex items-center justify-center p-6 lg:p-12"
          style={{ background: '#EBF3FB' }}
        >
          <div className="w-full max-w-md space-y-5">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: '#106EBE' }}>
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-stone-900">FixIT</span>
              <span className="text-stone-400 text-xs">· Rathinam TC</span>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-white border border-stone-200 rounded-2xl p-1 shadow-sm">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${mode === m ? 'text-white shadow-sm' : 'text-stone-400 hover:text-stone-700'}`}
                  style={mode === m ? { background: '#106EBE' } : {}}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  onSubmit={handleLogin}
                  className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4"
                >
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">Welcome back</h2>
                    <p className="text-sm text-stone-400 mt-0.5">Sign in to your FixIT account</p>
                  </div>

                  <div className="flex gap-2">
                    {[['student', 'Student', null], ['admin', 'Admin', ShieldCheck]].map(([val, label, Icon]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setLoginType(val)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                          text-xs font-semibold border transition-all
                          ${loginType === val
                            ? 'text-white border-transparent'
                            : 'border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600 bg-white'}`}
                        style={loginType === val ? { background: '#106EBE' } : {}}
                      >
                        {Icon && <Icon className="w-3.5 h-3.5" />} {label}
                      </button>
                    ))}
                  </div>

                  {loginType === 'admin' && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        Admin login. Unauthorised access attempts are logged.
                      </p>
                    </div>
                  )}

                  <FormInput label="Email" type="email"
                    placeholder={loginType === 'admin' ? 'admin@rathinam.in' : 'you@rathinam.in'}
                    value={form.email} onChange={set('email')} required />
                  <FormInput label="Password" type={showPw ? 'text' : 'password'}
                    placeholder="Your password" value={form.password} onChange={set('password')}
                    required showToggle={showPw} onToggle={() => setShowPw(!showPw)} />
                  <SubmitBtn loading={loading}>Sign In</SubmitBtn>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  onSubmit={handleRegister}
                  className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4"
                >
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">Create account</h2>
                    <p className="text-sm text-stone-400 mt-0.5">Join with your Rathinam college email</p>
                  </div>

                  <FormInput label="Full name" placeholder="Your full name"
                    value={form.name} onChange={set('name')} required error={errors.name} />
                  <FormInput label="College email" type="email" placeholder="you@rathinam.in"
                    value={form.email} onChange={set('email')} required error={errors.email} />

                  <div className="grid grid-cols-2 gap-3">
                    <FormInput label="Student ID" placeholder="RTC2024CS001"
                      value={form.student_id} onChange={set('student_id')} />
                    <FormInput label="Department" placeholder="CSE, EEE…"
                      value={form.department} onChange={set('department')} />
                  </div>

                  <FormInput label="Password" type={showPw ? 'text' : 'password'}
                    placeholder="Min 6 characters" value={form.password} onChange={set('password')}
                    required error={errors.password}
                    showToggle={showPw} onToggle={() => setShowPw(!showPw)} />
                  <FormInput label="Confirm password" type="password"
                    placeholder="Repeat password"
                    value={form.password_confirmation}
                    onChange={set('password_confirmation')} required />

                  <SubmitBtn loading={loading}>Create Account</SubmitBtn>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TICKER — category strip
          ═══════════════════════════════════════════════════════ */}
      <div className="overflow-hidden py-3 flex-shrink-0"
        style={{
          background: '#0B1D35',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
        <div
          className="flex gap-12 whitespace-nowrap"
          style={{ animation: 'ticker 24s linear infinite' }}
        >
          {[...CATS, ...CATS].map(({ Icon, l }, i) => (
            <span key={i}
              className="flex items-center gap-2 text-sm font-medium flex-shrink-0"
              style={{ color: 'rgba(15,252,190,0.65)' }}>
              <Icon className="w-3.5 h-3.5" />
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          STATS — dark navy with mint numbers
          ═══════════════════════════════════════════════════════ */}
      <div className="py-20 px-6" style={{ background: '#06111E' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-10 text-center">
          {STAT_KEYS.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-5xl font-black tabular-nums" style={{ color: '#0FFCBE' }}>
                <CountUp value={stats?.[s.key]} loading={statsLoading} />
              </div>
              <div className="text-sm font-medium mt-2" style={{ color: 'rgba(255,255,255,0.38)' }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          IMAGE BANNER PLACEHOLDER
          Replace with: <img src="/images/campus-banner.jpg" className="w-full h-56 object-cover" />
          Recommended: 1400×380px wide campus shot — lecture hall, aerial, or students.
          ═══════════════════════════════════════════════════════ */}
      <div className="w-full h-52 flex items-center justify-center gap-3"
        style={{
          background: '#0E2440',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
        <Image className="w-6 h-6" style={{ color: 'rgba(15,252,190,0.2)' }} />
        <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.18)' }}>
          Campus photo — 1400×380px banner goes here
        </span>
      </div>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════ */}
      <div className="py-20 px-6" style={{ background: '#F0F4F9' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold
              uppercase tracking-widest mb-4 bg-brand-50 text-brand-700">
              How it works
            </span>
            <h2 className="text-3xl font-black text-stone-900 tracking-tight">
              Three steps from complaint<br />to closure
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            {/* Connecting line — desktop only */}
            <div className="hidden sm:block absolute top-12 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(16,110,190,0.3), rgba(16,110,190,0.3), transparent)' }} />

            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative bg-white rounded-2xl border border-stone-200 p-7 text-center shadow-sm"
              >
                {/*
                  IMAGE OPPORTUNITY: Replace the step number block with a screenshot.
                  e.g. <img src="/images/step-{i+1}.png" className="w-full rounded-xl mb-5 border border-stone-100" />
                  Recommended: 400×220px screenshot of the raise form, board, admin panel.
                */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5
                    text-white font-black text-xl"
                  style={{ background: 'linear-gradient(135deg, #106EBE, #0A569B)' }}
                >
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-stone-900 mb-2">{step.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          CATEGORIES — dark navy grid
          ═══════════════════════════════════════════════════════ */}
      <div className="py-14 px-6" style={{ background: '#0B1D35' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-center mb-8"
            style={{ color: 'rgba(255,255,255,0.28)' }}>
            What students report
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {CATS.map(({ Icon, l }, i) => (
              <motion.div
                key={l}
                initial={{ opacity: 0, scale: 0.88 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group flex flex-col items-center gap-2 p-3 rounded-xl cursor-default
                  border transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.07)',
                }}
                whileHover={{ scale: 1.04 }}
              >
                <Icon className="w-5 h-5" style={{ color: 'rgba(15,252,190,0.55)' }} />
                <span className="text-[10px] text-center leading-tight"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {l.split(' / ')[0]}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
