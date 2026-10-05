import { useState } from 'react'
import {
  Trash2, Download, Search, Filter, ShieldCheck, AlertCircle, RefreshCw
} from 'lucide-react'
import { api } from '../../lib/api'
import { useApi, fmtDateTime, fmtDuration, exportCsv } from '../../lib/utils'
import {
  PageHeader, Card, Table, StatusBadge, RoleBadge, UserAvatar,
  ConfirmationDialog, SearchInput, Select, LoadingSkeleton, ErrorState, useToast
} from '../../components/ui'

export default function AdminAccessLogs() {
  const { data: logs, loading, error, reload } = useApi(api.admin.logs)
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (loading) return <LoadingSkeleton rows={10} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const allLogs = logs || []

  const filtered = allLogs.filter((l) => {
    const matchesSearch = !search ||
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.ipAddress.includes(search) ||
      (l.device && l.device.toLowerCase().includes(search.toLowerCase()))
    const matchesRole = roleFilter === 'ALL' || l.role === roleFilter
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((l) => l.id)))
    }
  }

  const toggleSelectOne = (id) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    setDeleting(true)
    try {
      const res = await api.admin.deleteLogs(Array.from(selectedIds))
      toast(`${res.removed} access log(s) permanently removed.`)
      setSelectedIds(new Set())
      setConfirmDeleteOpen(false)
      reload(true)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleExport = () => {
    exportCsv('performx_access_logs.csv', filtered, [
      { label: 'Log ID', value: (l) => l.id },
      { label: 'User', value: (l) => l.userName },
      { label: 'Role', value: (l) => l.role },
      { label: 'Department', value: (l) => l.department || '—' },
      { label: 'Login Time', value: (l) => l.loginTime },
      { label: 'Logout Time', value: (l) => l.logoutTime || 'Active' },
      { label: 'Duration (Mins)', value: (l) => l.sessionMinutes || '' },
      { label: 'IP Address', value: (l) => l.ipAddress },
      { label: 'Device', value: (l) => l.device },
      { label: 'Status', value: (l) => l.status },
    ])
    toast('Access logs exported to CSV.')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Access Logs"
        subtitle="Comprehensive audit trail of organizational authentication events and session activity."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="btn-secondary text-xs"
              title="Export as CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <button
              disabled={selectedIds.size === 0}
              onClick={() => setConfirmDeleteOpen(true)}
              className="btn-danger text-xs disabled:opacity-40"
            >
              <Trash2 size={14} />
              <span>Remove Selected ({selectedIds.size})</span>
            </button>
          </div>
        }
      />

      <Card>
        {/* Filters bar */}
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by user, IP address, device…"
            className="w-full sm:w-80"
          />

          <div className="flex items-center gap-2">
            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: 'ALL', label: 'All Roles' },
                { value: 'ADMIN', label: 'Admin' },
                { value: 'SUPERVISOR', label: 'Supervisor' },
                { value: 'EMPLOYEE', label: 'Employee' },
              ]}
              className="w-36 text-xs"
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'ALL', label: 'All Status' },
                { value: 'SUCCESSFUL', label: 'Successful' },
                { value: 'ACTIVE', label: 'Active Session' },
                { value: 'FAILED', label: 'Failed' },
              ]}
              className="w-36 text-xs"
            />
          </div>
        </div>

        {/* Logs Table */}
        <Table
          head={
            <>
              <th className="th w-10">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  checked={filtered.length > 0 && selectedIds.size === filtered.length}
                  onChange={toggleSelectAll}
                  aria-label="Select all logs"
                />
              </th>
              <th className="th">User</th>
              <th className="th">Role</th>
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
              <td colSpan={9} className="py-10 text-center text-xs text-slate-400">
                No access logs found matching current filters.
              </td>
            </tr>
          ) : (
            filtered.map((l) => {
              const isSelected = selectedIds.has(l.id)
              return (
                <tr
                  key={l.id}
                  className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                    isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  <td className="td w-10">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(l.id)}
                      aria-label={`Select log ${l.id}`}
                    />
                  </td>
                  <td className="td">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar name={l.userName} size="xs" />
                      <div>
                        <p className="font-semibold text-xs text-ink dark:text-white leading-tight">{l.userName}</p>
                        <p className="text-[10px] text-slate-400">{l.department || 'General'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="td"><RoleBadge role={l.role} /></td>
                  <td className="td text-xs font-mono text-slate-600 dark:text-slate-300">{fmtDateTime(l.loginTime)}</td>
                  <td className="td text-xs font-mono text-slate-500">{l.logoutTime ? fmtDateTime(l.logoutTime) : '—'}</td>
                  <td className="td text-xs font-mono text-slate-500">{fmtDuration(l.sessionMinutes)}</td>
                  <td className="td text-xs text-slate-600 dark:text-slate-300">{l.device || 'Web Browser'}</td>
                  <td className="td font-mono text-xs text-slate-500">{l.ipAddress}</td>
                  <td className="td"><StatusBadge status={l.status} /></td>
                </tr>
              )
            })
          )}
        </Table>
      </Card>

      {/* Confirmation Dialog for Log Deletion */}
      <ConfirmationDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteSelected}
        title="Remove Selected Access Logs"
        message={`Are you sure you want to permanently remove the ${selectedIds.size} selected access log record(s)? This action is audited and cannot be undone.`}
        confirmLabel="Remove Logs"
        danger
        busy={deleting}
      />
    </div>
  )
}
