import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Inbox, Loader2, RefreshCw, Search, X, XCircle, Info, TrendingUp, TrendingDown } from 'lucide-react'
import { initials } from '../lib/utils'

/* ---------- Brand ---------- */
export function Logo({ size = 32, withText = true, light = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#4338CA" />
        <path d="M10 24V8h7a5 5 0 0 1 0 10h-7" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 24l3-3 2 2 4-5" fill="none" stroke="#A5B4FC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {withText && (
        <div className="leading-tight">
          <div className={`text-[15px] font-bold tracking-[0.12em] ${light ? 'text-white' : 'text-ink dark:text-white'}`}>PERFORMX</div>
          <div className={`text-[10px] ${light ? 'text-indigo-200' : 'text-ink-muted'}`}>Performance Management</div>
        </div>
      )}
    </div>
  )
}

/* ---------- Identity ---------- */
const AVATAR_COLORS = ['bg-indigo-100 text-indigo-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-800', 'bg-sky-100 text-sky-700', 'bg-rose-100 text-rose-700', 'bg-violet-100 text-violet-700', 'bg-teal-100 text-teal-700']
export function UserAvatar({ name = '', size = 'md', online }) {
  const sz = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-16 w-16 text-xl' }[size]
  const color = AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${sz} ${color}`} aria-label={name}>
      {initials(name)}
      {online !== undefined && <span className={`absolute -bottom-0 -right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${online ? 'bg-emerald-500' : 'bg-slate-300'}`} />}
    </span>
  )
}

const ROLE_STYLE = {
  ADMIN: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30',
  SUPERVISOR: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30',
  EMPLOYEE: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30',
}
export function RoleBadge({ role }) {
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${ROLE_STYLE[role]}`}>{role?.charAt(0) + role?.slice(1).toLowerCase()}</span>
}

/* ---------- Status ---------- */
const STATUS = {
  COMPLETED: ['Completed', 'bg-emerald-50 text-emerald-700 ring-emerald-200', 'bg-emerald-500'],
  SUCCESSFUL: ['Successful', 'bg-emerald-50 text-emerald-700 ring-emerald-200', 'bg-emerald-500'],
  ACTIVE: ['Active', 'bg-sky-50 text-sky-700 ring-sky-200', 'bg-sky-500'],
  IN_PROGRESS: ['In Progress', 'bg-indigo-50 text-indigo-700 ring-indigo-200', 'bg-indigo-500'],
  PENDING: ['Pending', 'bg-amber-50 text-amber-800 ring-amber-200', 'bg-amber-500'],
  OVERDUE: ['Overdue', 'bg-rose-50 text-rose-700 ring-rose-200', 'bg-rose-500'],
  FAILED: ['Failed', 'bg-rose-50 text-rose-700 ring-rose-200', 'bg-rose-500'],
  INACTIVE: ['Revoked', 'bg-slate-100 text-slate-600 ring-slate-200', 'bg-slate-400'],
  REVIEWED: ['Reviewed', 'bg-emerald-50 text-emerald-700 ring-emerald-200', 'bg-emerald-500'],
}
export function StatusBadge({ status }) {
  const [label, cls, dot] = STATUS[status] || [status, 'bg-slate-100 text-slate-600 ring-slate-200', 'bg-slate-400']
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${cls} dark:bg-opacity-10`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{label}
    </span>
  )
}

const PRIORITY = { HIGH: 'text-rose-700 bg-rose-50 ring-rose-200', MEDIUM: 'text-amber-800 bg-amber-50 ring-amber-200', LOW: 'text-slate-600 bg-slate-100 ring-slate-200' }
export function PriorityBadge({ priority }) {
  return <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${PRIORITY[priority]}`}>{priority?.charAt(0) + priority?.slice(1).toLowerCase()}</span>
}

const LEVEL = { Excellent: 'text-emerald-700 bg-emerald-50 ring-emerald-200', Good: 'text-indigo-700 bg-indigo-50 ring-indigo-200', Average: 'text-amber-800 bg-amber-50 ring-amber-200', 'Needs Improvement': 'text-rose-700 bg-rose-50 ring-rose-200' }
export function PerformanceBadge({ level }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${LEVEL[level] || LEVEL.Average}`}>{level}</span>
}

export function ProgressBar({ value = 0, size = 'sm', showLabel = false, tone }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0))
  const color = tone || (v >= 100 ? 'bg-emerald-500' : v >= 60 ? 'bg-brand-500' : v >= 30 ? 'bg-amber-500' : 'bg-rose-400')
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className={`flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${size === 'sm' ? 'h-1.5' : 'h-2.5'}`} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${color} origin-left transition-transform duration-700 ease-out`} style={{ width: '100%', transform: `scaleX(${v / 100})` }} />
      </div>
      {showLabel && <span className="w-9 text-right text-xs font-medium tabular-nums text-ink-soft dark:text-slate-300">{Math.round(v)}%</span>}
    </div>
  )
}

