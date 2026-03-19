import { useState, useEffect, useRef } from 'react'
import { X, Send, MessageCircle } from 'lucide-react'
import { chatAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

export default function ChatModal({ task, onClose }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)
  const bottomRef               = useRef(null)

  const loadMessages = async () => {
    try {
      const res = await chatAPI.getMessages(task.id)
      setMessages(res.data || [])
    } catch {}
  }

  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [task.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const h = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  const handleSend = async e => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      await chatAPI.sendMessage(task.id, text.trim())
      setText('')
      loadMessages()
    } catch {} finally { setSending(false) }
  }

  const otherPerson = user?.role === 'FARMER'
    ? (task.worker?.fullName || 'Worker')
    : (task.farmer?.fullName || 'Farmer')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col animate-fade-up overflow-hidden" style={{ height: '560px' }}>

        {/* Header */}
        <div className="bg-gradient-to-r from-leaf-600 to-leaf-500 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">{otherPerson}</p>
              <p className="text-leaf-100 text-xs truncate max-w-[180px]">{task.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-gray-400 text-sm">No messages yet</p>
              <p className="text-gray-300 text-xs">Start the conversation!</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.senderId === user?.id
              return (
                <div key={msg.id} className={clsx('flex', isMe ? 'justify-end' : 'justify-start')}>
                  <div className={clsx(
                    'max-w-[75%] rounded-2xl px-4 py-2.5',
                    isMe
                      ? 'bg-leaf-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100'
                  )}>
                    {!isMe && (
                      <p className={clsx('text-xs font-semibold mb-1',
                        msg.senderRole === 'FARMER' ? 'text-leaf-600' : 'text-soil-600'
                      )}>
                        {msg.senderName}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <p className={clsx('text-xs mt-1', isMe ? 'text-leaf-200' : 'text-gray-400')}>
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex gap-2 shrink-0">
          <input
            className="input-field flex-1 !py-2.5"
            placeholder="Type a message…"
            value={text}
            onChange={e => setText(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="w-10 h-10 rounded-xl bg-leaf-600 hover:bg-leaf-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
