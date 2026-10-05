import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Award, CheckSquare, MessageSquare, ArrowRight, Eye, Phone, Mail
} from 'lucide-react'
import { api } from '../../lib/api'
import { useApi, fmtDate } from '../../lib/utils'
import {
  PageHeader, Card, Table, PerformanceBadge, ProgressBar, UserAvatar,
  StatusBadge, Modal, LoadingSkeleton, ErrorState
} from '../../components/ui'

export default function SupervisorTeam() {
  const navigate = useNavigate()
  const { data: team, loading, error, reload } = useApi(api.sup.team)
  const [selectedMember, setSelectedMember] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const openMemberDetail = async (m) => {
    setSelectedMember(m)
    setDetailLoading(true)
    try {
      const d = await api.sup.member(m.employeeId)
      setDetailData(d)
    } catch (err) {
      console.error(err)
    } finally {
      setDetailLoading(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={8} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const members = team || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Members & Performance"
        subtitle="Roster of employees currently reporting to your supervision with individual scorecards."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => (
          <div
            key={m.employeeId}
            className="card p-5 hover:border-brand-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar name={m.name} size="md" />
                  <div>
                    <h3 className="font-semibold text-sm text-ink dark:text-white leading-tight">{m.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{m.designation || 'Team Member'}</p>
                  </div>
                </div>
                <PerformanceBadge level={m.level} />
              </div>

              {/* Score & metrics */}
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Score</p>
                  <p className="text-xl font-bold text-brand-600 dark:text-brand-400">{m.score}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Tasks Completed</p>
                  <p className="text-xl font-bold text-ink dark:text-white">{m.tasksCompleted} / {m.tasksAssigned}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500">Completion Rate</span>
                  <span className="font-semibold text-ink dark:text-white">{m.completionRate}%</span>
                </div>
                <ProgressBar value={m.completionRate} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">{m.employeeCode || `EMP-${m.employeeId}`}</span>
              <button
                onClick={() => openMemberDetail(m)}
                className="btn-secondary text-xs py-1 px-2.5"
              >
                <Eye size={13} />
                <span>View Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Member Details Modal */}
      <Modal
        open={!!selectedMember}
        onClose={() => { setSelectedMember(null); setDetailData(null) }}
        title={`${selectedMember?.name} — Performance Profile`}
        subtitle={`${selectedMember?.designation} · Joined ${fmtDate(selectedMember?.joiningDate)}`}
        width="max-w-2xl"
      >
        {detailLoading ? (
          <p className="p-8 text-center text-xs text-slate-400">Loading performance data…</p>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Contact row */}
            <div className="flex items-center gap-4 text-slate-500 border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="flex items-center gap-1.5"><Mail size={14} /> {selectedMember?.email}</span>
              <span className="flex items-center gap-1.5"><Phone size={14} /> {selectedMember?.phone || 'Not recorded'}</span>
            </div>

            {/* Task list preview */}
            <div>
              <p className="font-semibold text-ink dark:text-white mb-2">Assigned Tasks ({detailData?.tasks?.length || 0})</p>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {(detailData?.tasks || []).map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                    <div>
                      <p className="font-medium text-ink dark:text-white">{t.title}</p>
                      <p className="text-[10px] text-slate-400">Due {fmtDate(t.dueDate)} · {t.progress}% complete</p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Past Reviews */}
            <div>
              <p className="font-semibold text-ink dark:text-white mb-2">Quarterly Reviews ({detailData?.reviews?.length || 0})</p>
              <div className="space-y-2">
                {(detailData?.reviews || []).map((r) => (
                  <div key={r.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand-600 dark:text-brand-400">{r.reviewPeriod}</span>
                      <span className="font-semibold">{r.overallScore}%</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">{r.comments}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
