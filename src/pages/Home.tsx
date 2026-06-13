import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Play,
  FileText,
  Sparkles,
  TrendingUp,
  Users,
  Newspaper,
  Clock,
  ArrowRight,
  Calendar,
  CheckCircle,
  Zap,
  Compass
} from 'lucide-react'
import { getTodos, getProjects, getNews } from '../services/dashboard'
import type { TodoItem } from '../types/dashboard'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export function Home() {
  const navigate = useNavigate()
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  const [todos, setTodos] = useState<TodoItem[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [newsList, setNewsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const todayDate = new Date().toISOString().split('T')[0]
    setLoading(true)
    Promise.all([
      getTodos(todayDate).then(res => res.data),
      getProjects().then(res => res.data),
      getNews('all').then(res => res.data)
    ]).then(([todosData, projectsData, newsData]) => {
      setTodos(todosData || [])
      setProjects(projectsData || [])
      setNewsList(newsData || [])
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  const highPriorityItems = todos
    .filter(item => item.priority === 'high' && item.status !== 'done')
    .map(item => ({
      id: item.id,
      title: item.content,
      description: item.remark || '',
      priority: item.priority,
      status: item.status,
      deadline: '',
      assignee: '',
      latestProgress: ''
    }))
  const pendingItemsCount = todos.filter(i => i.status !== 'done').length

  const handleGenerateReport = () => {
    alert('生成周报功能已触发！')
  }

  const getAISummary = () => {
    let summary = '你今天有'
    if (highPriorityItems.length > 0) {
      summary += `${highPriorityItems.length}个高优先事项`
    }
    summary += '，建议优先完成PRD评审'
    return summary
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] p-8 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-[#5B6CFF]/5 via-[#8B5CF6]/5 to-[#5B6CFF]/5 rounded-3xl p-8 border border-[#5B6CFF]/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#5B6CFF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-[#E5E7EB]">
                  <Compass className="w-6 h-6 text-[#5B6CFF]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#111827]">欢迎回来</h1>
                  <p className="text-[#6B7280] text-sm mt-0.5">{today}</p>
                </div>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-[#E5E7EB]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#5B6CFF] to-[#8B5CF6] rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111827] mb-1.5">AI 今日摘要</p>
                    <p className="text-[#6B7280] text-sm leading-relaxed">{getAISummary()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={() => navigate('/items')}
                className="flex-1 sm:flex-none px-6 py-3.5 bg-[#5B6CFF] text-white rounded-2xl font-medium hover:bg-[#4A5CE8] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#5B6CFF]/25 hover:shadow-[#5B6CFF]/35"
              >
                <Play className="w-4.5 h-4.5 fill-current" />
                开始今日梳理
              </button>
              <button
                onClick={handleGenerateReport}
                className="flex-1 sm:flex-none px-6 py-3.5 bg-white text-[#111827] rounded-2xl font-medium hover:bg-[#F7F8FC] transition-all duration-200 flex items-center justify-center gap-2 border border-[#E5E7EB] shadow-sm"
              >
                <FileText className="w-4.5 h-4.5" />
                生成周报
              </button>
              <button
                onClick={() => navigate('/assistant')}
                className="flex-1 sm:flex-none px-6 py-3.5 bg-white text-[#5B6CFF] rounded-2xl font-medium hover:bg-[#5B6CFF]/5 transition-all duration-200 flex items-center justify-center gap-2 border border-[#5B6CFF]/20"
              >
                <Sparkles className="w-4.5 h-4.5" />
                AI 助手
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div
            className="group bg-white rounded-3xl p-6 border border-[#E5E7EB] hover:border-[#5B6CFF]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#5B6CFF]/10 cursor-pointer"
            onClick={() => navigate('/items')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#5B6CFF]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#5B6CFF]/15 transition-colors">
                <CheckCircle className="w-6 h-6 text-[#5B6CFF]" />
              </div>
              <div className="flex items-center gap-1 text-[#10B981] text-xs font-medium bg-[#10B981]/10 px-2.5 py-1 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+2</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-[#111827] mb-1">{pendingItemsCount}</p>
            <p className="text-[#6B7280] text-sm">待办事项</p>
          </div>

          <div
            className="group bg-white rounded-3xl p-6 border border-[#E5E7EB] hover:border-[#10B981]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#10B981]/10 cursor-pointer"
            onClick={() => navigate('/team')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#10B981]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#10B981]/15 transition-colors">
                <Users className="w-6 h-6 text-[#10B981]" />
              </div>
            </div>
            <p className="text-4xl font-bold text-[#111827] mb-1">{loading ? 0 : projects.length}</p>
            <p className="text-[#6B7280] text-sm">团队动态</p>
          </div>

          <div
            className="group bg-white rounded-3xl p-6 border border-[#E5E7EB] hover:border-[#F59E0B]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#F59E0B]/10 cursor-pointer"
            onClick={() => navigate('/events')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#F59E0B]/15 transition-colors">
                <Newspaper className="w-6 h-6 text-[#F59E0B]" />
              </div>
            </div>
            <p className="text-4xl font-bold text-[#111827] mb-1">{loading ? 0 : newsList.length}</p>
            <p className="text-[#6B7280] text-sm">行业大事</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#5B6CFF]/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#5B6CFF]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111827]">今日重点</h2>
                  <p className="text-[#6B7280] text-sm">需要优先处理的事项</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/items')}
                className="text-[#5B6CFF] text-sm font-medium hover:text-[#4A5CE8] transition-colors flex items-center gap-1"
              >
                查看全部
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {highPriorityItems.slice(0, 1).map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-r from-[#5B6CFF]/10 to-[#8B5CF6]/5 rounded-3xl p-7 border border-[#5B6CFF]/20 cursor-pointer hover:shadow-xl hover:shadow-[#5B6CFF]/15 transition-all duration-300 hover:-translate-y-0.5"
                  onClick={() => navigate(`/item/${item.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-1.5 bg-[#EF4444]/15 text-[#EF4444] text-sm font-bold rounded-full">
                        高优先级
                      </div>
                      {item.deadline && (
                        <div className="px-4 py-1.5 bg-[#111827]/5 text-[#6B7280] text-sm rounded-full flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {item.deadline}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#6B7280] bg-white px-3 py-1 rounded-full border border-[#E5E7EB]">
                        进度 75%
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#111827] mb-2">{item.title}</h3>
                  <p className="text-[#6B7280] text-sm mb-5 leading-relaxed">{item.description}</p>
                  
                  <div className="w-full bg-white rounded-full h-2.5 mb-5 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#5B6CFF] to-[#8B5CF6] h-2.5 rounded-full w-[75%]" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1.5 bg-white text-[#6B7280] text-sm rounded-xl border border-[#E5E7EB]">
                        {item.assignee}
                      </span>
                      <span className="px-3 py-1.5 bg-white text-[#6B7280] text-sm rounded-xl border border-[#E5E7EB]">
                        最新: {item.latestProgress}
                      </span>
                    </div>
                    <button className="px-5 py-2.5 bg-[#5B6CFF] text-white text-sm font-medium rounded-xl hover:bg-[#4A5CE8] transition-colors flex items-center gap-2">
                      继续处理
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {highPriorityItems.slice(1, 4).map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 border border-[#E5E7EB] hover:border-[#5B6CFF]/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/item/${item.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-[#EF4444]/10 text-[#EF4444] text-xs font-bold rounded-full">
                        高优先级
                      </div>
                      {item.deadline && (
                        <div className="px-3 py-1 bg-[#F7F8FC] text-[#6B7280] text-xs rounded-full flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.deadline}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-[#111827] mb-1.5">{item.title}</h3>
                  <p className="text-[#6B7280] text-sm mb-4 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B7280]">{item.assignee}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#6B7280]">{item.latestProgress}</span>
                      <ArrowRight className="w-4 h-4 text-[#5B6CFF]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#10B981]/10 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#111827]">新增变化</h2>
                <p className="text-[#6B7280] text-sm">重要动态情报</p>
              </div>
            </div>

            <div className="space-y-3">
              {(projects || []).slice(0, 5).map((update, idx) => (
                <div
                  key={update.id || idx}
                  className="bg-white rounded-2xl p-5 border border-[#E5E7EB] hover:border-[#5B6CFF]/20 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => navigate('/team')}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      update.priority === 'high' && 'bg-[#5B6CFF]/10 text-[#5B6CFF]',
                      update.priority === 'medium' && 'bg-[#10B981]/10 text-[#10B981]',
                      update.priority === 'low' && 'bg-[#F59E0B]/10 text-[#F59E0B]',
                      !['high', 'medium', 'low'].includes(update.priority) && 'bg-[#8B5CF6]/10 text-[#8B5CF6]'
                    )}>
                      {update.status === 'in_progress' && <Play className="w-5 h-5" />}
                      {update.status === 'at_risk' && <Zap className="w-5 h-5" />}
                      {update.status === 'completed' && <CheckCircle className="w-5 h-5" />}
                      {!['in_progress', 'at_risk', 'completed'].includes(update.status) && <FileText className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-[#6B7280]">{update.updatedAt || update.startDate || ''}</span>
                      </div>
                      <p className="text-sm text-[#111827] mb-2 group-hover:text-[#5B6CFF] transition-colors">
                        {update.name || '项目'}：{update.currentTask || update.goal || ''}
                      </p>
                      {update.progress !== undefined && (
                        <div className="flex items-center gap-1.5 text-xs text-[#5B6CFF]">
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>进度 {update.progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
