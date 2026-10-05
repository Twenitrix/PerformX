import { useState } from 'react'
import {
  CheckSquare, Clock, AlertCircle, CheckCircle2, Eye, Filter,
  Search, Sliders, ArrowRight
} from 'lucide-react'
import { api } from '../../lib/api'
import { useApi, fmtDate } from '../../lib/utils'
import {
  PageHeader, Card, Table, StatusBadge, PriorityBadge, ProgressBar,
  Modal, ConfirmationDialog, Tabs, SearchInput, LoadingSkeleton,
  ErrorState, useToast
} from '../../components/ui'

export default function EmployeeTasks() {
  const toast = useToast()
  const { data: tasks, loading, error, reload } = useApi(api.emp.tasks)

  const [activeTab, setActiveTab] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  // Progress update form
  const [progressVal, setProgressVal] = useState(0)
  const [updateNote, setUpdateNote] = useState('')

  const openTask = (t) => {
    setSelectedTask(t)
    setProgressVal(t.progress || 0)
    setUpdateNote(t.employeeUpdate || '')
    setTaskModalOpen(true)
  }

  const handleSaveProgress = async () => {
    if (!selectedTask) return
    setBusy(true)
    try {
      const updated = await api.emp.progress(selectedTask.id, Number(progressVal), updateNote)
      toast(Number(progressVal) === 100 ? 'Task marked 100% complete!' : 'Progress successfully saved.')
      setSelectedTask(updated)
      setTaskModalOpen(false)
      reload(true)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleCompleteTask = async () => {
    if (!selectedTask) return
    setBusy(true)
    try {
      const updated = await api.emp.complete(selectedTask.id)
      toast('Task successfully marked as completed!')
      setSelectedTask(updated)
      setConfirmCompleteOpen(false)
      setTaskModalOpen(false)
      reload(true)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
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
      t.supervisorName.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tasks"
        subtitle="Manage and execute your assigned deliverables, submit milestone progress, and mark tasks completed."
      />

      <Card>
        {/* Top Controls */}
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
            placeholder="Search my tasks…"
            className="w-full sm:w-72"
          />
        </div>

        {/* Task Table */}
        <Table
          head={
            <>
              <th className="th">Task Title</th>
              <th className="th">Assigned By</th>
              <th className="th">Priority</th>
              <th className="th">Deadline</th>
              <th className="th">Progress</th>
              <th className="th">Status</th>
              <th className="th text-right">Action</th>
            </>
          }
        >
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                No tasks found in this view.
              </td>
            </tr>
          ) : (
            filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="td max-w-xs">
                  <div className="cursor-pointer" onClick={() => openTask(t)}>
                    <p className="font-semibold text-xs text-ink dark:text-white truncate hover:text-brand-600 transition-colors">
                      {t.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{t.description || 'No description'}</p>
                  </div>
                </td>
                <td className="td text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {t.supervisorName}
                </td>
                <td className="td"><PriorityBadge priority={t.priority} /></td>
                <td className="td text-xs font-medium text-slate-700 dark:text-slate-300">{fmtDate(t.dueDate)}</td>
                <td className="td w-36">
                  <ProgressBar value={t.progress} showLabel />
                </td>
                <td className="td"><StatusBadge status={t.status} /></td>
                <td className="td text-right">
                  <button
                    onClick={() => openTask(t)}
                    className="btn-secondary text-xs py-1 px-2.5"
                  >
                    Open Task
                  </button>
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      {/* Task Modal with interactive slider and completion */}
      <Modal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        title={selectedTask?.title || 'Task Details'}
        subtitle={`Assigned by ${selectedTask?.supervisorName} · Due ${fmtDate(selectedTask?.dueDate)}`}
        width="max-w-xl"
      >
        {selectedTask && (
          <div className="space-y-5 text-xs">
            {/* Metadata badges */}
            <div className="flex items-center gap-2">
              <StatusBadge status={selectedTask.status} />
              <PriorityBadge priority={selectedTask.priority} />
              <span className="text-slate-400">· Weight: {selectedTask.performanceWeight}/10</span>
            </div>

            <div>
              <p className="font-semibold text-ink dark:text-white">Description</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedTask.description || 'No description provided.'}
              </p>
            </div>

            {selectedTask.expectedResult && (
              <div className="rounded-lg bg-indigo-50/60 p-3 text-indigo-950 dark:bg-indigo-950/40 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-900">
                <p className="font-semibold text-[11px] uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Expected Result / Definition of Done
                </p>
                <p className="mt-1">{selectedTask.expectedResult}</p>
              </div>
            )}

            {/* Supervisor feedback if present */}
            {selectedTask.supervisorFeedback && (
              <div className="rounded-lg bg-emerald-50/60 p-3 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-900">
                <p className="font-semibold text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Supervisor Feedback from {selectedTask.supervisorName}
                </p>
                <p className="mt-1 italic">"{selectedTask.supervisorFeedback}"</p>
              </div>
            )}

            {/* Interactive Progress Slider */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink dark:text-white">Update Progress</span>
                <span className="font-mono text-sm font-bold text-brand-600 dark:text-brand-400">
                  {progressVal}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                disabled={selectedTask.status === 'COMPLETED'}
                value={progressVal}
                onChange={(e) => setProgressVal(e.target.value)}
                className="w-full accent-brand-600 cursor-pointer"
              />

              <div>
                <label className="label">Add Status Update Note</label>
                <textarea
                  rows={2}
                  disabled={selectedTask.status === 'COMPLETED'}
                  className="input text-xs"
                  placeholder="Summarize recent progress, milestones achieved, or blockers encountered…"
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                />
              </div>

              {selectedTask.status !== 'COMPLETED' ? (
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleSaveProgress}
                    disabled={busy}
                    className="btn-primary text-xs"
                  >
                    Save Progress
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmCompleteOpen(true)}
                    disabled={busy}
                    className="btn-secondary text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                  >
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>Mark as Completed</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs pt-1">
                  <CheckCircle2 size={15} />
                  <span>Task has been marked as completed.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog for Completion */}
      <ConfirmationDialog
        open={confirmCompleteOpen}
        onClose={() => setConfirmCompleteOpen(false)}
        onConfirm={handleCompleteTask}
        title="Complete Task"
        message="Mark this task as completed? This will set delivery progress to 100%, record your completion timestamp, and update your personal performance metrics."
        confirmLabel="Complete Task"
        busy={busy}
      />
    </div>
  )
}
