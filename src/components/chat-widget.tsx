'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageCircle, X, ArrowLeft, Send, User as UserIcon } from 'lucide-react'
import { API_BASE_URL } from '@/services/api'
import { useAuth } from '@/lib/auth/auth-context'
import { cn } from '@/lib/utils'

interface ConversationSummary {
  user_id: number
  user_name: string
  user_image: string | null
  last_message: string
  last_sender: string
  last_at: string
  unread_count: number
}

interface ChatMessageRow {
  id: number
  user_id: number
  user_name: string
  user_image: string | null
  sender: string
  admin_name: string | null
  message: string
  is_read: boolean
  created_at: string
}

// Unread total we've already alerted for. Module-level, not a ref: every page wraps itself in
// <DashboardLayout>, so ChatWidget remounts on each sidebar click and a per-instance ref would
// restart at 0 and re-ring for messages the admin has already been alerted about.
let lastKnownUnread = 0

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ikigai_token') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

/** Short two-tone "ding" — no audio asset needed. */
function playAlertSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime
    ;[880, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = now + i * 0.15
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.25, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.3)
    })
    setTimeout(() => ctx.close(), 600)
  } catch {
    // Best-effort — a blocked AudioContext (no user gesture yet) shouldn't break the widget.
  }
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'à l\'instant'
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} h`
  return `${Math.floor(hours / 24)} j`
}

function Avatar({ src, name, size = 40 }: { src: string | null; name: string; size?: number }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?'
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0 bg-ikigai-light"
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
      />
    )
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-ikigai-primary text-white flex items-center justify-center flex-shrink-0 font-semibold text-sm"
    >
      {initials || <UserIcon className="w-4 h-4" />}
    </div>
  )
}

export function ChatWidget() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [thread, setThread] = useState<ChatMessageRow[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [totalUnread, setTotalUnread] = useState(0)

  const isOpenRef = useRef(isOpen)
  const selectedUserIdRef = useRef(selectedUserId)
  const threadEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])
  useEffect(() => {
    selectedUserIdRef.current = selectedUserId
  }, [selectedUserId])

  // Ask for desktop-notification permission once, on first mount.
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/admin/conversations`, { headers: authHeaders() })
      if (!res.ok) return
      const data: ConversationSummary[] = await res.json()
      setConversations(data)

      const total = data.reduce((sum, c) => sum + c.unread_count, 0)
      setTotalUnread(total)

      if (total > lastKnownUnread) {
        playAlertSound()
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && !document.hasFocus()) {
          const newest = data[0]
          new Notification('Nouveau message', {
            body: newest ? `${newest.user_name}: ${newest.last_message}` : 'Un client vous a écrit.',
          })
        }
      }
      lastKnownUnread = total
    } catch {
      // Network hiccup — the next poll will retry.
    }
  }, [])

  const fetchThread = useCallback(async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/admin/messages/${userId}`, { headers: authHeaders() })
      if (!res.ok) return
      const data: ChatMessageRow[] = await res.json()
      setThread(data)
    } catch {
      // Ignore — polled again shortly.
    }
  }, [])

  // Poll the conversation list continuously (drives the badge + sound alert).
  useEffect(() => {
    fetchConversations()
    const id = setInterval(fetchConversations, 6000)
    return () => clearInterval(id)
  }, [fetchConversations])

  // Poll the open thread more often while it's on screen.
  useEffect(() => {
    if (!isOpen || selectedUserId == null) return
    fetchThread(selectedUserId)
    const id = setInterval(() => fetchThread(selectedUserId), 4000)
    return () => clearInterval(id)
  }, [isOpen, selectedUserId, fetchThread])

  // Opening a conversation marks it read server-side — refresh the badge right after.
  useEffect(() => {
    if (selectedUserId != null) {
      fetchThread(selectedUserId).then(() => fetchConversations())
    }
  }, [selectedUserId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  const sendReply = async () => {
    const message = draft.trim()
    if (!message || selectedUserId == null || sending) return
    setSending(true)
    setDraft('')
    try {
      const res = await fetch(`${API_BASE_URL}/chat/admin/messages/${selectedUserId}/reply`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ message, adminName: user?.name || 'Service Client' }),
      })
      if (res.ok) {
        await fetchThread(selectedUserId)
        await fetchConversations()
      } else {
        setDraft(message) // put it back so nothing is lost
      }
    } catch {
      setDraft(message)
    } finally {
      setSending(false)
    }
  }

  const selectedConvo = conversations.find((c) => c.user_id === selectedUserId) || null

  return (
    <>
      {/* Floating toggle */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-ikigai-primary hover:bg-ikigai-secondary text-white shadow-lg flex items-center justify-center transition-colors"
        aria-label="Chat support"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!isOpen && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {/* Side panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-screen w-full sm:w-[380px] bg-white dark:bg-[hsl(220,20%,9%)] shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {selectedUserId == null ? (
          <>
            <div className="px-4 py-4 bg-ikigai-primary text-white flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="font-semibold text-base">Support client</h2>
                <p className="text-xs text-white/70">{totalUnread} message{totalUnread === 1 ? '' : 's'} non lu{totalUnread === 1 ? '' : 's'}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">Aucune conversation pour l&apos;instant.</div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.user_id}
                    onClick={() => setSelectedUserId(c.user_id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-white/5 text-left"
                  >
                    <Avatar src={c.user_image} name={c.user_name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{c.user_name}</span>
                        <span className="text-[11px] text-gray-400 flex-shrink-0">{timeAgo(c.last_at)}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {c.last_sender === 'admin' ? 'Vous: ' : ''}
                        {c.last_message}
                      </p>
                    </div>
                    {c.unread_count > 0 && (
                      <span className="min-w-[20px] h-5 px-1 rounded-full bg-ikigai-gold text-ikigai-primary text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                        {c.unread_count}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="px-3 py-3 bg-ikigai-primary text-white flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setSelectedUserId(null)} className="p-1.5 rounded-full hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Avatar src={selectedConvo?.user_image ?? null} name={selectedConvo?.user_name ?? 'Client'} size={32} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{selectedConvo?.user_name ?? 'Client'}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-gray-50 dark:bg-[hsl(220,20%,7%)]">
              {thread.map((m) => (
                <div key={m.id} className={cn('flex', m.sender === 'admin' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                      m.sender === 'admin'
                        ? 'bg-ikigai-primary text-white rounded-br-sm'
                        : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-sm',
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.message}</p>
                    <p className={cn('text-[10px] mt-1', m.sender === 'admin' ? 'text-white/60' : 'text-gray-400')}>
                      {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={threadEndRef} />
            </div>
            <div className="p-3 border-t border-gray-100 dark:border-white/5 flex items-center gap-2 flex-shrink-0">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendReply()
                  }
                }}
                placeholder="Répondre..."
                className="flex-1 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-ikigai-accent"
              />
              <button
                onClick={sendReply}
                disabled={sending || !draft.trim()}
                className="w-10 h-10 rounded-full bg-ikigai-primary text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
