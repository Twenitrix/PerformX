import { useState } from 'react'
import { Activity, Filter, CheckCircle2, AlertTriangle, Award, LogIn } from 'lucide-react'
import { api } from '../../lib/api'
import { useApi, fmtDateTime, relTime } from '../../lib/utils'
import { PageHeader, Card, Tabs, LoadingSkeleton, ErrorState } from '../../components/ui'

export default function AdminActivity() {
  const { data: activity, loading, error, reload } = useApi(api.admin.activity)
  const [filter, setFilter] = useState('ALL')

  if (loading) return <LoadingSkeleton rows={10} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const list = activity || []

  const filtered = list.filter((a) => {
    if (filter === 'ALL') return true
    if (filter === 'TASKS') return a.type.startsWith('TASK')
    if (filter === 'REVIEWS') return a.type === 'REVIEW'
    if (filter === 'LOGINS') return a.type.startsWith('LOGIN')
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Activity & Audit Log"
        subtitle="Chronological feed of task delegations, completions, supervisory reviews, and access events."
      />

      <Card>
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <Tabs
            value={filter}
            onChange={setFilter}
            tabs={[
              { value: 'ALL', label: 'All Activities', count: list.length },
              { value: 'TASKS', label: 'Task Events' },
              { value: 'REVIEWS', label: 'Performance Reviews' },
              { value: 'LOGINS', label: 'Authentication Events' },
            ]}
          />
        </div>

        <div className="pt-4 space-y-4">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-400">No events recorded in this category.</p>
          ) : (
            filtered.map((item, idx) => {
              const icon = item.type === 'TASK_COMPLETED' ? <CheckCircle2 size={16} className="text-emerald-500" /> :
                item.type === 'TASK_ASSIGNED' ? <Activity size={16} className="text-indigo-500" /> :
                item.type === 'REVIEW' ? <Award size={16} className="text-violet-500" /> :
                item.type === 'LOGIN_FAILED' ? <AlertTriangle size={16} className="text-rose-500" /> :
                <LogIn size={16} className="text-sky-500" />

              const bg = item.type === 'LOGIN_FAILED' ? 'bg-rose-50 dark:bg-rose-950/40' : 'bg-slate-50 dark:bg-slate-900'

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 ${bg}`}
                >
                  <span className="p-1.5 rounded-lg bg-white shadow-xs dark:bg-slate-800 shrink-0">
                    {icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink dark:text-white leading-snug">{item.text}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>{fmtDateTime(item.at)}</span>
                      <span>·</span>
                      <span>{relTime(item.at)}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}