/* ---------- Layout primitives ---------- */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between animate-fadeUp">
      <div><h1 className="page-title">{title}</h1>{subtitle && <p className="page-sub">{subtitle}</p>}</div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ title, subtitle, actions, children, className = '', bodyClass = 'p-5' }) {
  return (
    <section className={`card animate-fadeUp ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
          <div><h2 className="section-title">{title}</h2>{subtitle && <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>}</div>
          {actions}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  )
}

const TONES = {
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10', emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10', rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10', violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10',
}
export function KpiCard({ label, value, icon: Icon, tone = 'indigo', hint, delta, index = 0 }) {
  return (
    <div className="card group p-4 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-slate-300 animate-fadeUp" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-ink-muted">{label}</p>
        {Icon && <span className={`rounded-lg p-2 ${TONES[tone]}`}><Icon size={16} /></span>}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-ink dark:text-white">{value}</p>
      <div className="mt-1 flex items-center gap-1.5 text-xs">
        {delta != null && (
          <span className={`inline-flex items-center gap-0.5 font-medium ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
        {hint && <span className="text-ink-muted">{hint}</span>}
      </div>
    </div>
  )
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800" role="tablist">
      {tabs.map((t) => {
        const key = t.value ?? t
        const active = key === value
        return (
          <button key={key} role="tab" aria-selected={active} onClick={() => onChange(key)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${active ? 'bg-white text-ink shadow-sm dark:bg-slate-900 dark:text-white' : 'text-ink-muted hover:text-ink dark:hover:text-white'}`}>
            {t.label ?? t}{t.count != null && <span className="ml-1.5 text-ink-muted">{t.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input className="input pl-9" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </div>
  )
}

export function Select({ value, onChange, options, className = '', ...rest }) {
  return (
    <select className={`input pr-8 ${className}`} value={value} onChange={(e) => onChange(e.target.value)} {...rest}>
      {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  )
}

/* ---------- States ---------- */
export function LoadingSkeleton({ rows = 4, kpis = 0 }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      {kpis > 0 && <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">{Array.from({ length: kpis }).map((_, i) => <div key={i} className="card h-[104px] animate-pulse bg-slate-100/60" />)}</div>}
      <div className="card p-5 space-y-3">{Array.from({ length: rows }).map((_, i) => <div key={i} className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" style={{ width: `${90 - i * 8}%` }} />)}</div>
    </div>
  )
}

export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400 dark:bg-slate-800"><Icon size={22} /></span>
      <p className="text-sm font-medium text-ink dark:text-white">{title}</p>
      {message && <p className="mt-1 max-w-sm text-xs text-ink-muted">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-3 rounded-full bg-rose-50 p-3 text-rose-500"><AlertTriangle size={22} /></span>
      <p className="text-sm font-medium text-ink dark:text-white">{error?.status === 403 ? 'Access restricted' : 'Unable to load data'}</p>
      <p className="mt-1 max-w-sm text-xs text-ink-muted">{error?.message}</p>
      {onRetry && <button className="btn-secondary mt-4" onClick={() => onRetry()}><RefreshCw size={14} />Try again</button>}
    </div>
  )
}

export function Spinner({ size = 16 }) { return <Loader2 size={size} className="animate-spin" /> }

/* ---------- Overlays ---------- */
export function Modal({ open, onClose, title, subtitle, children, footer, width = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fadeIn" onClick={onClose} />
      <div className={`relative w-full ${width} max-h-[92vh] overflow-hidden rounded-t-2xl sm:rounded-xl bg-white shadow-pop animate-scaleIn flex flex-col dark:bg-slate-900`}>
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div><h3 className="text-base font-semibold text-ink dark:text-white">{title}</h3>{subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}</div>
          <button className="btn-ghost -mr-2 p-1.5" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 dark:border-slate-800 dark:bg-slate-900">{footer}</footer>}
      </div>
    </div>
  )
}

export function ConfirmationDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, busy = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-md"
      footer={<>
        <button className="btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={busy}>{busy && <Spinner size={14} />}{confirmLabel}</button>
      </>}>
      <div className="flex gap-3">
        <span className={`h-fit rounded-full p-2 ${danger ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>{danger ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}</span>
        <p className="text-sm text-ink-soft dark:text-slate-300 pt-1">{message}</p>
      </div>
    </Modal>
  )
}

/* ---------- Toasts ---------- */
const ToastCtx = createContext(() => {})
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
  }, [])
  const icon = { success: <CheckCircle2 size={18} className="text-emerald-500" />, error: <XCircle size={18} className="text-rose-500" />, info: <Info size={18} className="text-indigo-500" /> }
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="card flex items-start gap-3 px-4 py-3 shadow-pop animate-fadeUp">
            {icon[t.type]}<p className="flex-1 text-sm text-ink dark:text-white">{t.message}</p>
            <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} className="text-slate-400 hover:text-ink" aria-label="Dismiss"><X size={14} /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)

/* ---------- Table wrapper (horizontal scroll on small screens) ---------- */
export function Table({ head, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
        <thead className="bg-slate-50/70 dark:bg-slate-900/60"><tr>{head}</tr></thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>
      </table>
    </div>
  )
}

export function Field({ label, children, hint, error }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
    </label>
  )
}
