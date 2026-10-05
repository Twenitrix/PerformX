import { useState } from 'react'
import { FileText, Search, Filter, ShieldCheck, Download } from 'lucide-react'
import { api } from '../../lib/api'
import { useApi, fmtDateTime, fmtDuration, exportCsv } from '../../lib/utils'
import {
  PageHeader, Card, Table, StatusBadge, UserAvatar, SearchInput,
  Select, LoadingSkeleton, ErrorState, useToast
} from '../../components/ui'

export default function SupervisorLoginLogs() {
  const { data: logs, loading, error, reload } = useApi(api.sup.logs)
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  if (loading) return <LoadingSkeleton rows={8} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const allLogs = logs || []

  const filtered = allLogs.filter((l) => {
    const matchesSearch = !search ||
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.device.toLowerCase().includes(search.toLowerCase()) ||
      l.ipAddress.includes(search)
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleExport = () => {
    exportCsv('team_login_logs.csv', filtered, [
      { label: 'Employee', value: (l) => l.userName },
      { label: 'Login Time', value: (l) => l.loginTime },
      { label: 'Logout Time', value: (l) => l.logoutTime || 'Active' },
      { label: 'Duration (Mins)', value: (l) => l.sessionMinutes || '' },
      { label: 'Device', value: (l) => l.device },
      { label: 'IP Address', value: (l) => l.ipAddress },
      { label: 'Status', value: (l) => l.status },
    ])
    toast('Team login logs exported to CSV.')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Login Logs"
        subtitle="Audit session timestamps, devices, and authentication status for your team members."
        actions={
          <button onClick={handleExport} className="btn-secondary text-xs">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        }
      />

      <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3.5 text-xs text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200 flex items-center gap-2.5">
        <ShieldCheck size={16} className="text-sky-600 dark:text-sky-400 shrink-0" />
        <span>
          <strong>Audit Compliance Mode:</strong> Supervisors have read-only access to monitor team attendance. Logs cannot be modified or removed.
        </span>
      </div>

      <Card>
        {/* Filters */}
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search employee, device, or IP…"
            className="w-full sm:w-80"
          />

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'SUCCESSFUL', label: 'Successful' },
              { value: 'ACTIVE', label: 'Active Session' },
              { value: 'FAILED', label: 'Failed' },
            ]}
            className="w-40 text-xs"
          />
        </div>

        {/* Table */}
        <Table
          head={
            <>
              <th className="th">Employee</th>
              <th className="th">Login Time</th>
              <th className="th">Logout Time</th>
              <th className="th">Duration</th>
              <th className="th">Device / Client</th>
              <th className="th">IP Address</th>
              <th className="th">Status</th>
            </>
          }
        >
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-10 text-center text-xs text-slate-400">
                No team login logs found matching current filters.
              </td>
            </tr>
          ) : (
            filtered.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="td">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={l.userName} size="xs" />
                    <span className="font-semibold text-xs text-ink dark:text-white">{l.userName}</span>
                  </div>
                </td>
                <td className="td text-xs font-mono text-slate-600 dark:text-slate-300">{fmtDateTime(l.loginTime)}</td>
                <td className="td text-xs font-mono text-slate-500">{l.logoutTime ? fmtDateTime(l.logoutTime) : '—'}</td>
                <td className="td text-xs font-mono text-slate-500">{fmtDuration(l.sessionMinutes)}</td>
                <td className="td text-xs text-slate-600 dark:text-slate-300">{l.device || 'Web Browser'}</td>
                <td className="td font-mono text-xs text-slate-500">{l.ipAddress}</td>
                <td className="td"><StatusBadge status={l.status} /></td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </div>
  )
}
