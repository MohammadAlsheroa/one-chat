'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id?: string
  role: string
  content: string
}

interface Props {
  conversationId: string | null
  initialMessages?: Message[]
  isOwner: boolean
  isForked?: boolean
}

export function ChatInterface({ conversationId, initialMessages = [], isOwner, isForked }: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [activeConversationId, setActiveConversationId] = useState(conversationId)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const centerTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  async function sendMessage() {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')

    let convId = activeConversationId
    let isNewConv = false

    if (!convId) {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) return
      const newConv = await res.json()
      convId = newConv.id
      setActiveConversationId(convId)
      isNewConv = true
      // Don't navigate yet — navigating now unmounts this component mid-stream
    }

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setStreaming(true)
    setStreamingText('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId, message: text }),
      })

      if (!response.ok || !response.body) {
        setStreaming(false)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const { text: t } = JSON.parse(data)
            if (t) {
              accumulated += t
              setStreamingText(accumulated)
            }
          } catch {}
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: accumulated }])
      setStreamingText('')
      if (isNewConv && convId) {
        router.replace(`/chat/${convId}`)
      }
    } finally {
      setStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Landing state: no conversation selected, no messages yet
  const isLanding = !activeConversationId && messages.length === 0 && !streaming

  if (isLanding && isOwner) {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-stone-50 items-center justify-center px-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-stone-700 tracking-tight mb-8">
          What&rsquo;s on your mind today?
        </h1>

        <div className="w-full max-w-2xl">
          <div className="flex items-end gap-3 bg-white border border-stone-200 rounded-2xl px-5 py-4 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <textarea
              ref={centerTextareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              rows={1}
              className="flex-1 bg-transparent text-stone-800 placeholder-stone-400 text-base resize-none outline-none max-h-40 overflow-y-auto"
              style={{ minHeight: '28px' }}
              autoFocus
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:cursor-not-allowed text-white rounded-xl p-2.5 transition-all active:scale-[0.95] shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-stone-400 mt-3">
            Enter to send &middot; Shift+Enter for new line &middot; All conversations are public
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-stone-50">
      {isForked && (
        <div className="bg-stone-100/80 border-b border-stone-200/80 px-6 py-2 flex items-center gap-2">
          <svg className="w-3 h-3 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10v10M7 17L17 7" />
          </svg>
          <span className="text-xs text-stone-500">Forked from a public chat</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-6">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start gap-3 max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full shrink-0 mt-0.5 flex items-center justify-center ${
                m.role === 'user'
                  ? 'bg-stone-200'
                  : 'bg-emerald-50 border border-emerald-100'
              }`}>
                {m.role === 'assistant' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
              </div>

              {/* Bubble */}
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-stone-900 text-stone-50 whitespace-pre-wrap'
                    : 'bg-white border border-stone-200 text-stone-800 prose prose-sm max-w-none shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]'
                }`}
              >
                {m.role === 'assistant' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {streamingText && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3 max-w-[75%]">
              <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 shrink-0 mt-0.5 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="rounded-2xl px-4 py-3 text-sm bg-white border border-stone-200 text-stone-800 prose prose-sm max-w-none leading-relaxed shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingText}</ReactMarkdown>
                <span className="inline-block w-0.5 h-4 bg-emerald-500/50 ml-0.5 animate-pulse align-middle rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Thinking dots */}
        {streaming && !streamingText && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 shrink-0 mt-0.5 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]">
                <div className="flex gap-1.5 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Bottom input */}
      {isOwner && (
        <div className="p-4 border-t border-stone-200/80 bg-white shrink-0">
          <div className="flex gap-3 items-end bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write something..."
              rows={1}
              disabled={streaming}
              className="flex-1 bg-transparent text-stone-800 placeholder-stone-400 text-sm resize-none outline-none max-h-40 overflow-y-auto"
              style={{ minHeight: '24px' }}
            />
            <button
              onClick={sendMessage}
              disabled={streaming || !input.trim()}
              className="text-emerald-600 hover:text-emerald-700 disabled:text-stone-300 transition-colors shrink-0 pb-0.5 active:scale-[0.9]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[11px] text-stone-400 mt-2">
            Enter to send &middot; Shift+Enter for new line
          </p>
        </div>
      )}

      {!isOwner && activeConversationId && (
        <div className="p-4 border-t border-stone-200/80 bg-white text-center text-sm text-stone-400 shrink-0">
          Read-only view
        </div>
      )}
    </div>
  )
}
