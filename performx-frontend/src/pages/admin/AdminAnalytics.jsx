import { useState } from 'react'
import {
  BarChart3, PieChart as PieIcon, TrendingUp, AlertCircle, Award, CheckCircle2
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { api } from '../../lib/api'
import { useApi } from '../../lib/utils'
import { PageHeader, Card, KpiCard, Table, LoadingSkeleton, ErrorState } from '../../components/ui'

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6']

export default function AdminAnalytics() {
  const { data, loading, error, reload } = useApi(api.admin.analytics)

  if (loading) return <LoadingSkeleton rows={8} kpis={4} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const distData = data?.distribution || []
  const taskStatus = Object.entries(data?.tasksByStatus || {}).map(([k, v]) => ({ name: k.replace('_', ' '), value: v }))
  const heatmap = data?.heatmap || {}
  const departments = Object.keys(heatmap)
  const quarters = ['2025 Q4', '2026 Q1', '2026 Q2', '2026 Q3']

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Analytics"
        subtitle="Deep dive into organizational productivity, score distribution, and supervisor effectiveness."
      />

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Average Org Score"
          value={`${data?.overallScore || 0}%`}
          icon={Award}
          tone="indigo"
          hint="Calculated across all employees"
          delta={+3.4}
        />
        <KpiCard
          label="Task Completion Rate"
          value={`${data?.completionRate || 0}%`}
          icon={CheckCircle2}
          tone="emerald"
          hint="On-time delivery index"
        />
        <KpiCard
          label="Overdue Tasks"
          value={data?.overdueTasks || 0}
          icon={AlertCircle}
          tone={data?.overdueTasks > 0 ? 'rose' : 'emerald'}
          hint="Action required by supervisors"
        />
        <KpiCard
          label="Total Managed Tasks"
          value={data?.totalTasks || 0}
          icon={BarChart3}
          tone="violet"
          hint="Active and completed work items"
        />
      </div>

      {/* Row: Score Distribution & Task Status Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Score Distribution */}
        <div className="lg:col-span-7">
          <Card title="Employee Performance Distribution" subtitle="Headcount grouped by overall quarterly rating bracket">
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distData} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="range" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" name="Employees" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Tasks by Status */}
        <div className="lg:col-span-5">
          <Card title="Task Status Breakdown" subtitle="Distribution of work lifecycle">
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {taskStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Heatmap: Department vs Quarterly Performance */}
      <Card title="Departmental Performance Heatmap" subtitle="Quarterly score trajectory across business departments">
        <Table
          head={
            <>
              <th className="th">Department</th>
              {quarters.map((q) => <th key={q} className="th text-center">{q}</th>)}
            </>
          }
        >
          {departments.map((dept) => {
            const row = heatmap[dept] || {}
            return (
              <tr key={dept} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="td font-semibold text-ink dark:text-white">{dept}</td>
                {quarters.map((q) => {
                  const score = row[q]
                  const bg = !score ? 'bg-slate-100 text-slate-400' :
                    score >= 88 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                    score >= 75 ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' :
                    score >= 65 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                    'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  return (
                    <td key={q} className="td text-center">
                      <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${bg}`}>
                        {score ? `${score}%` : '—'}
                      </span>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </Table>
      </Card>

      {/* Supervisor Effectiveness */}
      <Card title="Supervisor Leadership Metrics" subtitle="Team oversight and review velocity by supervisor">
        <Table
          head={
            <>
              <th className="th">Supervisor</th>
              <th className="th">Department</th>
              <th className="th">Team Size</th>
              <th className="th">Avg Team Score</th>
              <th className="th">Tasks Assigned</th>
              <th className="th">Reviews Submitted</th>
              <th className="th">Pending Reviews</th>
            </>
          }
        >
          {(data?.supervisors || []).map((s) => (
            <tr key={s.supervisorId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
              <td className="td font-semibold text-ink dark:text-white">{s.user.name}</td>
              <td className="td">{s.department}</td>
              <td className="td">{s.teamSize} employees</td>
              <td className="td font-semibold text-brand-600 dark:text-brand-400">{s.avgTeamScore}%</td>
              <td className="td">{s.tasksAssigned}</td>
              <td className="td">{s.reviewsGiven}</td>
              <td className="td">
                {s.pendingReviews > 0 ? (
                  <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                    {s.pendingReviews} awaiting
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">All cleared</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}
