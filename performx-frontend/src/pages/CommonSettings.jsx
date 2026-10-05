import { useState } from 'react'
import { Settings, Shield, Bell, Lock, Palette, UserCheck, Save } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { PageHeader, Card, Field, useToast } from '../components/ui'

export default function CommonSettings() {
  const { user } = useAuth()
  const toast = useToast()

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '+91 9876543210')
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyTask, setNotifyTask] = useState(true)
  const [chatRetention, setChatRetention] = useState('90')
  const [sessionTimeout, setSessionTimeout] = useState('8')

  const handleSave = (e) => {
    e.preventDefault()
    toast('Settings successfully updated.')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Configuration"
        subtitle={`System, access, and profile preferences for ${user?.role?.toLowerCase()} account.`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Profile */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Profile Information" subtitle="Your organizational identity and contact details">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name">
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="Email Address">
                  <input disabled className="input bg-slate-50 dark:bg-slate-800" value={user?.email || ''} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Department">
                  <input disabled className="input bg-slate-50 dark:bg-slate-800" value={user?.department || 'Administration'} />
                </Field>
                <Field label="Phone Contact">
                  <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </Field>
              </div>

              <button type="submit" className="btn-primary text-xs">
                <Save size={14} />
                <span>Save Profile Changes</span>
              </button>
            </form>
          </Card>

          {/* Admin specific system settings */}
          {user?.role === 'ADMIN' && (
            <Card title="System & Access Policies" subtitle="Administrative governance rules for access logs and chat retention">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Chat Retention Policy (Days)">
                    <select
                      className="input"
                      value={chatRetention}
                      onChange={(e) => setChatRetention(e.target.value)}
                    >
                      <option value="30">30 Days</option>
                      <option value="90">90 Days (Recommended)</option>
                      <option value="180">180 Days</option>
                      <option value="365">1 Year</option>
                    </select>
                  </Field>

                  <Field label="Session Inactivity Timeout (Hours)">
                    <select
                      className="input"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                    >
                      <option value="4">4 Hours</option>
                      <option value="8">8 Hours (Standard Shift)</option>
                      <option value="24">24 Hours</option>
                    </select>
                  </Field>
                </div>

                <div className="pt-2">
                  <button type="submit" className="btn-primary text-xs">
                    <Save size={14} />
                    <span>Apply System Policies</span>
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* Notifications */}
          <Card title="Notification Preferences" subtitle="Configure automated alerts for milestones and task deadlines">
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-ink dark:text-white">Task Assignment & Deadlines</p>
                  <p className="text-[11px] text-slate-400">Receive alerts when tasks are assigned or approaching deadlines</p>
                </div>
                <input
                  type="checkbox"
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                  checked={notifyTask}
                  onChange={(e) => setNotifyTask(e.target.checked)}
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-ink dark:text-white">Performance Reviews & Feedback</p>
                  <p className="text-[11px] text-slate-400">Get notified when new quarterly evaluations or supervisor comments are posted</p>
                </div>
                <input
                  type="checkbox"
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                />
              </label>
            </div>
          </Card>
        </div>

        {/* Right Column: Security & Role Summary */}
        <div className="space-y-6">
          <Card title="Role Security Badge" subtitle="Your active permission clearance">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs dark:border-indigo-900 dark:bg-indigo-950/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-900 dark:text-indigo-200">Role Clearance</span>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{user?.role}</span>
              </div>
              <p className="text-indigo-700/80 dark:text-indigo-300">
                {user?.role === 'ADMIN'
                  ? 'Highest system tier. Full access to user management, chat monitoring, audit log deletion, and analytics.'
                  : user?.role === 'SUPERVISOR'
                  ? 'Team management tier. Full authority over assigned subordinates, task delegation, reviews, and read-only logs.'
                  : 'Individual tier. Scoped strictly to personal tasks, self performance history, and direct supervisor chat.'}
              </p>
            </div>
          </Card>

          <Card title="Security Credentials" subtitle="Update your account access password">
            <form onSubmit={handleSave} className="space-y-3">
              <Field label="Current Password">
                <input type="password" placeholder="••••••••" className="input" />
              </Field>
              <Field label="New Password">
                <input type="password" placeholder="••••••••" className="input" />
              </Field>
              <Field label="Confirm Password">
                <input type="password" placeholder="••••••••" className="input" />
              </Field>
              <button type="submit" className="btn-secondary w-full text-xs">
                Update Password
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
