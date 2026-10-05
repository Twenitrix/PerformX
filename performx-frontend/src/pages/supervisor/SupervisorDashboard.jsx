import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users, CheckSquare, Clock, AlertTriangle, Award, PlusCircle,
  ArrowRight, CheckCircle2, MessageSquare
} from 'lucide-react'
import { api } from '../../lib/api'
import { useApi, greeting, fmtDate } from '../../lib/utils'
import { useAuth } from '../../lib/auth'
import {
  PageHeader, KpiCard, Card, Table, StatusBadge, PriorityBadge,
  PerformanceBadge, UserAvatar, LoadingSkeleton, ErrorState
} from '../../components/ui'

export default function SupervisorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useApi(api.sup.dashboard)

  if (loading) return <LoadingSkeleton rows={6} kpis={5} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const team = data?.team || []
  const awaitingReview = data?.awaitingReview || []

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] || 'Supervisor'} 👋`}
        subtitle="Here's how your team is performing today."
        actions={
          <button
            onClick={() => navigate('/supervisor/tasks?action=assign')}
            className="btn-primary"
          >
            <PlusCircle size={16} />
            <span>Assign Task</span>
          </button>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard
          label="Team Members"
          value={data?.teamMembers || 0}
          icon={Users}
          tone="indigo"
          hint={`${data?.department || 'Managed'} Dept`}
          index={0}
        />
        <KpiCard
          label="Active Tasks"
          value={data?.activeTasks || 0}
          icon={CheckSquare}
          tone="sky"
          hint="In progress & pending"
          index={1}
        />
        <KpiCard
          label="Completed Tasks"
          value={data?.completedTasks || 0}
          icon={CheckCircle2}
          tone="emerald"
          hint="Delivered deliverables"
          index={2}
        />
        <KpiCard
          label="Overdue Tasks"
          value={data?.overdueTasks || 0}
          icon={AlertTriangle}
          tone={data?.overdueTasks > 0 ? 'rose' : 'emerald'}
          hint="Passed due date"
          index={3}
        />
        <KpiCard
          label="Avg Team Score"
          value={`${data?.avgTeamScore || 0}%`}
          icon={Award}
          tone="violet"
          hint="Quarterly benchmark"
          delta={+2.8}
          index={4}
        />
      </div>

      {/* Team Performance Table */}
      <Card
        title="Team Performance Scorecard"
        subtitle="Individual productivity metrics, delivery ratios, and quarterly performance standing"
        actions={
          <Link to="/supervisor/team" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400 flex items-center gap-1">
            <span>View All Members</span>
            <ArrowRight size={13} />
          </Link>
        }
      >
        <Table
          head={
            <>
              <th className="th">Employee</th>
              <th className="th">Performance Score</th>
              <th className="th">Tasks Assigned</th>
              <th className="th">Tasks Completed</th>
              <th className="th">Completion Rate</th>
              <th className="th">Standing</th>
            </>
          }
        >
          {team.slice(0, 6).map((member) => (
            <tr key={member.employeeId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
              <td className="td">
                <div className="flex items-center gap-3">
                  <UserAvatar name={member.name} size="sm" />
                  <div>
                    <p className="font-semibold text-xs text-ink dark:text-white leading-tight">{member.name}</p>
                    <p className="text-[11px] text-slate-400">{member.designation}</p>
                  </div>
                </div>
              </td>
              <td className="td font-bold text-sm text-brand-600 dark:text-brand-400">
                {member.score}%
              </td>
              <td className="td">{member.tasksAssigned} tasks</td>
              <td className="td">{member.tasksCompleted} completed</td>
              <td className="td">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(100, member.completionRate)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{member.completionRate}%</span>
                </div>
              </td>
              <td className="td">
                <PerformanceBadge level={member.level} />
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Lower Row: Tasks Awaiting Review & Upcoming Deadlines */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Completed tasks awaiting supervisor review */}
        <Card
          title="Tasks Awaiting Review"
          subtitle="Delivered by employees and ready for acceptance and feedback"
        >
          {awaitingReview.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-400">
              All submitted tasks have been reviewed. Good job!
            </p>
          ) : (
            <div className="space-y-3">
              {awaitingReview.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate('/supervisor/tasks')}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900 cursor-pointer transition-colors"
                >
                  <div>
                    <p className="text-xs font-semibold text-ink dark:text-white">{t.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Submitted by <span className="font-medium text-slate-700 dark:text-slate-300">{t.employeeName}</span>
                    </p>
                  </div>
                  <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                    Review Task
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Links & Shortcuts */}
        <Card title="Quick Management Actions" subtitle="Frequently used team supervision tools">
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => navigate('/supervisor/tasks?action=assign')}
              className="flex flex-col items-start p-3.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-white hover:bg-indigo-50/30 dark:border-slate-800 dark:bg-slate-900 transition-all text-left"
            >
              <PlusCircle size={20} className="text-brand-600 mb-2" />
              <p className="text-xs font-semibold text-ink dark:text-white">Assign New Task</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Delegate work with deadlines and weights</p>
            </button>

            <button
              onClick={() => navigate('/supervisor/reviews')}
              className="flex flex-col items-start p-3.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-white hover:bg-indigo-50/30 dark:border-slate-800 dark:bg-slate-900 transition-all text-left"
            >
              <Award size={20} className="text-violet-600 mb-2" />
              <p className="text-xs font-semibold text-ink dark:text-white">Quarterly Reviews</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Submit scores with AI feedback assistant</p>
            </button>

            <button
              onClick={() => navigate('/supervisor/chats')}
              className="flex flex-col items-start p-3.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-white hover:bg-indigo-50/30 dark:border-slate-800 dark:bg-slate-900 transition-all text-left"
            >
              <MessageSquare size={20} className="text-emerald-600 mb-2" />
              <p className="text-xs font-semibold text-ink dark:text-white">Team Communication</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Direct 1-on-1 chats with team members</p>
            </button>

            <button
              onClick={() => navigate('/supervisor/logs')}
              className="flex flex-col items-start p-3.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-white hover:bg-indigo-50/30 dark:border-slate-800 dark:bg-slate-900 transition-all text-left"
            >
              <Clock size={20} className="text-amber-600 mb-2" />
              <p className="text-xs font-semibold text-ink dark:text-white">Team Login Logs</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Read-only audit of employee sessions</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
