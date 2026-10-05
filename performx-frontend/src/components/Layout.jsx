import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCheck, ShieldCheck, FileText, MessageSquare,
  Activity, BarChart3, CheckSquare, Settings, HelpCircle, LogOut, Search,
  Bell, ChevronDown, Menu, X, PlusCircle, Award, Sun, Moon, ArrowRight,
  TrendingUp, Sparkles
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { api } from '../lib/api'
import { relTime, initials } from '../lib/utils'
import { Logo, UserAvatar, RoleBadge, StatusBadge, Modal } from './ui'

/* Navigation configurations strictly divided by role */
const ADMIN_NAV = [
  { section: 'OVERVIEW', items: [{ label: 'Dashboard', path: '/admin', icon: LayoutDashboard }] },
  { section: 'PEOPLE', items: [
      { label: 'Users', path: '/admin/users', icon: Users },
      { label: 'Employees', path: '/admin/employees', icon: UserCheck },
      { label: 'Supervisors', path: '/admin/supervisors', icon: ShieldCheck },
    ]
  },
  { section: 'MONITORING', items: [
      { label: 'Access Logs', path: '/admin/logs', icon: FileText },
      { label: 'Chat Monitoring', path: '/admin/chats', icon: MessageSquare },
      { label: 'System Activity', path: '/admin/activity', icon: Activity },
    ]
  },
  { section: 'PERFORMANCE', items: [
      { label: 'Performance Analytics', path: '/admin/analytics', icon: BarChart3 },
      { label: 'Task Analytics', path: '/admin/task-analytics', icon: CheckSquare },
    ]
  },
  { section: 'ADMINISTRATION', items: [
      { label: 'Roles & Permissions', path: '/admin/roles', icon: ShieldCheck },
      { label: 'Settings', path: '/admin/settings', icon: Settings },
    ]
  },
]

const SUPERVISOR_NAV = [
  { section: 'OVERVIEW', items: [{ label: 'Dashboard', path: '/supervisor', icon: LayoutDashboard }] },
  { section: 'MY TEAM', items: [
      { label: 'Team Members', path: '/supervisor/team', icon: Users },
      { label: 'Team Performance', path: '/supervisor/performance', icon: TrendingUp },
    ]
  },
  { section: 'WORK', items: [
      { label: 'Tasks', path: '/supervisor/tasks', icon: CheckSquare },
      { label: 'Assign Task', path: '/supervisor/tasks?action=assign', icon: PlusCircle },
    ]
  },
  { section: 'MONITORING', items: [
      { label: 'Login Logs', path: '/supervisor/logs', icon: FileText },
      { label: 'Team Chats', path: '/supervisor/chats', icon: MessageSquare },
    ]
  },
  { section: 'PERFORMANCE', items: [
      { label: 'Performance Reviews', path: '/supervisor/reviews', icon: Award },
    ]
  },
  { section: 'ACCOUNT', items: [
      { label: 'Settings', path: '/supervisor/settings', icon: Settings },
    ]
  },
]

const EMPLOYEE_NAV = [
  { section: 'MY WORK', items: [
      { label: 'Dashboard', path: '/employee', icon: LayoutDashboard },
      { label: 'My Tasks', path: '/employee/tasks', icon: CheckSquare },
    ]
  },
  { section: 'MY PERFORMANCE', items: [
      { label: 'My Performance', path: '/employee/performance', icon: TrendingUp },
      { label: 'Feedback', path: '/employee/feedback', icon: Award },
    ]
  },
  { section: 'COMMUNICATION', items: [
      { label: 'Chat', path: '/employee/chat', icon: MessageSquare },
    ]
  },
  { section: 'ACCOUNT', items: [
      { label: 'Profile & Settings', path: '/employee/settings', icon: Settings },
    ]
  },
]

