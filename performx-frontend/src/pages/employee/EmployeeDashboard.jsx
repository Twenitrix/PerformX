import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Award, CheckSquare, Clock, AlertCircle, TrendingUp, ArrowRight,
  CheckCircle2, Star, Calendar, MessageSquare
} from 'lucide-react'
import { api } from '../../lib/api'
import { useApi, fmtDate } from '../../lib/utils'
import { useAuth } from '../../lib/auth'
import {
  PageHeader, KpiCard, Card, Table, StatusBadge, PriorityBadge,
  ProgressBar, PerformanceBadge, LoadingSkeleton, ErrorState
} from '../../components/ui'

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useApi(api.emp.dashboard)

  if (loading) return <LoadingSkeleton rows={6} kpis={5} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const upcoming = data?.upcoming || []
  const history = data?.history || []
  const latestReview = history.length > 0 ? history[history.length - 1] : null

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Employee'} 👋`}
        subtitle="Here's your personal work and performance overview."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Supervisor:</span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-indigo-950/40 dark:text-indigo-300">
              {data?.supervisorName || 'Department Lead'}
            </span>
          </div>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard
          label="My Performance"
          value={`${data?.score || 0}%`}
          icon={Award}
          tone="indigo"
          hint={data?.level || 'Active'}
          delta={data?.scoreDelta}
          index={0}
        />
        <KpiCard
          label="Tasks Assigned"
          value={data?.tasksAssigned || 0}
          icon={CheckSquare}
          tone="sky"
          hint="Quarterly total"
          index={1}
        />
        <KpiCard
          label="Tasks Completed"
          value={data?.tasksCompleted || 0}
          icon={CheckCircle2}
          tone="emerald"
          hint={`${data?.completionRate || 0}% delivery`}
          index={2}
        />
        <KpiCard
          label="Tasks Pending"
          value={data?.tasksPending || 0}
          icon={Clock}
          tone="amber"
          hint="Awaiting submission"
          index={3}
        />
        <KpiCard
          label="Goal Completion"
          value={`${data?.goalCompletion || 0}%`}
          icon={TrendingUp}
          tone="violet"
          hint="Weighted performance"
          index={4}
        />
      </div>

      {/* Upcoming Work & Latest Supervisor Feedback */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Active Assigned Tasks */}
        <div className="lg:col-span-8">
          <Card
            title="My Assigned Tasks"
            subtitle="Prioritized work items currently in progress or awaiting completion"
            actions={
              <Link to="/employee/tasks" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400 flex items-center gap-1">
                <span>View All Tasks</span>
                <ArrowRight size={13} />
              </Link>
            }
          >
            <Table
              head={
                <>
                  <th className="th">Task</th>
                  <th className="th">Priority</th>
                  <th className="th">Deadline</th>
                  <th className="th">Progress</th>
                  <th className="th">Status</th>
                  <th className="th text-right">Action</th>
                </>
              }
            >
              {upcoming.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    No active tasks assigned.
                  </td>
                </tr>
              ) : (
                upcoming.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="td max-w-xs">
                      <p className="font-semibold text-xs text-ink dark:text-white truncate">{t.title}</p>
                      <p className="text-[10px] text-slate-400">Assigned by {t.supervisorName}</p>
                    </td>
                    <td className="td"><PriorityBadge priority={t.priority} /></td>
                    <td className="td text-xs text-slate-600 dark:text-slate-300 font-medium">{fmtDate(t.dueDate)}</td>
                    <td className="td w-28">
                      <ProgressBar value={t.progress} showLabel />
                    </td>
                    <td className="td"><StatusBadge status={t.status} /></td>
                    <td className="td text-right">
                      <button
                        onClick={() => navigate('/employee/tasks')}
                        className="btn-secondary text-xs py-1 px-2.5"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </Table>
          </Card>
        </div>

        {/* Right: Latest Supervisor Review Snapshot */}
        <div className="lg:col-span-4">
          <Card title="Latest Supervisor Feedback" subtitle={latestReview ? `Evaluation from ${latestReview.reviewPeriod}` : 'No reviews recorded yet'}>
            {latestReview ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">Quarterly Score</p>
                    <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 mt-0.5">{latestReview.overallScore}%</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-amber-500 justify-end">
                      {Array.from({ length: latestReview.rating || 4 }).map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Review Date: {fmtDate(latestReview.reviewDate)}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-brand-500 pl-3">
                  "{latestReview.comments}"
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Reviewer: <strong>{latestReview.supervisorName}</strong></span>
                  <Link to="/employee/feedback" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
                    All Feedback →
                  </Link>
                </div>
              </div>
            ) : (
              <p className="p-6 text-center text-xs text-slate-400">No quarterly feedback recorded.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
