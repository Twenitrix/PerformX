import { useState } from 'react'
import { ShieldCheck, Search, Users, Award, CheckSquare, Download } from 'lucide-react'
import { api } from '../../lib/api'
import { useApi, exportCsv } from '../../lib/utils'
import {
  PageHeader, Card, Table, UserAvatar, SearchInput, LoadingSkeleton,
  ErrorState, useToast
} from '../../components/ui'

export default function AdminSupervisors() {
  const { data: supervisors, loading, error, reload } = useApi(api.admin.supervisors)
  const toast = useToast()
  const [search, setSearch] = useState('')

  if (loading) return <LoadingSkeleton rows={6} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const list = supervisors || []

  const filtered = list.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.user.name.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.user.email.toLowerCase().includes(q)
  })

  const handleExport = () => {
    exportCsv('supervisors_management.csv', filtered, [
      { label: 'Supervisor Name', value: (s) => s.user.name },
      { label: 'Email', value: (s) => s.user.email },
      { label: 'Department', value: (s) => s.department },
      { label: 'Team Size', value: (s) => s.teamSize },
      { label: 'Avg Team Score', value: (s) => `${s.avgTeamScore}%` },
      { label: 'Tasks Assigned', value: (s) => s.tasksAssigned },
      { label: 'Tasks Completed', value: (s) => s.tasksCompleted },
      { label: 'Reviews Submitted', value: (s) => s.reviewsGiven },
      { label: 'Pending Reviews', value: (s) => s.pendingReviews },
    ])
    toast('Supervisors report exported to CSV.')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supervisors & Leadership"
        subtitle="Overview of department managers, team allocation, and review progress."
        actions={
          <button onClick={handleExport} className="btn-secondary text-xs">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search supervisors by name or department…"
            className="w-full sm:w-80"
          />
        </div>

        <Table
          head={
            <>
              <th className="th">Supervisor</th>
              <th className="th">Department</th>
              <th className="th">Team Size</th>
              <th className="th">Team Avg Score</th>
              <th className="th">Tasks Delegated</th>
              <th className="th">Tasks Completed</th>
              <th className="th">Reviews Issued</th>
              <th className="th">Pending Reviews</th>
            </>
          }
        >
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-10 text-center text-xs text-slate-400">
                No supervisors found.
              </td>
            </tr>
          ) : (
            filtered.map((s) => (
              <tr key={s.supervisorId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="td">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={s.user.name} size="xs" />
                    <div>
                      <p className="font-semibold text-xs text-ink dark:text-white leading-tight">{s.user.name}</p>
                      <p className="text-[10px] text-slate-400">{s.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="td font-medium text-xs text-ink dark:text-white">{s.department}</td>
                <td className="td">{s.teamSize} employees</td>
                <td className="td font-bold text-sm text-brand-600 dark:text-brand-400">
                  {s.avgTeamScore}%
                </td>
                <td className="td">{s.tasksAssigned}</td>
                <td className="td">{s.tasksCompleted}</td>
                <td className="td">{s.reviewsGiven}</td>
                <td className="td">
                  {s.pendingReviews > 0 ? (
                    <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                      {s.pendingReviews} awaiting
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">0 pending</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </div>
  )
}
