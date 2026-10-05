import { useState } from 'react'
import {
  Award, PlusCircle, Sparkles, Star, Calendar, MessageSquare, Check
} from 'lucide-react'
import { api } from '../../lib/api'
import { useApi, fmtDate } from '../../lib/utils'
import {
  PageHeader, Card, Table, Modal, Select, Field, LoadingSkeleton,
  ErrorState, useToast, Spinner
} from '../../components/ui'

export default function SupervisorReviews() {
  const toast = useToast()
  const { data: reviews, loading, error, reload } = useApi(api.sup.reviews)
  const { data: team } = useApi(api.sup.team)

  const [modalOpen, setModalOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)

  // Review Form
  const [formEmpId, setFormEmpId] = useState('')
  const [formPeriod, setFormPeriod] = useState('2026 Q3')
  const [formProd, setFormProd] = useState(85)
  const [formQual, setFormQual] = useState(88)
  const [formAtt, setFormAtt] = useState(95)
  const [formComments, setFormComments] = useState('')
  const [formArea, setFormArea] = useState('Task Delivery')
  const [formRating, setFormRating] = useState(4)

  const handleAiSuggest = async () => {
    if (!formEmpId) {
      toast('Please select an employee first to generate insights.', 'info')
      return
    }
    setAiGenerating(true)
    try {
      const res = await api.aiFeedback(Number(formEmpId))
      setFormComments(res.suggestedFeedback)
      setFormRating(res.suggestedRating || 4)
      toast('AI insights generated based on employee delivery data.')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!formEmpId) return
    setBusy(true)
    try {
      await api.sup.submitReview({
        employeeId: Number(formEmpId),
        reviewPeriod: formPeriod,
        productivityScore: Number(formProd),
        qualityScore: Number(formQual),
        attendanceScore: Number(formAtt),
        comments: formComments,
        performanceArea: formArea,
        rating: Number(formRating),
      })
      toast('Performance review submitted and recorded.')
      setModalOpen(false)
      setFormComments('')
      reload(true)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={8} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const allReviews = reviews || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Reviews"
        subtitle="Evaluate quarterly employee milestones, calculate scoring weights, and issue structured feedback."
        actions={
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <PlusCircle size={16} />
            <span>Submit New Review</span>
          </button>
        }
      />

      <Card title="Submitted Performance Reviews" subtitle="Audit trail of quarterly reviews issued to your team">
        <Table
          head={
            <>
              <th className="th">Employee</th>
              <th className="th">Review Period</th>
              <th className="th">Productivity</th>
              <th className="th">Quality</th>
              <th className="th">Attendance</th>
              <th className="th">Overall Score</th>
              <th className="th">Rating</th>
              <th className="th">Review Date</th>
            </>
          }
        >
          {allReviews.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                No performance reviews submitted yet.
              </td>
            </tr>
          ) : (
            allReviews.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="td font-semibold text-xs text-ink dark:text-white">{r.employeeName}</td>
                <td className="td font-bold text-brand-600 dark:text-brand-400">{r.reviewPeriod}</td>
                <td className="td">{r.productivityScore}%</td>
                <td className="td">{r.qualityScore}%</td>
                <td className="td">{r.attendanceScore}%</td>
                <td className="td font-bold text-sm text-emerald-600 dark:text-emerald-400">{r.overallScore}%</td>
                <td className="td">
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: r.rating || 4 }).map((_, i) => (
                      <Star key={i} size={13} fill="currentColor" />
                    ))}
                  </div>
                </td>
                <td className="td text-xs text-slate-500">{fmtDate(r.reviewDate)}</td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      {/* Submit Review Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Submit Quarterly Performance Review"
        subtitle="Formal evaluation for employee milestone calculation"
        width="max-w-xl"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Employee">
              <Select
                required
                value={formEmpId}
                onChange={setFormEmpId}
                options={[
                  { value: '', label: 'Select employee…' },
                  ...(team || []).map((m) => ({
                    value: m.employeeId,
                    label: m.name,
                  })),
                ]}
              />
            </Field>

            <Field label="Review Period">
              <Select
                value={formPeriod}
                onChange={setFormPeriod}
                options={[
                  { value: '2026 Q3', label: '2026 Q3 (Current)' },
                  { value: '2026 Q2', label: '2026 Q2' },
                  { value: '2026 Q1', label: '2026 Q1' },
                ]}
              />
            </Field>
          </div>

          {/* Scores Row */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Productivity (0-100)">
              <input
                type="number"
                min={0}
                max={100}
                required
                className="input"
                value={formProd}
                onChange={(e) => setFormProd(e.target.value)}
              />
            </Field>
            <Field label="Quality (0-100)">
              <input
                type="number"
                min={0}
                max={100}
                required
                className="input"
                value={formQual}
                onChange={(e) => setFormQual(e.target.value)}
              />
            </Field>
            <Field label="Attendance (0-100)">
              <input
                type="number"
                min={0}
                max={100}
                required
                className="input"
                value={formAtt}
                onChange={(e) => setFormAtt(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Focus Area">
              <Select
                value={formArea}
                onChange={setFormArea}
                options={[
                  { value: 'Task Delivery', label: 'Task Delivery' },
                  { value: 'Communication', label: 'Communication' },
                  { value: 'Quality', label: 'Quality' },
                  { value: 'Collaboration', label: 'Collaboration' },
                  { value: 'Ownership', label: 'Ownership' },
                ]}
              />
            </Field>
            <Field label="Overall Star Rating (1-5)">
              <Select
                value={formRating}
                onChange={setFormRating}
                options={[
                  { value: 5, label: '★★★★★ (5 - Exceptional)' },
                  { value: 4, label: '★★★★☆ (4 - Exceeds Expectations)' },
                  { value: 3, label: '★★★☆☆ (3 - Meets Expectations)' },
                  { value: 2, label: '★★☆☆☆ (2 - Needs Improvement)' },
                  { value: 1, label: '★☆☆☆☆ (1 - Unsatisfactory)' },
                ]}
              />
            </Field>
          </div>

          {/* AI Suggestions button & Comments */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="label">Reviewer Comments & Feedback</span>
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={aiGenerating}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                {aiGenerating ? <Spinner size={13} /> : <Sparkles size={13} className="text-brand-600" />}
                <span>Smart AI Draft</span>
              </button>
            </div>
            <textarea
              required
              rows={4}
              className="input text-xs"
              placeholder="Detailed summary of accomplishments, feedback, and key growth objectives for next quarter…"
              value={formComments}
              onChange={(e) => setFormComments(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
