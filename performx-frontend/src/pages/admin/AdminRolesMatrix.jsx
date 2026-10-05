import { Check, X, Shield, Lock, Info } from 'lucide-react'
import { PageHeader, Card, Table } from '../../components/ui'

const MATRIX = [
  { feature: 'View own performance', admin: true, supervisor: true, employee: true, note: 'All roles can track their individual progress' },
  { feature: 'View team performance', admin: true, supervisor: true, employee: false, note: 'Supervisors only see employees assigned to their team' },
  { feature: 'View organization performance', admin: true, supervisor: false, employee: false, note: 'Executive level dashboard with cross-department metrics' },
  { feature: 'Assign tasks', admin: true, supervisor: true, employee: false, note: 'Employees only execute assigned tasks' },
  { feature: 'Complete tasks', admin: true, supervisor: true, employee: true, note: 'Employees mark tasks finished; supervisors review acceptance' },
  { feature: 'View team login logs', admin: true, supervisor: true, employee: false, note: 'Supervisors view audit timestamps for supervised staff' },
  { feature: 'View system login logs', admin: true, supervisor: false, employee: false, note: 'Includes administrator, supervisor, and failed attempts' },
  { feature: 'Remove access logs', admin: true, supervisor: false, employee: false, note: 'Restricted strictly to Administrator for compliance' },
  { feature: 'Read team chats', admin: true, supervisor: true, employee: 'Own only', note: 'Employees can only converse with their supervisor' },
  { feature: 'Remove chats', admin: true, supervisor: false, employee: false, note: 'Organizational chat moderation is strictly Admin-only' },
  { feature: 'Manage users', admin: true, supervisor: false, employee: false, note: 'Provision accounts, update roles, assign supervisors' },
  { feature: 'Manage permissions & access', admin: true, supervisor: false, employee: false, note: 'Grant, revoke, or deactivate system accounts' },
]

export default function AdminRolesMatrix() {
  const renderCell = (val) => {
    if (val === true) {
      return (
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
          <Check size={14} strokeWidth={3} />
        </span>
      )
    }
    if (val === false) {
      return (
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
          <X size={14} strokeWidth={3} />
        </span>
      )
    }
    return (
      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
        {val}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role & Permission Matrix"
        subtitle="Visual representation of the 3-tier Role-Based Access Control (RBAC) model implemented in PERFORMX."
      />

      <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-indigo-900 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200 flex items-start gap-3">
        <Shield size={18} className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Security & Boundary Enforcement</p>
          <p className="mt-0.5 text-indigo-700/90 dark:text-indigo-300">
            Permissions in PERFORMX are strictly enforced on both the backend Spring Security filter chain and JPA database repositories. A user cannot bypass data boundaries by simply altering client state.
          </p>
        </div>
      </div>

      <Card title="Permissions & Capabilities Matrix" subtitle="Comparison of administrative, supervisory, and employee capabilities">
        <Table
          head={
            <>
              <th className="th w-1/3">Feature / Capability</th>
              <th className="th text-center w-28">Admin</th>
              <th className="th text-center w-28">Supervisor</th>
              <th className="th text-center w-28">Employee</th>
              <th className="th">Permission Rationale / Boundary</th>
            </>
          }
        >
          {MATRIX.map((item, idx) => (
            <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
              <td className="td font-semibold text-ink dark:text-white">{item.feature}</td>
              <td className="td text-center">{renderCell(item.admin)}</td>
              <td className="td text-center">{renderCell(item.supervisor)}</td>
              <td className="td text-center">{renderCell(item.employee)}</td>
              <td className="td text-xs text-slate-500">{item.note}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}