export function AppShell({ children }) {
  const { user, logout, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [helpOpen, setHelpOpen] = useState(false)
  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('performx.theme') === 'dark')

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('performx.theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('performx.theme', 'light')
    }
  }, [dark])

  // Fetch notifications
  useEffect(() => {
    let mounted = true
    api.notifications().then((data) => {
      if (mounted && data) {
        setNotifications(data)
        setUnreadCount(data.length)
      }
    }).catch(() => {})
    return () => { mounted = false }
  }, [location.pathname])

  // Search trigger
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }
    setSearchLoading(true)
    const t = setTimeout(() => {
      api.search(searchQuery).then((res) => {
        setSearchResults(res || [])
      }).catch(() => setSearchResults([])).finally(() => setSearchLoading(false))
    }, 250)
    return () => clearTimeout(t)
  }, [searchQuery])

  // Shortcut for Ctrl+K
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const navGroups = user?.role === 'ADMIN' ? ADMIN_NAV : user?.role === 'SUPERVISOR' ? SUPERVISOR_NAV : EMPLOYEE_NAV

  const quickSwitch = async (email, pass) => {
    setDemoSwitchOpen(false)
    try {
      const u = await login(email, pass, true)
      if (u.role === 'ADMIN') navigate('/admin')
      else if (u.role === 'SUPERVISOR') navigate('/supervisor')
      else navigate('/employee')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-ink dark:text-slate-100">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 transition-transform duration-250 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <Logo size={28} />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.section} className="space-y-1">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.section}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon
                const active = location.pathname === item.path.split('?')[0]
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-100 p-3 dark:border-slate-800 space-y-1">
          <button
            onClick={() => setHelpOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
          >
            <HelpCircle size={16} />
            <span>Help & Support</span>
          </button>

          {/* User brief widget */}
          <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <UserAvatar name={user?.name} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-ink dark:text-white leading-tight">{user?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <RoleBadge role={user?.role} />
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6 dark:border-slate-800 dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu size={20} />
            </button>

            {/* Global Search Button / Input */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-300 hover:bg-slate-100/80 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors w-64 md:w-80 justify-between"
              >
                <span className="flex items-center gap-2">
                  <Search size={14} className="text-slate-400" />
                  <span>
                    Search {user?.role === 'ADMIN' ? 'users, logs, tasks…' : user?.role === 'SUPERVISOR' ? 'team members, tasks…' : 'tasks, feedback…'}
                  </span>
                </span>
                <kbd className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 shadow-xs border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                  Ctrl K
                </kbd>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Persona Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setDemoSwitchOpen(!demoSwitchOpen)}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300 transition-colors"
                title="Switch Demonstration Role"
              >
                <Sparkles size={14} className="text-brand-600 animate-pulse" />
                <span className="hidden md:inline">Demo Persona</span>
                <ChevronDown size={13} />
              </button>

              {demoSwitchOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-2 shadow-pop border border-slate-200 dark:bg-slate-900 dark:border-slate-800 z-50 animate-scaleIn">
                  <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch Active Demo Persona
                  </p>
                  <button
                    onClick={() => quickSwitch('admin@performx.com', 'admin123')}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div>
                      <p className="font-semibold text-ink dark:text-white">Admin</p>
                      <p className="text-[11px] text-slate-400">admin@performx.com</p>
                    </div>
                    {user?.role === 'ADMIN' && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
                  </button>
                  <button
                    onClick={() => quickSwitch('marcus.vance@performx.com', 'supervisor123')}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div>
                      <p className="font-semibold text-ink dark:text-white">Supervisor (Marcus)</p>
                      <p className="text-[11px] text-slate-400">marcus.vance@performx.com</p>
                    </div>
                    {user?.role === 'SUPERVISOR' && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
                  </button>
                  <button
                    onClick={() => quickSwitch('aarav.sharma@performx.com', 'employee123')}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div>
                      <p className="font-semibold text-ink dark:text-white">Employee (Aarav)</p>
                      <p className="text-[11px] text-slate-400">aarav.sharma@performx.com</p>
                    </div>
                    {user?.role === 'EMPLOYEE' && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-pop border border-slate-200 dark:bg-slate-900 dark:border-slate-800 z-50 animate-scaleIn overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink dark:text-white">Notifications</p>
                    <button
                      onClick={() => setUnreadCount(0)}
                      className="text-[11px] font-medium text-brand-600 hover:underline dark:text-brand-400"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <p className="p-6 text-center text-xs text-slate-400">No new notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (n.link) navigate(n.link)
                            setNotificationsOpen(false)
                          }}
                          className="flex items-start gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                        >
                          <span className="mt-0.5 h-2 w-2 rounded-full bg-brand-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-ink dark:text-slate-200 leading-snug">{n.text}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{relTime(n.at)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Toggle Theme"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Top User Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <UserAvatar name={user?.name} size="sm" />
              <div className="hidden sm:block leading-tight text-left">
                <p className="text-xs font-semibold text-ink dark:text-white">{user?.name}</p>
                <div className="mt-0.5">
                  <RoleBadge role={user?.role} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Global Search Modal */}
      <Modal open={searchOpen} onClose={() => setSearchOpen(false)} title="Search Workspace" width="max-w-xl">
        <div className="space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              className="input pl-10 py-2.5 text-sm"
              placeholder={`Search ${user?.role === 'ADMIN' ? 'users, employees, tasks, logs…' : user?.role === 'SUPERVISOR' ? 'team members, tasks, chats…' : 'tasks, feedback…'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
            {searchLoading && <p className="p-4 text-center text-xs text-slate-400">Searching…</p>}
            {!searchLoading && searchQuery && searchResults.length === 0 && (
              <p className="p-6 text-center text-xs text-slate-400">No matching results found for "{searchQuery}"</p>
            )}
            {searchResults.map((r, i) => (
              <div
                key={i}
                onClick={() => {
                  setSearchOpen(false)
                  if (r.link) navigate(r.link)
                }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer transition-colors"
              >
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    {r.kind}
                  </span>
                  <p className="text-xs font-semibold text-ink dark:text-white mt-0.5">{r.title}</p>
                  <p className="text-[11px] text-slate-400">{r.subtitle}</p>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Help Modal */}
      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="PERFORMX Guide & Help" width="max-w-lg">
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p className="font-semibold text-sm text-ink dark:text-white">PERFORMX — Employee Performance Management</p>
          <p>This system enforces a clean 3-role responsibility architecture:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-ink dark:text-white">Admin:</strong> System overview, user lifecycle, access logs audit & deletion, organizational chat moderation, analytics.</li>
            <li><strong className="text-ink dark:text-white">Supervisor:</strong> Team monitoring, task delegation with deadlines & weights, feedback, review submissions, read-only team access logs.</li>
            <li><strong className="text-ink dark:text-white">Employee:</strong> Personal task execution, interactive progress updates, completion confirmation, quarterly review history, direct chat.</li>
          </ul>
          <p className="mt-4 text-[11px] text-slate-400 border-t border-slate-100 pt-2 dark:border-slate-800">
            Engineered with Spring Boot 3 + React + Tailwind CSS + H2 Embedded DB.
          </p>
        </div>
      </Modal>
    </div>
  )
}
