import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, ROLE_HOME } from '../lib/auth'
import { Logo, Spinner } from '../components/ui'
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Users, CheckCircle2 } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('admin@performx.com')
  const [password, setPassword] = useState('admin123')
  const [remember, setRemember] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!identifier || !password) return
    setBusy(true)
    setError(null)
    try {
      const user = await login(identifier, password, remember)
      navigate(ROLE_HOME[user.role] || '/')
    } catch (err) {
      setError(err.message || 'Invalid credentials or inactive account')
    } finally {
      setBusy(false)
    }
  }

  const fillQuick = (id, pass) => {
    setIdentifier(id)
    setPassword(pass)
    setError(null)
  }

  return (
    <div className="flex min-h-screen w-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Hero & Illustration Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-12 text-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Logo size={36} light />
          <div className="mt-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/30">
              Enterprise EPMS 2.0
            </span>
            <h1 className="mt-4 text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Manage work.<br />
              Measure performance.<br />
              <span className="text-indigo-400">Build better teams.</span>
            </h1>
            <p className="mt-4 text-sm text-indigo-200/80 max-w-md leading-relaxed">
              PERFORMX bridges the gap between organizational goals, supervisor oversight, and individual employee growth with real-time analytics.
            </p>
          </div>
        </div>

        {/* Illustration: Modern Enterprise Dashboard Graphic */}
        <div className="relative z-10 my-8 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-indigo-500/20 bg-indigo-950/40 p-6 backdrop-blur-md shadow-2xl space-y-4">
            {/* Mock KPI Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-900/30 p-3">
                <p className="text-[10px] uppercase font-semibold text-indigo-300">Goal Rate</p>
                <p className="text-lg font-bold text-white mt-1">94.2%</p>
                <div className="mt-1 h-1 w-full rounded-full bg-indigo-950 overflow-hidden">
                  <div className="h-full w-11/12 rounded-full bg-emerald-400" />
                </div>
              </div>
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-900/30 p-3">
                <p className="text-[10px] uppercase font-semibold text-indigo-300">Throughput</p>
                <p className="text-lg font-bold text-white mt-1">+18.5%</p>
                <div className="mt-1 h-1 w-full rounded-full bg-indigo-950 overflow-hidden">
                  <div className="h-full w-4/5 rounded-full bg-indigo-400" />
                </div>
              </div>
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-900/30 p-3">
                <p className="text-[10px] uppercase font-semibold text-indigo-300">Active Tasks</p>
                <p className="text-lg font-bold text-white mt-1">142</p>
                <div className="mt-1 h-1 w-full rounded-full bg-indigo-950 overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-amber-400" />
                </div>
              </div>
            </div>

            {/* Mock Activity Sparkline */}
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-900/20 p-4">
              <div className="flex items-center justify-between text-xs text-indigo-200">
                <span>Performance Velocity</span>
                <span className="text-emerald-400 font-medium">Optimal</span>
              </div>
              <div className="mt-3 flex items-end gap-2 h-16">
                {[40, 65, 55, 80, 70, 90, 85, 95, 88, 92].map((val, idx) => (
                  <div key={idx} className="flex-1 bg-indigo-500/40 rounded-t hover:bg-indigo-400 transition-colors" style={{ height: `${val}%` }} />
                ))}
              </div>
            </div>

            {/* Trust points */}
            <div className="flex items-center justify-between text-[11px] text-indigo-300/80 pt-1">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-400" /> RBAC Enforced</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-400" /> Audit Logs</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-400" /> Smart Insights</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-indigo-300/60">
          PERFORMX Secure Enterprise Platform &copy; 2026. All rights reserved.
        </div>
      </div>

      {/* Right Login Form Section */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile brand view */}
          <div className="mb-8 lg:hidden">
            <Logo size={32} />
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink dark:text-white">Welcome Back</h2>
            <p className="mt-1 text-sm text-ink-muted">Sign in with your organizational credentials to continue</p>
          </div>

          {/* Quick Demo Selector */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Quick 1-Click Demo Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillQuick('admin@performx.com', 'admin123')}
                className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all ${
                  identifier === 'admin@performx.com'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-500 dark:text-indigo-300 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-[11px] font-semibold mt-1">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuick('marcus.vance@performx.com', 'supervisor123')}
                className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all ${
                  identifier === 'marcus.vance@performx.com'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-500 dark:text-indigo-300 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Users size={16} className="text-sky-600 dark:text-sky-400" />
                <span className="text-[11px] font-semibold mt-1">Supervisor</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuick('aarav.sharma@performx.com', 'employee123')}
                className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all ${
                  identifier === 'aarav.sharma@performx.com'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-500 dark:text-indigo-300 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <UserCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-semibold mt-1">Employee</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 animate-fadeUp">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="identifier">Email / Employee ID</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="identifier"
                  type="text"
                  required
                  className="input pl-9"
                  placeholder="e.g. admin@performx.com or EMP-1001"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label" htmlFor="password">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please ask your System Administrator to reset your password.') }} className="text-xs text-brand-600 hover:underline dark:text-brand-400">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  required
                  className="input pl-9"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 dark:text-slate-400">
                Remember my login session
              </label>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full py-2.5 shadow-sm"
            >
              {busy ? <Spinner size={16} /> : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Protected by enterprise RBAC. Access level is determined strictly by your authenticated credentials.
          </p>
        </div>
      </div>
    </div>
  )
}
