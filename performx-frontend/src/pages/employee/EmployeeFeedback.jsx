import { Award, Star, Calendar, MessageSquare, CheckCircle } from 'lucide-react'
import { api } from '../../lib/api'
import { useApi, fmtDate } from '../../lib/utils'
import { PageHeader, Card, LoadingSkeleton, ErrorState } from '../../components/ui'

export default function EmployeeFeedback() {
  const { data: feedbackList, loading, error, reload } = useApi(api.emp.feedback)

  if (loading) return <LoadingSkeleton rows={8} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const list = feedbackList || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Feedback"
        subtitle="Constructive notes, deliverable evaluations, and quarterly reviews from your supervisor."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.length === 0 ? (
          <div className="col-span-2 card p-12 text-center text-xs text-slate-400">
            No supervisor feedback records found.
          </div>
        ) : (
          list.map((item) => (
            <div
              key={item.id}
              className="card p-5 hover:border-brand-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {item.area || 'Deliverable Feedback'}
                    </span>
                    <h3 className="font-semibold text-sm text-ink dark:text-white mt-0.5">{item.context}</h3>
                  </div>

                  {item.rating && (
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" />
                      ))}
                    </div>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-indigo-500 pl-3">
                  "{item.feedback}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Supervisor: <strong className="text-slate-700 dark:text-slate-300">{item.supervisor}</strong></span>
                <span>{fmtDate(item.date)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
