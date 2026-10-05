import { useState, useEffect } from 'react'
import {
  MessageSquare, Send, Search, CheckCheck, User, Shield
} from 'lucide-react'
import { api } from '../../lib/api'
import { useApi, fmtDateTime, relTime } from '../../lib/utils'
import { useAuth } from '../../lib/auth'
import {
  PageHeader, UserAvatar, RoleBadge, SearchInput, LoadingSkeleton,
  ErrorState, useToast
} from '../../components/ui'

export default function SupervisorChats() {
  const { user } = useAuth()
  const toast = useToast()
  const { data: conversations, loading, error, reload } = useApi(api.chats)

  const [search, setSearch] = useState('')
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  const chats = conversations || []

  useEffect(() => {
    if (!selectedChatId && chats.length > 0) {
      setSelectedChatId(chats[0].id)
    }
  }, [chats, selectedChatId])

  useEffect(() => {
    if (!selectedChatId) {
      setMessages([])
      return
    }
    setMessagesLoading(true)
    api.messages(selectedChatId)
      .then(setMessages)
      .catch((err) => toast(err.message, 'error'))
      .finally(() => setMessagesLoading(false))
  }, [selectedChatId, toast])

  const selectedChat = chats.find((c) => c.id === selectedChatId)

  // Identify the other participant in the conversation
  const otherUser = selectedChat
    ? selectedChat.sender.id === user.id ? selectedChat.receiver : selectedChat.sender
    : null

  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (!replyText.trim() || !selectedChatId) return
    setSending(true)
    try {
      const newMsg = await api.send({
        chatId: selectedChatId,
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

  const filtered = chats.filter((c) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      c.sender.name.toLowerCase().includes(s) ||
      c.receiver.name.toLowerCase().includes(s) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(s))
    )
  })

  if (loading) return <LoadingSkeleton rows={8} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Chats"
        subtitle="Collaborate directly with team members, discuss milestones, and review blockers."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left: Team Conversation List */}
        <div className="lg:col-span-4 card flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search team chats…"
              className="w-full text-xs"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400">No conversations available.</p>
            ) : (
              filtered.map((c) => {
                const partner = c.sender.id === user.id ? c.receiver : c.sender
                const isSelected = c.id === selectedChatId
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedChatId(c.id)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-brand-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar name={partner.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-ink dark:text-white truncate">{partner.name}</p>
                          <span className="text-[10px] text-slate-400">{relTime(c.lastAt)}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{partner.department || 'Team Member'}</p>
                        <p className="text-xs text-slate-500 truncate mt-1">{c.lastMessage || 'Start conversation…'}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat View */}
        <div className="lg:col-span-8 card flex flex-col overflow-hidden">
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <UserAvatar name={otherUser?.name} size="sm" online />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-ink dark:text-white">{otherUser?.name}</p>
                      <RoleBadge role={otherUser?.role} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{otherUser?.email}</p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">Chat #{selectedChat.id}</span>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading ? (
                  <p className="p-8 text-center text-xs text-slate-400">Loading messages…</p>
                ) : messages.length === 0 ? (
                  <p className="p-8 text-center text-xs text-slate-400">No messages yet. Send a message below.</p>
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
                          className={`max-w-md rounded-2xl px-4 py-2 text-xs shadow-xs leading-relaxed ${
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

              {/* Send Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
                <input
                  type="text"
                  className="input flex-1 text-xs"
                  placeholder={`Reply to ${otherUser?.name}…`}
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
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare size={36} className="text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-medium">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
