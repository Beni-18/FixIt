import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Wrench, Eye, EyeOff, ShieldCheck, CheckCircle } from 'lucide-react'
import { login, register } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

// ─── Demo cards shown in the hero fan ─────────────────────────────
const DEMO_CARDS = [
  { emoji: '📽️', title: 'Projector out — Room 301', loc: 'Block A',   votes: 24 },
  { emoji: '📡', title: 'Wi-Fi dead in Library 2F',  loc: 'Library',   votes: 31 },
  { emoji: '💡', title: 'Street light near hostel',   loc: 'Main Road', votes: 18 },
  { emoji: '🪑', title: 'Broken desks — 8 chairs',   loc: 'Block A',   votes: 12 },
  { emoji: '🚿', title: 'Leaking tap, Block B wash',  loc: 'Block B',   votes: 9  },
]

const FAN = [
  { x: -148, y: 24, rotate: -17 },
  { x: -74,  y: 9,  rotate: -8.5 },
  { x: 0,    y: 0,  rotate: 0 },
  { x: 74,   y: 9,  rotate: 8.5 },
  { x: 148,  y: 24, rotate: 17 },
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
            <div className="h-1.5 bg-crimson-600 w-full" />
            <div className="p-2.5">
              <div className="text-lg mb-1.5">{card.emoji}</div>
              <p className="text-[10.5px] font-semibold text-stone-800 line-clamp-2 leading-snug mb-2">
                {card.title}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded-full border border-stone-100 truncate max-w-[60px]">
                  {card.loc}
                </span>
                <span className="text-[10px] font-bold text-crimson-600">↑{card.votes}</span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Animated count-up (triggers when scrolled into view) ─────────
function CountUp({ value, loading }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView || loading || value == null) return
    const dur = 1400
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(ease * value))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, value, loading])

  return <span ref={ref}>{loading ? '—' : count}</span>
}

