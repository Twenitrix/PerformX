import { useState } from 'react'
import {
  Users, UserCheck, ShieldCheck, CheckSquare, AlertTriangle, LogIn,
  TrendingUp, ArrowRight, Download, Filter
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts'
import { api } from '../../lib/api'
import { useApi, fmtDateTime, relTime } from '../../lib/utils'
import { PageHeader, KpiCard, Card, StatusBadge, Table, LoadingSkeleton, ErrorState } from '../../components/ui'

export default function AdminDashboard() {
  const { data, loading, error, reload } = useApi(api.admin.overview)
  const [filterPeriod, setFilterPeriod] = useState('6M') // 1M, 3M, 6M, 1Y

  if (loading) return <LoadingSkeleton rows={6} kpis={6} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  // Slice trend data according to the selected filter
  const trendMonths = filterPeriod === '1M' ? 1 : filterPeriod === '3M' ? 3 : filterPeriod === '6M' ? 6 : 12
  const chartData = (data?.trend || []).slice(-trendMonths)

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Overview"
        subtitle="Monitor your organization's users, activity and performance."
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> System Operational
            </span>
          </div>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          label="Total Employees"
          value={data?.totalEmployees || 0}
          icon={Users}
          tone="indigo"
          hint="Organization total"
          index={0}
        />
        <KpiCard
          label="Active Users"
          value={data?.activeUsers || 0}
          icon={UserCheck}
          tone="emerald"
          hint="Authorized accounts"
          index={1}
        />
        <KpiCard
          label="Today's Logins"
          value={data?.todaysLogins || 0}
          icon={LogIn}
          tone="sky"
          hint="Unique sessions"
          index={2}
        />
        <KpiCard
          label="Active Supervisors"
          value={data?.activeSupervisors || 0}
          icon={ShieldCheck}
          tone="violet"
          hint="Team managers"
          index={3}
        />
        <KpiCard
          label="Pending Tasks"
          value={data?.pendingTasks || 0}
          icon={CheckSquare}
          tone="amber"
          hint="Across all teams"
          index={4}
        />
        <KpiCard
          label="System Alerts"
          value={data?.systemAlerts || 0}
          icon={AlertTriangle}
          tone={data?.systemAlerts > 0 ? 'rose' : 'emerald'}
          hint="Requires attention"
          index={5}
        />
      </div>

      {/* Organization Performance Chart */}
      <Card
        title="Organization Performance Trend"
        subtitle="Monthly Average Performance Score vs. Goal Completion Rate"
        actions={
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {['1M', '3M', '6M', '1Y'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                  filterPeriod === p
                    ? 'bg-white text-ink shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {p === '1M' ? 'This Month' : p === '3M' ? 'Last 3M' : p === '6M' ? 'Last 6M' : 'This Year'}
              </button>
            ))}
          </div>
        }
      >
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} domain={[40, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1E293B',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="performance"
                name="Average Performance (%)"
                stroke="#4F46E5"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#4F46E5' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="completion"
                name="Goal / Task Completion (%)"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Lower Row: Department Performance Breakdown & Recent System Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Departments Table */}
        <Card title="Departmental Performance" subtitle="Team distribution and average completion rates">
          <Table
            head={
              <>
                <th className="th">Department</th>
                <th className="th">Employees</th>
                <th className="th">Avg Score</th>
                <th className="th">Completion</th>
              </>
            }
          >
            {(data?.departments || []).map((d) => (
              <tr key={d.department} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="td font-medium text-ink dark:text-white">{d.department}</td>
                <td className="td">{d.employees} members</td>
                <td className="td">
                  <span className="font-semibold text-brand-600 dark:text-brand-400">{d.avgScore}%</span>
                </td>
                <td className="td">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${Math.min(100, d.completionRate)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{d.completionRate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        {/* System Activity */}
        <Card title="System Activity Feed" subtitle="Recent task updates, reviews, and authentication logs">
          <div className="space-y-3.5 max-h-[310px] overflow-y-auto pr-1">
            {(data?.recentActivity || []).map((act, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                  act.type === 'TASK_COMPLETED' ? 'bg-emerald-500' :
                  act.type === 'LOGIN_FAILED' ? 'bg-rose-500' :
                  act.type === 'REVIEW' ? 'bg-violet-500' : 'bg-brand-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-ink dark:text-slate-200 font-medium leading-snug">{act.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{relTime(act.at)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
