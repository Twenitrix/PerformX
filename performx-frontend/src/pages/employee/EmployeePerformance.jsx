import { useState } from 'react'
import {
  Award, TrendingUp, CheckCircle2, Clock, Calendar, Star, ArrowUpRight
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { api } from '../../lib/api'
import { useApi, fmtDate } from '../../lib/utils'
import {
  PageHeader, Card, KpiCard, Table, PerformanceBadge, StatusBadge,
  LoadingSkeleton, ErrorState
} from '../../components/ui'

export default function EmployeePerformance() {
  const { data, loading, error, reload } = useApi(api.emp.performance)

  if (loading) return <LoadingSkeleton rows={8} kpis={3} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const history = data?.history || []
  const completedTasks = data?.completedTaskList || []

  // Chart data
  const chartData = history.map((h) => ({
    period: h.reviewPeriod,
    score: h.overallScore,
    productivity: h.productivityScore,
    quality: h.qualityScore,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Performance"
        subtitle="Individual quarterly metrics, historical scoring trends, and deliverable throughput."
      />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Overall Performance Score"
          value={`${data?.score || 0}%`}
          icon={Award}
          tone="indigo"
          hint={data?.level || 'Good'}
          delta={data?.scoreDelta}
        />
        <KpiCard
          label="Task Completion Rate"
          value={`${data?.completionRate || 0}%`}
          icon={CheckCircle2}
          tone="emerald"
          hint={`${data?.tasksCompleted || 0} of ${data?.tasksAssigned || 0} completed`}
        />
        <KpiCard
          label="Goal Completion Index"
          value={`${data?.goalCompletion || 0}%`}
          icon={TrendingUp}
          tone="violet"
          hint="Weighted milestone progress"
        />
      </div>

      {/* Performance Score Trend Chart */}
      <Card
        title="Performance Trajectory"
        subtitle="Historical quarterly overall scores and component benchmarks"
      >
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} domain={[50, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1E293B',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                name="Overall Score (%)"
                stroke="#4F46E5"
                strokeWidth={3}
                dot={{ r: 5, fill: '#4F46E5' }}
              />
              <Line
                type="monotone"
                dataKey="productivity"
                name="Productivity (%)"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="quality"
                name="Quality (%)"
                stroke="#8B5CF6"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Performance History Timeline (2025 Q4 - 2026 Q3) */}
      <Card
        title="Quarterly Review History"
        subtitle="Chronological milestone evaluations submitted by your supervisor"
      >
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-400">No quarterly reviews recorded yet.</p>
          ) : (
            history.map((h, idx) => (
              <div
                key={h.id}
                className="relative pl-6 pb-6 last:pb-0 border-l-2 border-indigo-200 dark:border-indigo-900"
              >
                {/* Timeline node */}
                <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-brand-600 ring-4 ring-indigo-50 dark:ring-slate-900" />

                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <span className="text-sm font-bold text-ink dark:text-white">{h.reviewPeriod}</span>
                      <span className="text-xs text-slate-400 ml-2">Reviewed on {fmtDate(h.reviewDate)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: h.rating || 4 }).map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-base font-extrabold text-brand-600 dark:text-brand-400">
                        {h.overallScore}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60 text-xs">
                    <div>
                      <span className="text-slate-400">Productivity:</span>{' '}
                      <strong className="text-slate-700 dark:text-slate-200">{h.productivityScore}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Quality:</span>{' '}
                      <strong className="text-slate-700 dark:text-slate-200">{h.qualityScore}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Attendance:</span>{' '}
                      <strong className="text-slate-700 dark:text-slate-200">{h.attendanceScore}%</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 italic border-l-2 border-brand-400 pl-3">
                    "{h.comments}"
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Evaluator: <strong className="text-slate-600 dark:text-slate-300">{h.supervisorName}</strong> · Area: {h.performanceArea || 'General'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
