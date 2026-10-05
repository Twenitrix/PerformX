import { useState } from 'react'
import {
  UserPlus, Search, Edit2, ShieldAlert, CheckCircle, Ban, Filter, Check
} from 'lucide-react'
import { api } from '../../lib/api'
import { useApi, fmtDateTime } from '../../lib/utils'
import { useAuth } from '../../lib/auth'
import {
  PageHeader, Card, Table, StatusBadge, RoleBadge, UserAvatar, Modal,
  SearchInput, Select, LoadingSkeleton, ErrorState, useToast, Field
} from '../../components/ui'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const { data: users, loading, error, reload } = useApi(api.admin.users)
  const { data: supervisors } = useApi(api.admin.supervisors)
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [busy, setBusy] = useState(false)

  // Add user form state
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('Welcome@123')
  const [formRole, setFormRole] = useState('EMPLOYEE')
  const [formDept, setFormDept] = useState('Engineering')
  const [formPhone, setFormPhone] = useState('')
  const [formDesignation, setFormDesignation] = useState('Associate Engineer')
  const [formSupervisorId, setFormSupervisorId] = useState('')

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await api.admin.createUser({
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
        department: formDept,
        phone: formPhone,
        designation: formDesignation,
        supervisorId: formRole === 'EMPLOYEE' && formSupervisorId ? Number(formSupervisorId) : null,
      })
      toast('User successfully created.')
      setAddModalOpen(false)
      // Reset form
      setFormName('')
      setFormEmail('')
      reload(true)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleEditUser = async (e) => {
    e.preventDefault()
    if (!selectedUser) return
    setBusy(true)
    try {
      await api.admin.updateUser(selectedUser.id, {
        name: formName,
        department: formDept,
        phone: formPhone,
        supervisorId: selectedUser.role === 'EMPLOYEE' && formSupervisorId ? Number(formSupervisorId) : null,
      })
      toast('User details updated.')
      setEditModalOpen(false)
      reload(true)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggleAccess = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      toast('You cannot revoke your own admin access', 'error')
      return
    }
    const newStatus = !targetUser.active
    try {
      await api.admin.setStatus(targetUser.id, newStatus)
      toast(newStatus ? `Access granted to ${targetUser.name}` : `Access revoked for ${targetUser.name}`)
      reload(true)
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const openEdit = (u) => {
    setSelectedUser(u)
    setFormName(u.name || '')
    setFormDept(u.department || 'Engineering')
    setFormPhone(u.phone || '')
    setFormSupervisorId(u.supervisorId || '')
    setEditModalOpen(true)
  }

  if (loading) return <LoadingSkeleton rows={8} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const filtered = (users || []).filter((u) => {
    const matchesSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.employeeCode && u.employeeCode.toLowerCase().includes(search.toLowerCase()))
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? u.active : !u.active)
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Manage accounts, credentials, organizational roles, and system access."
        actions={
          <button onClick={() => setAddModalOpen(true)} className="btn-primary">
            <UserPlus size={16} />
            <span>Add User</span>
          </button>
        }
      />

      <Card>
        {/* Filters bar */}
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, employee ID…"
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
              className="w-36"
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'ALL', label: 'All Status' },
                { value: 'ACTIVE', label: 'Active Access' },
                { value: 'INACTIVE', label: 'Revoked Access' },
              ]}
              className="w-36"
            />
          </div>
        </div>

        {/* Users Table */}
        <Table
          head={
            <>
              <th className="th">Name / Identity</th>
              <th className="th">Employee ID</th>
              <th className="th">Role</th>
              <th className="th">Department</th>
              <th className="th">Status</th>
              <th className="th">Last Login</th>
              <th className="th">Access Control</th>
              <th className="th text-right">Actions</th>
            </>
          }
        >
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                No users found matching your filters.
              </td>
            </tr>
          ) : (
            filtered.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="td">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={u.name} size="sm" />
                    <div>
                      <p className="font-semibold text-ink dark:text-white leading-tight">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="td font-mono text-xs">{u.employeeCode || `ID-${u.id}`}</td>
                <td className="td"><RoleBadge role={u.role} /></td>
                <td className="td">{u.department || '—'}</td>
                <td className="td">
                  <StatusBadge status={u.active ? 'ACTIVE' : 'INACTIVE'} />
                </td>
                <td className="td text-xs text-slate-500">
                  {u.lastLogin ? fmtDateTime(u.lastLogin) : 'Never'}
                </td>
                <td className="td">
                  <button
                    onClick={() => toggleAccess(u)}
                    disabled={u.id === currentUser?.id}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                      u.active
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}
                  >
                    {u.active ? <Ban size={13} /> : <CheckCircle size={13} />}
                    {u.active ? 'Revoke Access' : 'Grant Access'}
                  </button>
                </td>
                <td className="td text-right">
                  <button
                    onClick={() => openEdit(u)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800"
                    title="Edit User"
                  >
                    <Edit2 size={15} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      {/* Add User Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New User"
        subtitle="Provision a new employee, supervisor, or administrator profile."
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Field label="Full Name">
            <input required className="input" placeholder="e.g. John Doe" value={formName} onChange={(e) => setFormName(e.target.value)} />
          </Field>
          <Field label="Work Email">
            <input required type="email" className="input" placeholder="john.doe@performx.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Initial Password">
              <input required className="input" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} />
            </Field>
            <Field label="System Role">
              <Select
                value={formRole}
                onChange={setFormRole}
                options={[
                  { value: 'EMPLOYEE', label: 'Employee' },
                  { value: 'SUPERVISOR', label: 'Supervisor' },
                  { value: 'ADMIN', label: 'Admin' },
                ]}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Department">
              <Select
                value={formDept}
                onChange={setFormDept}
                options={[
                  { value: 'Engineering', label: 'Engineering' },
                  { value: 'Product', label: 'Product' },
                  { value: 'Design', label: 'Design' },
                  { value: 'Sales', label: 'Sales' },
                  { value: 'Operations', label: 'Operations' },
                ]}
              />
            </Field>
            <Field label="Phone">
              <input className="input" placeholder="+91 9876543210" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
            </Field>
          </div>

          {formRole === 'EMPLOYEE' && (
            <>
              <Field label="Job Designation">
                <input className="input" placeholder="e.g. Frontend Engineer" value={formDesignation} onChange={(e) => setFormDesignation(e.target.value)} />
              </Field>
              <Field label="Assigned Supervisor">
                <Select
                  value={formSupervisorId}
                  onChange={setFormSupervisorId}
                  options={[
                    { value: '', label: 'Select a supervisor…' },
                    ...(supervisors || []).map((s) => ({
                      value: s.supervisorId,
                      label: `${s.user.name} (${s.department})`,
                    })),
                  ]}
                />
              </Field>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setAddModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit User: ${selectedUser?.name}`}
        subtitle="Modify profile details, department, or supervisor alignment."
      >
        <form onSubmit={handleEditUser} className="space-y-4">
          <Field label="Full Name">
            <input required className="input" value={formName} onChange={(e) => setFormName(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Department">
              <Select
                value={formDept}
                onChange={setFormDept}
                options={[
                  { value: 'Engineering', label: 'Engineering' },
                  { value: 'Product', label: 'Product' },
                  { value: 'Design', label: 'Design' },
                  { value: 'Sales', label: 'Sales' },
                  { value: 'Operations', label: 'Operations' },
                ]}
              />
            </Field>
            <Field label="Phone">
              <input className="input" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
            </Field>
          </div>

          {selectedUser?.role === 'EMPLOYEE' && (
            <Field label="Assigned Supervisor">
              <Select
                value={formSupervisorId}
                onChange={setFormSupervisorId}
                options={[
                  { value: '', label: 'Select a supervisor…' },
                  ...(supervisors || []).map((s) => ({
                    value: s.supervisorId,
                    label: `${s.user.name} (${s.department})`,
                  })),
                ]}
              />
            </Field>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setEditModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
