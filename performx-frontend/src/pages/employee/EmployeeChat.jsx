import { useState, useEffect } from 'react'
import { MessageSquare, Send, CheckCheck, User, Shield } from 'lucide-react'
import { api } from '../../lib/api'
import { useApi, fmtDateTime } from '../../lib/utils'
import { useAuth } from '../../lib/auth'
import {
  PageHeader, UserAvatar, RoleBadge, LoadingSkeleton, ErrorState, useToast
} from '../../components/ui'

export default function EmployeeChat() {
  const { user } = useAuth()
  const toast = useToast()
  const { data: conversations, loading, error, reload } = useApi(api.chats)

  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  const chats = conversations || []

  useEffect(() => {
    if (chats.length > 0) {
      setActiveChat(chats[0])
    }
  }, [chats])

  useEffect(() => {
    if (!activeChat) {
      setMessages([])
      return
    }
    setMessagesLoading(true)
    api.messages(activeChat.id)
      .then(setMessages)
      .catch((err) => toast(err.message, 'error'))
      .finally(() => setMessagesLoading(false))
  }, [activeChat, toast])

  const supervisorUser = activeChat
    ? activeChat.sender.id === user.id ? activeChat.receiver : activeChat.sender
    : null

  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (!replyText.trim() || !activeChat) return
    setSending(true)
    try {
      const newMsg = await api.send({
        chatId: activeChat.id,
        text: replyText.trim(),
      })
      setMessages((prev) => [...prev, newMsg])
      setReplyText('')
      reload(true)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={8} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supervisor Chat"
        subtitle="Direct confidential channel with your designated team supervisor."
      />

      <div className="card overflow-hidden flex flex-col h-[580px]">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <UserAvatar name={supervisorUser?.name || 'Supervisor'} size="md" online />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-ink dark:text-white">{supervisorUser?.name || 'Assigned Supervisor'}</p>
                <RoleBadge role="SUPERVISOR" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{supervisorUser?.email} · Direct Communication</p>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messagesLoading ? (
            <p className="p-8 text-center text-xs text-slate-400">Loading messages…</p>
          ) : messages.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-400">No conversation history yet. Send a message to your supervisor below.</p>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === user.id
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 px-1">
                    <span>{isMe ? 'You' : m.senderName}</span>
                    <span>·</span>
                    <span>{fmtDateTime(m.sentAt)}</span>
                    {isMe && m.read && <CheckCheck size={12} className="text-brand-500" />}
                  </div>
                  <div
                    className={`max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                      isMe
                        ? 'bg-brand-600 text-white rounded-tr-sm'
                        : 'bg-slate-100 text-slate-900 rounded-tl-sm dark:bg-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Composer */}
        <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
          <input
            type="text"
            className="input flex-1 text-xs"
            placeholder={`Message ${supervisorUser?.name || 'your supervisor'}…`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button
            type="submit"
            disabled={sending || !replyText.trim()}
            className="btn-primary text-xs px-4"
          >
            <Send size={14} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  )
}
