import { useState } from 'react'
import { Users, Search, Download } from 'lucide-react'
import { api } from '../../lib/api'
import { useApi, fmtDate, exportCsv } from '../../lib/utils'
import {
  PageHeader, Card, Table, PerformanceBadge, ProgressBar, UserAvatar,
  SearchInput, Select, LoadingSkeleton, ErrorState, useToast
} from '../../components/ui'

export default function AdminEmployees() {
  const { data: employees, loading, error, reload } = useApi(api.admin.employees)
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')

  if (loading) return <LoadingSkeleton rows={10} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const allEmployees = employees || []

  const filtered = allEmployees.filter((e) => {
    const matchesSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      (e.employeeCode && e.employeeCode.toLowerCase().includes(search.toLowerCase())) ||
      (e.supervisorName && e.supervisorName.toLowerCase().includes(search.toLowerCase()))
    const matchesDept = deptFilter === 'ALL' || e.department === deptFilter
    return matchesSearch && matchesDept
  })

  const handleExport = () => {
    exportCsv('employees_performance.csv', filtered, [
      { label: 'Employee Code', value: (e) => e.employeeCode },
      { label: 'Name', value: (e) => e.name },
      { label: 'Email', value: (e) => e.email },
      { label: 'Department', value: (e) => e.department },
      { label: 'Designation', value: (e) => e.designation },
      { label: 'Supervisor', value: (e) => e.supervisorName || 'Unassigned' },
      { label: 'Performance Score', value: (e) => e.score },
      { label: 'Standing', value: (e) => e.level },
      { label: 'Tasks Assigned', value: (e) => e.tasksAssigned },
      { label: 'Tasks Completed', value: (e) => e.tasksCompleted },
      { label: 'Completion Rate', value: (e) => `${e.completionRate}%` },
    ])
    toast('Employees report exported to CSV.')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Employees"
        subtitle={`Directory of all ${allEmployees.length} employees with performance metrics and supervisor alignment.`}
        actions={
          <button onClick={handleExport} className="btn-secondary text-xs">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        }
      />

      <Card>
        {/* Filters */}
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by employee, code, or supervisor…"
            className="w-full sm:w-80"
          />

          <Select
            value={deptFilter}
            onChange={setDeptFilter}
            options={[
              { value: 'ALL', label: 'All Departments' },
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Product', label: 'Product' },
              { value: 'Design', label: 'Design' },
              { value: 'Sales', label: 'Sales' },
              { value: 'Operations', label: 'Operations' },
            ]}
            className="w-44 text-xs"
          />
        </div>

        <Table
          head={
            <>
              <th className="th">Employee</th>
              <th className="th">Code</th>
              <th className="th">Department / Role</th>
              <th className="th">Supervisor</th>
              <th className="th">Performance Score</th>
              <th className="th">Standing</th>
              <th className="th">Completion Rate</th>
              <th className="th">Joined</th>
            </>
          }
        >
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-10 text-center text-xs text-slate-400">
                No employees found matching current filters.
              </td>
            </tr>
          ) : (
            filtered.map((e) => (
              <tr key={e.employeeId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="td">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={e.name} size="xs" />
                    <div>
                      <p className="font-semibold text-xs text-ink dark:text-white leading-tight">{e.name}</p>
                      <p className="text-[10px] text-slate-400">{e.email}</p>
                    </div>
                  </div>
                </td>
                <td className="td font-mono text-xs">{e.employeeCode}</td>
                <td className="td">
                  <p className="font-medium text-xs text-ink dark:text-white">{e.designation}</p>
                  <p className="text-[10px] text-slate-400">{e.department}</p>
                </td>
                <td className="td text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {e.supervisorName || <span className="text-slate-400 italic">None</span>}
                </td>
                <td className="td font-bold text-sm text-brand-600 dark:text-brand-400">
                  {e.score}%
                </td>
                <td className="td"><PerformanceBadge level={e.level} /></td>
                <td className="td w-32">
                  <ProgressBar value={e.completionRate} showLabel />
                </td>
                <td className="td text-xs text-slate-500">{fmtDate(e.joiningDate)}</td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </div>
  )
}
