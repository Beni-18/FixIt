import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'

export function ChatBot() {
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m the FixIT assistant. Ask me anything about your complaints or campus issues.' }
  ])
  const [input, setInput] = useState('')

  const { mutate: send, isPending } = useMutation({
    mutationFn: (msg) => api.post('/chat', { message: msg }),
    onSuccess: (res) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }])
    },
    onError: () => {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I\'m unavailable right now.' }])
    },
  })

  const handleSend = () => {
    if (!input.trim()) return
    const msg = input.trim()
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setInput('')
    send(msg)
  }

  if (!user) return null

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-brand-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-white">FixIT Assistant</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-72">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm
                    ${m.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isPending && (
                <div className="flex gap-1 px-3 py-2 bg-gray-100 rounded-xl w-14">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                </div>
              )}
            </div>

            <div className="flex gap-2 p-3 border-t border-gray-100">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message…"
                className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200
                  focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isPending}
                className="p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700
                  disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(!open)}
        className="w-12 h-12 bg-brand-600 rounded-full shadow-lg flex items-center justify-center
          text-white hover:bg-brand-700 transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
      </motion.button>
    </div>
  )
}
