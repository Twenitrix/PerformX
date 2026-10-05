import { useState } from 'react'
import { CheckSquare, Filter, Search, Download } from 'lucide-react'
import { api } from '../../lib/api'
import { useApi, fmtDate, exportCsv } from '../../lib/utils'
import {
  PageHeader, Card, Table, StatusBadge, PriorityBadge, ProgressBar,
  SearchInput, Select, LoadingSkeleton, ErrorState, useToast
} from '../../components/ui'

export default function AdminTaskAnalytics() {
  const { data: tasks, loading, error, reload } = useApi(api.admin.tasks)
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')

  if (loading) return <LoadingSkeleton rows={10} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const allTasks = tasks || []

  const filtered = allTasks.filter((t) => {
    const matchesSearch = !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      t.supervisorName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleExport = () => {
    exportCsv('all_organizational_tasks.csv', filtered, [
      { label: 'Task ID', value: (t) => t.id },
      { label: 'Title', value: (t) => t.title },
      { label: 'Employee', value: (t) => t.employeeName },
      { label: 'Supervisor', value: (t) => t.supervisorName },
      { label: 'Priority', value: (t) => t.priority },
      { label: 'Status', value: (t) => t.status },
      { label: 'Progress (%)', value: (t) => t.progress },
      { label: 'Assigned Date', value: (t) => t.assignedDate },
      { label: 'Due Date', value: (t) => t.dueDate },
      { label: 'Completed At', value: (t) => t.completedAt || 'Pending' },
    ])
    toast('Task audit logs exported to CSV.')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Task Analytics"
        subtitle={`Audit of all ${allTasks.length} managed deliverables across engineering, product, sales, and operations.`}
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
            placeholder="Search by title, employee, or supervisor…"
            className="w-full sm:w-80"
          />

          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'OVERDUE', label: 'Overdue' },
              ]}
              className="w-36 text-xs"
            />
            <Select
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: 'ALL', label: 'All Priorities' },
                { value: 'HIGH', label: 'High' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'LOW', label: 'Low' },
              ]}
              className="w-36 text-xs"
            />
          </div>
        </div>

        <Table
          head={
            <>
              <th className="th">Task Title</th>
              <th className="th">Assigned To</th>
              <th className="th">Supervisor</th>
              <th className="th">Priority</th>
              <th className="th">Assigned</th>
              <th className="th">Deadline</th>
              <th className="th">Progress</th>
              <th className="th">Status</th>
            </>
          }
        >
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-10 text-center text-xs text-slate-400">
                No tasks match your filters.
              </td>
            </tr>
          ) : (
            filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="td max-w-xs font-semibold text-xs text-ink dark:text-white truncate">
                  {t.title}
                </td>
                <td className="td text-xs">{t.employeeName}</td>
                <td className="td text-xs text-slate-500">{t.supervisorName}</td>
                <td className="td"><PriorityBadge priority={t.priority} /></td>
                <td className="td text-xs text-slate-500">{fmtDate(t.assignedDate)}</td>
                <td className="td text-xs font-medium text-slate-700 dark:text-slate-300">{fmtDate(t.dueDate)}</td>
                <td className="td w-32">
                  <ProgressBar value={t.progress} showLabel />
                </td>
                <td className="td"><StatusBadge status={t.status} /></td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </div>
  )
}