// ─── Inline form input (self-contained) ───────────────────────────
function FormInput({ label, error, showToggle, onToggle, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-stone-700">{label}</label>}
      <div className="relative">
        <input
          className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white text-stone-900
            placeholder-stone-400 outline-none transition-colors
            ${error
              ? 'border-crimson-400 focus:border-crimson-500 focus:ring-2 focus:ring-crimson-100'
              : 'border-stone-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}`}
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

// ─── Red CTA submit button ─────────────────────────────────────────
function SubmitBtn({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-2.5 rounded-lg text-sm font-semibold text-white
        transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      style={{ background: '#C62828' }}
      onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#a82020')}
      onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#C62828')}
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

// ─── Data constants ────────────────────────────────────────────────
const STAT_KEYS = [
  { key: 'total_issues',   label: 'Issues Reported' },
  { key: 'resolved',       label: 'Resolved' },
  { key: 'active_students',label: 'Active Students' },
  { key: 'total_upvotes',  label: 'Upvotes Cast' },
]

const CATS = [
  { e: '📽️', l: 'Classroom Equipment' }, { e: '💡', l: 'Electrical' },
  { e: '📡', l: 'Wi-Fi / Network' },     { e: '🚿', l: 'Plumbing' },
  { e: '🧹', l: 'Sanitation' },          { e: '🔒', l: 'Security' },
  { e: '🪑', l: 'Furniture' },           { e: '❓', l: 'Other' },
]

const STEPS = [
  {
    num: '01', title: 'Spot & Report',
    body: 'Photo, description, exact location. Takes under a minute.',
    icon: '📋', color: 'bg-amber-50 border-amber-100',
  },
  {
    num: '02', title: 'Community Upvotes',
    body: 'Other students upvote what affects them. Priority auto-sorts.',
    icon: '👆', color: 'bg-sky-50 border-sky-100',
  },
  {
    num: '03', title: 'Admin Resolves',
    body: 'Full audit trail: raised → processed → in-progress → resolved.',
    icon: '✅', color: 'bg-emerald-50 border-emerald-100',
  },
]

// ─── Main component ────────────────────────────────────────────────
export function Landing() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

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
    queryFn: () => api.get('/stats').then((r) => r.data),
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">

      {/* ═══════════════════════════════════════════════════════════
          HERO — split layout, full viewport
          ═══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row min-h-screen">

        {/* ── Left: brand + card fan ────────────────────────────── */}
        <div
          className="lg:w-[52%] relative flex flex-col justify-between p-8 lg:p-12 overflow-hidden"
          style={{ background: 'linear-gradient(155deg, #0F3817 0%, #061409 100%)' }}
        >
          {/* Dot-grid texture */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '26px 26px',
            }}
          />
          {/* Decorative circle */}
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full
            border border-white/5 pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-56 h-56 rounded-full
            border border-white/5 pointer-events-none" />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex items-center gap-2.5"
          >
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-lg leading-none">FixIT</div>
              <div className="text-white/40 text-xs mt-0.5">Rathinam Technical Campus</div>
            </div>
          </motion.div>

          {/* Headline + card fan */}
          <div className="relative z-10 space-y-8">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl lg:text-6xl font-black text-white leading-[1.03] tracking-tight"
              >
                Campus<br />
                issues,<br />
                <span className="text-crimson-400">fixed.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18 }}
                className="text-white/55 text-base mt-4 max-w-xs leading-relaxed"
              >
                Report problems, upvote what matters —{' '}
                admins resolve them with a full audit trail.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-white/25 text-[10px] mb-4 uppercase tracking-[0.18em] font-medium">
                Live on campus right now
              </p>
              <CardFan />
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="space-y-2"
            >
              {[
                'Upvote issues that affect you too',
                'Real-time status from raised to resolved',
                'Admin accountability with full audit trail',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/55">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </motion.ul>
          </div>

          <p className="relative z-10 text-white/20 text-xs">
            © 2025 FixIT · Rathinam Technical Campus
          </p>
        </div>

        {/* ── Right: auth form ─────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-[#FAF8F5]">
          <div className="w-full max-w-md space-y-5">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-stone-900">FixIT</span>
              <span className="text-stone-400 text-xs">· Rathinam TC</span>
            </div>

            {/* Mode tabs */}
            <div className="flex bg-white border border-[#E8E2DA] rounded-xl p-1">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                    ${mode === m ? 'bg-brand-600 text-white shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {mode === 'login' ? (

                /* ─ Login form ─────────────────────────────────── */
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleLogin}
                  className="bg-white rounded-2xl border border-[#E8E2DA] p-6 shadow-sm space-y-4"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-stone-900">Welcome back</h2>
                    <p className="text-sm text-stone-400 mt-0.5">Sign in to your FixIT account</p>
                  </div>

                  {/* Login type toggle */}
                  <div className="flex gap-2">
                    {[['student', 'Student', null], ['admin', 'Admin', ShieldCheck]].map(([val, label, Icon]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setLoginType(val)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
                          text-xs font-medium border transition-colors
                          ${loginType === val
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-stone-200 text-stone-500 hover:border-stone-300'}`}
                      >
                        {Icon && <Icon className="w-3.5 h-3.5" />} {label}
                      </button>
                    ))}
                  </div>

                  {loginType === 'admin' && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">Admin login. Unauthorised access attempts are logged.</p>
                    </div>
                  )}

                  <FormInput
                    label="Email"
                    type="email"
                    placeholder={loginType === 'admin' ? 'admin@rathinam.in' : 'you@rathinam.in'}
                    value={form.email}
                    onChange={set('email')}
                    required
                  />
                  <FormInput
                    label="Password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Your password"
                    value={form.password}
                    onChange={set('password')}
                    required
                    showToggle={showPw}
                    onToggle={() => setShowPw(!showPw)}
                  />
                  <SubmitBtn loading={loading}>Sign In</SubmitBtn>
                </motion.form>

              ) : (

                /* ─ Register form ──────────────────────────────── */
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleRegister}
                  className="bg-white rounded-2xl border border-[#E8E2DA] p-6 shadow-sm space-y-4"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-stone-900">Create account</h2>
                    <p className="text-sm text-stone-400 mt-0.5">Join with your Rathinam college email</p>
                  </div>

                  <FormInput label="Full name" placeholder="Your full name"
                    value={form.name} onChange={set('name')} required error={errors.name} />
                  <FormInput label="College email" type="email"
                    placeholder="you@rathinam.in"
                    value={form.email} onChange={set('email')} required error={errors.email} />

                  <div className="grid grid-cols-2 gap-3">
                    <FormInput label="Student ID" placeholder="RTC2024CS001"
                      value={form.student_id} onChange={set('student_id')} />
                    <FormInput label="Department" placeholder="CSE, EEE…"
                      value={form.department} onChange={set('department')} />
                  </div>

                  <FormInput label="Password" type={showPw ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={form.password} onChange={set('password')} required
                    error={errors.password}
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

      {/* ═══════════════════════════════════════════════════════════
          SCROLLING CATEGORY TICKER
          ═══════════════════════════════════════════════════════════ */}
      <div className="overflow-hidden bg-brand-800 py-3 border-t border-brand-900 flex-shrink-0">
        <div
          className="flex gap-12 whitespace-nowrap"
          style={{ animation: 'ticker 24s linear infinite' }}
        >
          {[...CATS, ...CATS].map((c, i) => (
            <span key={i} className="text-brand-300 text-sm font-medium flex-shrink-0">
              {c.e} {c.l}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          STATS BAR — animated count-up from real DB data
          ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-[#E8E2DA] py-12">
        <div className="max-w-3xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STAT_KEYS.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-4xl font-black text-stone-900 tabular-nums">
                <CountUp value={stats?.[s.key]} loading={statsLoading} />
              </div>
              <div className="text-sm text-stone-400 mt-1.5 font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS — 3 steps
          ═══════════════════════════════════════════════════════════ */}
      <div className="py-16 px-6 bg-[#FAF8F5]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-2xl font-bold text-stone-900">How it works</h2>
            <p className="text-stone-400 text-sm mt-2">Three steps from complaint to closure</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.14 }}
                className={`rounded-2xl border p-6 ${step.color}`}
              >
                <div className="text-3xl mb-4">{step.icon}</div>
                <div className="text-xs font-bold text-crimson-600 mb-1 uppercase tracking-wider">
                  Step {step.num}
                </div>
                <h3 className="text-base font-semibold text-stone-900 mb-2">{step.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CATEGORY GRID
          ═══════════════════════════════════════════════════════════ */}
      <div className="py-12 px-6 bg-white border-t border-[#E8E2DA]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-widest text-center mb-6">
            What students report
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {CATS.map((c, i) => (
              <motion.div
                key={c.l}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#FAF8F5]
                  border border-[#E8E2DA] hover:border-brand-300 hover:bg-brand-50 transition-colors"
              >
                <span className="text-xl">{c.e}</span>
                <span className="text-[10px] text-stone-500 text-center leading-tight">{c.l.split(' / ')[0]}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
