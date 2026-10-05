import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  CheckSquare, PlusCircle, Filter, Search, Edit2, MessageSquare,
  CheckCircle2, Clock, AlertCircle, Eye
} from 'lucide-react'
import { api } from '../../lib/api'
import { useApi, fmtDate, today } from '../../lib/utils'
import {
  PageHeader, Card, Table, StatusBadge, PriorityBadge, ProgressBar,
  UserAvatar, Modal, Tabs, SearchInput, Select, Field, LoadingSkeleton,
  ErrorState, useToast
} from '../../components/ui'

export default function SupervisorTasks() {
  const location = useLocation()
  const toast = useToast()
  const { data: tasks, loading, error, reload } = useApi(api.sup.tasks)
  const { data: team } = useApi(api.sup.team)

  const [activeTab, setActiveTab] = useState('ALL')
  const [search, setSearch] = useState('')
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [busy, setBusy] = useState(false)

  // Assign task form
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formEmpId, setFormEmpId] = useState('')
  const [formPriority, setFormPriority] = useState('MEDIUM')
  const [formStartDate, setFormStartDate] = useState(today())
  const [formDueDate, setFormDueDate] = useState('')
  const [formExpected, setFormExpected] = useState('')
  const [formWeight, setFormWeight] = useState(5)

  // Supervisor feedback form
  const [feedbackText, setFeedbackText] = useState('')

  // Check URL query action
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('action') === 'assign') {
      setAssignModalOpen(true)
    }
  }, [location.search])

  const handleAssignTask = async (e) => {
    e.preventDefault()
    if (!formEmpId || !formDueDate) return
    setBusy(true)
    try {
      await api.sup.assign({
        title: formTitle,
        description: formDesc,
        employeeId: Number(formEmpId),
        priority: formPriority,
        startDate: formStartDate,
        dueDate: formDueDate,
        expectedResult: formExpected,
        performanceWeight: Number(formWeight),
      })
      toast('Task successfully assigned.')
      setAssignModalOpen(false)
      // Reset form
      setFormTitle('')
      setFormDesc('')
      setFormExpected('')
      reload(true)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleSaveFeedback = async () => {
    if (!selectedTask || !feedbackText.trim()) return
    setBusy(true)
    try {
      const updated = await api.sup.feedback(selectedTask.id, feedbackText)
      toast('Feedback saved and shared with employee.')
      setSelectedTask(updated)
      reload(true)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleMarkReviewed = async () => {
    if (!selectedTask) return
    setBusy(true)
    try {
      const updated = await api.sup.review(selectedTask.id)
      toast('Task marked as reviewed.')
      setSelectedTask(updated)
      reload(true)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const openDetails = (t) => {
    setSelectedTask(t)
    setFeedbackText(t.supervisorFeedback || '')
    setDetailsModalOpen(true)
  }

  if (loading) return <LoadingSkeleton rows={8} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const allTasks = tasks || []

  const counts = {
    ALL: allTasks.length,
    PENDING: allTasks.filter((t) => t.status === 'PENDING').length,
    IN_PROGRESS: allTasks.filter((t) => t.status === 'IN_PROGRESS').length,
    COMPLETED: allTasks.filter((t) => t.status === 'COMPLETED').length,
    OVERDUE: allTasks.filter((t) => t.status === 'OVERDUE').length,
  }

  const filtered = allTasks.filter((t) => {
    const matchesTab = activeTab === 'ALL' || t.status === activeTab
    const matchesSearch = !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeName.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Management"
        subtitle="Assign work items, set milestones, track delivery velocity, and review completed results."
        actions={
          <button onClick={() => setAssignModalOpen(true)} className="btn-primary">
            <PlusCircle size={16} />
            <span>Assign Task</span>
          </button>
        }
      />

      <Card>
        {/* Top Controls: Tabs & Search */}
        <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800">
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            tabs={[
              { value: 'ALL', label: 'All Tasks', count: counts.ALL },
              { value: 'PENDING', label: 'Pending', count: counts.PENDING },
              { value: 'IN_PROGRESS', label: 'In Progress', count: counts.IN_PROGRESS },
              { value: 'COMPLETED', label: 'Completed', count: counts.COMPLETED },
              { value: 'OVERDUE', label: 'Overdue', count: counts.OVERDUE },
            ]}
          />

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search tasks or assignees…"
            className="w-full sm:w-72"
          />
        </div>

        {/* Task Management Table */}
        <Table
          head={
            <>
              <th className="th">Task Title</th>
              <th className="th">Assigned To</th>
              <th className="th">Priority</th>
              <th className="th">Assigned Date</th>
              <th className="th">Deadline</th>
              <th className="th">Progress</th>
              <th className="th">Status</th>
              <th className="th text-right">Actions</th>
            </>
          }
        >
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                No tasks found in this view.
              </td>
            </tr>
          ) : (
            filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="td max-w-xs">
                  <div className="cursor-pointer" onClick={() => openDetails(t)}>
                    <p className="font-semibold text-xs text-ink dark:text-white truncate hover:text-brand-600 transition-colors">
                      {t.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{t.description || 'No description'}</p>
                  </div>
                </td>
                <td className="td">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={t.employeeName} size="xs" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t.employeeName}</span>
                  </div>
                </td>
                <td className="td"><PriorityBadge priority={t.priority} /></td>
                <td className="td text-xs text-slate-500">{fmtDate(t.assignedDate)}</td>
                <td className="td text-xs font-medium text-slate-700 dark:text-slate-300">{fmtDate(t.dueDate)}</td>
                <td className="td w-36">
                  <ProgressBar value={t.progress} showLabel />
                </td>
                <td className="td"><StatusBadge status={t.status} /></td>
                <td className="td text-right">
                  <button
                    onClick={() => openDetails(t)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    <Eye size={14} />
                    <span>Details</span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      {/* Assign Task Modal */}
      <Modal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign New Task"
        subtitle="Define deliverables, set expected outcomes, and allocate to team member."
        width="max-w-xl"
      >
        <form onSubmit={handleAssignTask} className="space-y-4">
          <Field label="Task Title">
            <input
              required
              className="input"
              placeholder="e.g. Implement OAuth token refresh flow"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </Field>

          <Field label="Task Description">
            <textarea
              rows={3}
              className="input"
              placeholder="Detailed description of technical requirements, constraints, and references…"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Assign Employee">
              <Select
                required
                value={formEmpId}
                onChange={setFormEmpId}
                options={[
                  { value: '', label: 'Select team member…' },
                  ...(team || []).map((m) => ({
                    value: m.employeeId,
                    label: `${m.name} (${m.designation || 'Staff'})`,
                  })),
                ]}
              />
            </Field>

            <Field label="Priority Level">
              <Select
                value={formPriority}
                onChange={setFormPriority}
                options={[
                  { value: 'HIGH', label: 'High Priority' },
                  { value: 'MEDIUM', label: 'Medium Priority' },
                  { value: 'LOW', label: 'Low Priority' },
                ]}
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Start Date">
              <input
                type="date"
                required
                className="input"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
              />
            </Field>

            <Field label="Deadline Date">
              <input
                type="date"
                required
                className="input"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
              />
            </Field>

            <Field label="Weight (1-10)">
              <input
                type="number"
                min={1}
                max={10}
                required
                className="input"
                value={formWeight}
                onChange={(e) => setFormWeight(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Expected Result / Definition of Done">
            <input
              className="input"
              placeholder="e.g. Code reviewed, tested with 80%+ coverage, deployed to staging"
              value={formExpected}
              onChange={(e) => setFormExpected(e.target.value)}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setAssignModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? 'Assigning…' : 'Assign Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Details & Review Modal */}
      <Modal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Task Overview & Feedback"
        subtitle={`ID: T-${selectedTask?.id} · Assigned to ${selectedTask?.employeeName}`}
        width="max-w-2xl"
      >
        {selectedTask && (
          <div className="space-y-5 text-xs">
            {/* Top metadata grid */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Status</p>
                <div className="mt-1"><StatusBadge status={selectedTask.status} /></div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Priority</p>
                <div className="mt-1"><PriorityBadge priority={selectedTask.priority} /></div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Assigned</p>
                <p className="font-semibold text-ink dark:text-white mt-1">{fmtDate(selectedTask.assignedDate)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Deadline</p>
                <p className="font-semibold text-ink dark:text-white mt-1">{fmtDate(selectedTask.dueDate)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-ink dark:text-white">{selectedTask.title}</p>
              <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {selectedTask.description || 'No detailed instructions provided.'}
              </p>
            </div>

            {selectedTask.expectedResult && (
              <div className="rounded-lg bg-indigo-50/60 p-3 text-indigo-950 dark:bg-indigo-950/40 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-900">
                <p className="font-semibold text-[11px] uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Expected Result / Acceptance Criteria
                </p>
                <p className="mt-1">{selectedTask.expectedResult}</p>
              </div>
            )}

            {/* Current progress */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-ink dark:text-white">Delivery Progress</span>
                <span className="font-mono text-slate-500">{selectedTask.progress}% Complete</span>
              </div>
              <ProgressBar value={selectedTask.progress} size="lg" />
            </div>

            {/* Employee latest update note */}
            <div>
              <p className="font-semibold text-ink dark:text-white">Employee Progress Update</p>
              <div className="mt-1 rounded-lg border border-slate-200 bg-white p-3 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                {selectedTask.employeeUpdate || 'No status updates logged yet by employee.'}
              </div>
            </div>

            {/* Supervisor feedback section */}
            <div>
              <p className="font-semibold text-ink dark:text-white">Supervisor Feedback</p>
              <p className="text-[11px] text-slate-400 mb-1">
                Provide constructive feedback, notes on deliverables, or areas for improvement.
              </p>
              <textarea
                rows={3}
                className="input"
                placeholder="Add guidance or review commentary for this deliverable…"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleSaveFeedback}
                  disabled={busy || !feedbackText.trim()}
                  className="btn-secondary text-xs"
                >
                  Save Feedback
                </button>

                {selectedTask.status === 'COMPLETED' && !selectedTask.reviewed && (
                  <button
                    type="button"
                    onClick={handleMarkReviewed}
                    disabled={busy}
                    className="btn-primary text-xs"
                  >
                    <CheckCircle2 size={14} />
                    <span>Mark as Reviewed</span>
                  </button>
                )}
                {selectedTask.reviewed && (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                    <CheckCircle2 size={14} /> Reviewed by Supervisor
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
