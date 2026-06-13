import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, FileText, TrendingUp, CheckSquare, Calendar, Copy } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

const quickActions = [
  { label: '最近在跟进什么?', icon: CheckSquare },
  { label: '项目进展如何?', icon: TrendingUp },
  { label: '生成周报', icon: FileText },
  { label: '今日日程', icon: Calendar }
]

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '你好！我是你的 AI 助手，有什么可以帮你的？',
        timestamp: new Date().toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: text,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const responses = [
        '根据你最近的信息，你正在跟进「进度罗盘产品开发」项目，重点是完成PRD评审和设计稿反馈。建议你优先处理这两个高优先级任务。',
        '好的，我来帮你生成周报。本周你完成了用户调研总结，正在进行PRD评审，设计稿也已经收到。项目整体进展顺利，但需要注意资源紧张的风险。',
        '关于你关注的AI领域大事，最近OpenAI发布了GPT-5，这可能会影响我们产品的AI能力规划，建议持续关注。',
        '今日建议：先查看设计稿并给出反馈（明天截止），然后继续完成PRD评审（周五截止）。这两个是最紧急的任务。'
      ]

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickAction = (label: string) => {
    handleSend(label)
  }

  return (
    <div className="h-full flex flex-col bg-[#F7F8FC]">
      <div className="bg-white border-b border-[#E5E7EB] px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#5B6CFF] to-[#8B5CF6] rounded-2xl flex items-center justify-center shadow-md shadow-[#5B6CFF]/20">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#111827]">开心的助理</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">基于你所有信息的智能助手</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full animate-pulse" />
            <span className="text-sm text-[#6B7280]">在线</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 1 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[#111827] mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                快速操作
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.label)}
                      className="p-5 bg-white border border-[#E5E7EB] rounded-2xl text-left hover:border-[#5B6CFF]/20 hover:bg-[#5B6CFF]/5 transition-all group cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-[#F7F8FC] rounded-xl flex items-center justify-center group-hover:bg-[#5B6CFF]/10 transition-colors">
                          <Icon className="w-6 h-6 text-[#6B7280] group-hover:text-[#5B6CFF]" />
                        </div>
                        <span className="font-medium text-[#111827]">{action.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-4',
                message.role === 'user' && 'flex-row-reverse'
              )}
            >
              <div className={cn(
                'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0',
                message.role === 'assistant'
                  ? 'bg-gradient-to-br from-[#5B6CFF] to-[#8B5CF6] shadow-md shadow-[#5B6CFF]/20'
                  : 'bg-[#E5E7EB]'
              )}>
                {message.role === 'assistant' ? (
                  <Bot className="w-6 h-6 text-white" />
                ) : (
                  <User className="w-6 h-6 text-[#6B7280]" />
                )}
              </div>
              
              <div className={cn(
                'max-w-2xl',
                message.role === 'user' && 'text-right'
              )}>
                <div className={cn(
                  'rounded-2xl px-5 py-4',
                  message.role === 'assistant'
                    ? 'bg-white border border-[#E5E7EB] text-[#111827] shadow-sm'
                    : 'bg-[#5B6CFF] text-white shadow-md shadow-[#5B6CFF]/20'
                )}>
                  <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-[#9CA3AF]">{message.timestamp}</span>
                  {message.role === 'assistant' && (
                    <button className="text-xs text-[#9CA3AF] hover:text-[#6B7280] flex items-center gap-1 cursor-pointer">
                      <Copy className="w-3.5 h-3.5" />
                      复制
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-[#5B6CFF] to-[#8B5CF6] rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-[#5B6CFF]/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="bg-white border border-[#E5E7EB] rounded-2xl px-5 py-4 shadow-sm">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2.5 h-2.5 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-[#E5E7EB] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="输入你的问题..."
                className="w-full px-5 py-4 bg-[#F7F8FC] border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30 transition-all duration-200 pr-14"
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="px-6 py-4 bg-[#5B6CFF] text-white rounded-2xl hover:bg-[#4A5CE8] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md shadow-[#5B6CFF]/25"
            >
              <Send className="w-5 h-5" />
              发送
            </button>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-3 text-center">
            AI会基于你的事项、项目、团队动态和行业大事提供建议
          </p>
        </div>
      </div>
    </div>
  )
}
