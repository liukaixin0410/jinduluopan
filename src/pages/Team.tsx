import { useState } from 'react'
import { Calendar, ExternalLink, Search, Sparkles, TrendingUp, TrendingDown, Minus, CheckCircle, AlertCircle, Clock, Target, User, ChevronRight, Settings, Plus, RefreshCw } from 'lucide-react'
import { mockUpdates } from '../mockData'
import { Update, ProgressStatus, POCStatus } from '../types'
import { useDataSources } from '../context/DataSourceContext'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

const statusConfig: Record<ProgressStatus, { label: string; color: string; bg: string; icon: any }> = {
  'on-track': { label: '正常进行', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', icon: TrendingUp },
  'at-risk': { label: '有风险', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', icon: AlertCircle },
  'blocked': { label: '已阻塞', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', icon: AlertCircle },
  'completed': { label: '已完成', color: 'text-[#5B6CFF]', bg: 'bg-[#5B6CFF]/10', icon: CheckCircle },
  'new': { label: '最新更新', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', icon: Sparkles }
}

const pocConfig: Record<POCStatus, { label: string; color: string; bg: string }> = {
  'verified': { label: '已验证', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
  'in-progress': { label: '验证中', color: 'text-[#5B6CFF]', bg: 'bg-[#5B6CFF]/10' },
  'planned': { label: '待验证', color: 'text-[#6B7280]', bg: 'bg-[#6B7280]/10' }
}

const trendIcons = {
  'up': TrendingUp,
  'down': TrendingDown,
  'stable': Minus
}

const trendColors = {
  'up': 'text-[#10B981]',
  'down': 'text-[#EF4444]',
  'stable': 'text-[#6B7280]'
}

export function Team() {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | ProgressStatus>('all')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { updates, dataSources, syncAllDataSources, isSyncing } = useDataSources()

  const displayUpdates = updates.length > 0 ? updates : mockUpdates

  const filteredUpdates = displayUpdates.filter(update => {
    const matchesImportance = filter === 'all' || update.importance === filter
    const matchesStatus = statusFilter === 'all' || update.status === statusFilter
    const matchesSearch = !search || 
      update.title.toLowerCase().includes(search.toLowerCase()) || 
      update.summary.toLowerCase().includes(search.toLowerCase())
    return matchesImportance && matchesStatus && matchesSearch
  })

  const handleCardClick = (update: Update) => {
    console.log('进入业务模块:', update.title)
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] p-6 pb-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#8B5CF6]/10 via-[#5B6CFF]/10 to-[#10B981]/10 rounded-3xl p-6 border border-[#8B5CF6]/20 shadow-sm">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6] to-[#5B6CFF] rounded-2xl flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <h1 className="text-xl font-semibold text-[#111827]">团队进展面板</h1>
              <p className="text-[#6B7280] mt-2 leading-relaxed text-sm">
                实时追踪项目状态、关键指标、POC验证和里程碑完成，按优先级和时效性排序
              </p>
            </div>
            <div className="flex gap-2">
              {dataSources.length === 0 && (
                <button 
                  onClick={() => navigate('/team/config')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#5B6CFF]/20 text-[#5B6CFF] rounded-xl hover:bg-[#5B6CFF]/5 transition-all duration-200 text-sm font-medium"
                >
                  <Plus className="w-4.5 h-4.5" />
                  配置数据源
                </button>
              )}
              {dataSources.length > 0 && (
                <button 
                  onClick={syncAllDataSources}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#5B6CFF] to-[#8B5CF6] text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium disabled:opacity-50"
                >
                  <RefreshCw className={cn("w-4.5 h-4.5", isSyncing && "animate-spin")} />
                  {isSyncing ? '同步中...' : '同步数据源'}
                </button>
              )}
              <button 
                onClick={() => navigate('/team/config')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#6B7280] rounded-xl hover:bg-[#F7F8FC] hover:text-[#5B6CFF] transition-all duration-200 text-sm font-medium"
              >
                <Settings className="w-4.5 h-4.5" />
                配置
              </button>
            </div>
          </div>
          
          {/* Data Source Status */}
          {dataSources.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-[#6B7280]">已配置数据源:</span>
              {dataSources.filter(s => s.status === 'enabled').slice(0, 3).map(source => (
                <span key={source.id} className="px-2 py-1 bg-white rounded-lg text-xs text-[#6B7280] border border-[#E5E7EB]">
                  {source.name}
                </span>
              ))}
              {dataSources.filter(s => s.status === 'enabled').length > 3 && (
                <span className="px-2 py-1 bg-white rounded-lg text-xs text-[#6B7280] border border-[#E5E7EB]">
                  +{dataSources.filter(s => s.status === 'enabled').length - 3} 个
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '进行中', value: filteredUpdates.filter(u => u.status === 'on-track').length, color: 'text-[#10B981]' },
            { label: '有风险', value: filteredUpdates.filter(u => u.status === 'at-risk').length, color: 'text-[#F59E0B]' },
            { label: '已完成', value: filteredUpdates.filter(u => u.status === 'completed').length, color: 'text-[#5B6CFF]' },
            { label: '总项目', value: filteredUpdates.length, color: 'text-[#111827]' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm">
              <p className={cn("text-2xl font-bold mb-1", stat.color)}>{stat.value}</p>
              <p className="text-xs text-[#6B7280]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="搜索进展..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30 shadow-sm text-sm"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 shadow-sm text-xs"
            >
              <option value="all">所有状态</option>
              <option value="new">最新更新</option>
              <option value="on-track">正常进行</option>
              <option value="at-risk">有风险</option>
              <option value="blocked">已阻塞</option>
              <option value="completed">已完成</option>
            </select>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 shadow-sm text-xs"
            >
              <option value="all">所有优先级</option>
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>
          </div>
        </div>

        {/* Updates Grid */}
        <div className="space-y-4">
          {filteredUpdates.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-[#E5E7EB] text-center shadow-sm">
              <Calendar className="w-14 h-14 text-[#D1D5DB] mx-auto mb-4" />
              <h3 className="text-base font-medium text-[#111827]">没有找到进展</h3>
              <p className="text-[#6B7280] mt-1.5 text-sm">尝试调整筛选条件</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredUpdates.map((update) => {
                const statusInfo = statusConfig[update.status]
                const StatusIcon = statusInfo.icon
                
                return (
                  <div 
                    key={update.id} 
                    onClick={() => handleCardClick(update)}
                    className="group bg-white rounded-3xl border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:border-[#5B6CFF]/20 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="p-5 border-b border-[#E5E7EB]/50">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", statusInfo.bg)}>
                            <StatusIcon className={cn("w-4.5 h-4.5", statusInfo.color)} />
                          </div>
                          <div>
                            <h3 className="font-medium text-[#111827] text-sm leading-tight line-clamp-2">
                              {update.title}
                            </h3>
                            <p className={cn("text-xs mt-0.5", statusInfo.color)}>{statusInfo.label}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          {update.importance === 'high' && (
                            <span className="px-2 py-0.5 bg-[#EF4444]/10 text-[#EF4444] rounded-full text-xs font-medium">
                              高优
                            </span>
                          )}
                          {update.pocStatus && (
                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", pocConfig[update.pocStatus].color, pocConfig[update.pocStatus].bg)}>
                              POC: {pocConfig[update.pocStatus].label}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-[#374151] text-xs leading-relaxed mb-3">
                        {update.summary}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-[#6B7280]">总体进度</span>
                          <span className="text-xs font-medium text-[#111827]">{update.progress}%</span>
                        </div>
                        <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              update.progress >= 80 ? "bg-[#10B981]" :
                              update.progress >= 50 ? "bg-[#5B6CFF]" :
                              update.progress >= 30 ? "bg-[#F59E0B]" : "bg-[#EF4444]"
                            )}
                            style={{ width: `${update.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Metrics */}
                    {update.metrics && update.metrics.length > 0 && (
                      <div className="p-5 border-b border-[#E5E7EB]/50">
                        <p className="text-xs text-[#6B7280] mb-2">关键指标</p>
                        <div className="space-y-1.5">
                          {update.metrics.map((metric, idx) => {
                            const TrendIcon = trendIcons[metric.trend]
                            return (
                              <div key={idx} className="flex items-center justify-between">
                                <span className="text-xs text-[#374151]">{metric.label}</span>
                                <div className="flex items-center gap-1">
                                  <TrendIcon className={cn("w-3.5 h-3.5", trendColors[metric.trend])} />
                                  <span className={cn("text-xs font-medium", trendColors[metric.trend])}>
                                    {metric.value}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Milestones */}
                    {update.milestones.length > 0 && (
                      <div className="p-5 border-b border-[#E5E7EB]/50">
                        <p className="text-xs text-[#6B7280] mb-2">里程碑</p>
                        <div className="flex flex-wrap gap-1.5">
                          {update.milestones.map((milestone, idx) => (
                            <span 
                              key={idx}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-xs border",
                                idx === 0 ? "bg-[#5B6CFF]/5 text-[#5B6CFF] border-[#5B6CFF]/20" : 
                                "bg-[#F7F8FC] text-[#6B7280] border-[#E5E7EB]"
                              )}
                            >
                              {milestone}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Related Modules */}
                    {update.relatedModules.length > 0 && (
                      <div className="p-5 border-b border-[#E5E7EB]/50">
                        <p className="text-xs text-[#6B7280] mb-2">关联模块</p>
                        <div className="flex flex-wrap gap-1.5">
                          {update.relatedModules.map((module, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-[#F7F8FC] text-[#4A5568] rounded-lg text-xs border border-[#E5E7EB]"
                            >
                              {module}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Card Footer */}
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{update.lastUpdate}</span>
                          </div>
                          {update.assignee && (
                            <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                              <User className="w-3.5 h-3.5" />
                              <span>{update.assignee}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {update.sourceLink && (
                            <a
                              href={update.sourceLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-[#6B7280] hover:text-[#5B6CFF] hover:bg-[#5B6CFF]/5 rounded-lg transition-all duration-200"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <div className="p-1.5 text-[#5B6CFF] hover:bg-[#5B6CFF]/5 rounded-lg transition-all duration-200 group-hover:translate-x-0.5">
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                      
                      {update.suggestedAction && (
                        <div className="mt-3 pt-3 border-t border-[#E5E7EB]/50">
                          <div className="flex items-center gap-2 text-xs text-[#5B6CFF] bg-[#5B6CFF]/5 px-3 py-2 rounded-xl">
                            <Target className="w-3.5 h-3.5" />
                            <span>建议: {update.suggestedAction}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
