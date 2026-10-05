import { useState, useEffect } from 'react'
import {
  MessageSquare, Trash2, Search, ArrowRight, ShieldAlert, CheckCheck, Clock
} from 'lucide-react'
import { api } from '../../lib/api'
import { useApi, fmtDateTime, relTime } from '../../lib/utils'
import {
  PageHeader, Card, RoleBadge, UserAvatar, ConfirmationDialog,
  SearchInput, LoadingSkeleton, ErrorState, useToast
} from '../../components/ui'

export default function AdminChatMonitoring() {
  const { data: conversations, loading, error, reload } = useApi(api.admin.chats)
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const chats = conversations || []

  // Auto-select first chat if none selected
  useEffect(() => {
    if (!selectedChatId && chats.length > 0) {
      setSelectedChatId(chats[0].id)
    }
  }, [chats, selectedChatId])

  // Load messages for selected chat
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([])
      return
    }
    setMessagesLoading(true)
    api.admin.messages(selectedChatId)
      .then(setMessages)
      .catch((err) => toast(err.message, 'error'))
      .finally(() => setMessagesLoading(false))
  }, [selectedChatId, toast])

  const selectedChat = chats.find((c) => c.id === selectedChatId)

  const filteredChats = chats.filter((c) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      c.sender.name.toLowerCase().includes(s) ||
      c.receiver.name.toLowerCase().includes(s) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(s))
    )
  })

  const handleRemoveConversation = async () => {
    if (!selectedChatId) return
    setDeleting(true)
    try {
      await api.admin.removeChat(selectedChatId)
      toast('Conversation permanently removed by Administrator.')
      setConfirmDeleteOpen(false)
      setSelectedChatId(null)
      reload(true)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={8} />
  if (error) return <ErrorState error={error} onRetry={reload} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chat Monitoring"
        subtitle="Oversight of organizational communications, supervisor-employee interactions, and audit records."
        actions={
          selectedChat && (
            <button
              onClick={() => setConfirmDeleteOpen(true)}
              className="btn-danger text-xs"
            >
              <Trash2 size={14} />
              <span>Remove Conversation</span>
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
        {/* Left Panel: Conversation List */}
        <div className="lg:col-span-5 card flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search conversations by user or message…"
              className="w-full text-xs"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredChats.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400">No conversations found.</p>
            ) : (
              filteredChats.map((c) => {
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
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink dark:text-white truncate">
                          {c.sender.name}
                        </span>
                        <span className="text-[10px] text-slate-400">↔</span>
                        <span className="font-semibold text-ink dark:text-white truncate">
                          {c.receiver.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{relTime(c.lastAt)}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <RoleBadge role={c.sender.role} />
                      <span className="text-[10px] text-slate-400">to</span>
                      <RoleBadge role={c.receiver.role} />
                    </div>

                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-1">
                      {c.lastMessage || 'No messages'}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Panel: Conversation Thread */}
        <div className="lg:col-span-7 card flex flex-col overflow-hidden">
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <UserAvatar name={selectedChat.sender.name} size="sm" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-ink dark:text-white">{selectedChat.sender.name}</p>
                      <RoleBadge role={selectedChat.sender.role} />
                      <span className="text-xs text-slate-400">and</span>
                      <p className="text-xs font-semibold text-ink dark:text-white">{selectedChat.receiver.name}</p>
                      <RoleBadge role={selectedChat.receiver.role} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Thread started on {fmtDateTime(selectedChat.createdAt)} · Admin Audit Mode
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                  title="Remove Conversation"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <p className="p-8 text-center text-xs text-slate-400">Loading messages…</p>
                ) : messages.length === 0 ? (
                  <p className="p-8 text-center text-xs text-slate-400">No message records in this thread.</p>
                ) : (
                  messages.map((m) => {
                    const isSender = m.senderId === selectedChat.sender.id
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isSender ? 'items-start' : 'items-end'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{m.senderName}</span>
                          <span>·</span>
                          <span>{fmtDateTime(m.sentAt)}</span>
                          {m.read && <CheckCheck size={13} className="text-brand-500" />}
                        </div>
                        <div
                          className={`max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                            isSender
                              ? 'bg-slate-100 text-slate-900 rounded-tl-sm dark:bg-slate-800 dark:text-slate-100'
                              : 'bg-brand-600 text-white rounded-tr-sm'
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Admin Notice */}
              <div className="border-t border-slate-100 p-3 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 text-center text-[11px] text-slate-400">
                Administrators view organizational chats in read-only audit mode. To preserve compliance integrity, chats cannot be edited, only removed.
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare size={36} className="text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-medium">Select a conversation from the left to review messages</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleRemoveConversation}
        title="Remove Conversation"
        message="Are you sure you want to remove this entire conversation? All messages within this thread will be permanently deleted from organizational logs. This action cannot be undone."
        confirmLabel="Remove Chat"
        danger
        busy={deleting}
      />
    </div>
  )
}
