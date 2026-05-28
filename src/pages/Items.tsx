import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, MoreHorizontal, Calendar, User, Clock, CheckCircle2 } from 'lucide-react'

import { Item, ItemStatus } from '../types'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useItems } from '../context/ItemsContext'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

const statusLabels: Record<ItemStatus, string> = {
  'pending': '未开始',
  'in-progress': '进行中',
  'confirm': '待确认',
  'completed': '已完成',
  'on-hold': '已搁置'
}

const statusColors: Record<ItemStatus, string> = {
  'pending': 'bg-[#6B7280]/10 text-[#6B7280]',
  'in-progress': 'bg-[#5B6CFF]/10 text-[#5B6CFF]',
  'confirm': 'bg-[#F59E0B]/10 text-[#F59E0B]',
  'completed': 'bg-[#10B981]/10 text-[#10B981]',
  'on-hold': 'bg-[#EF4444]/10 text-[#EF4444]'
}

const priorityColors = {
  'high': 'bg-[#EF4444]/10 text-[#EF4444]',
  'medium': 'bg-[#F59E0B]/10 text-[#F59E0B]',
  'low': 'bg-[#10B981]/10 text-[#10B981]'
}

const priorityLabels = {
  'high': '高',
  'medium': '中',
  'low': '低'
}

export function Items() {
  const [filter, setFilter] = useState<ItemStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const { items, updateItem } = useItems()
  const navigate = useNavigate()
  
  const handleItemClick = (itemId: string) => {
    navigate(`/item/${itemId}`)
  }

  const filteredItems = items.filter(item => {
    const matchesStatus = filter === 'all' || item.status === filter
    const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const groupedByStatus = filteredItems.reduce((acc, item) => {
    acc[item.status] = [...(acc[item.status] || []), item]
    return acc
  }, {} as Record<ItemStatus, Item[]>)

  const handleComplete = (itemId: string) => {
    updateItem(itemId, { status: 'completed' })
  }

  const handleEdit = (itemId: string) => {
    navigate(`/item/${itemId}`)
  }

  const handleNewItem = () => {
    alert('新建事项功能已触发！')
  }

  const handleMoreOptions = (itemId: string) => {
    alert(`更多操作：${items.find(i => i.id === itemId)?.title}`)
  }



  return (
    <div className="min-h-screen bg-[#F7F8FC] p-8 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">个人事项</h1>
            <p className="text-[#6B7280] mt-1">管理你正在跟进的所有事项</p>
          </div>
          <button 
            onClick={handleNewItem}
            className="px-5 py-3 bg-[#5B6CFF] text-white rounded-2xl font-medium hover:bg-[#4A5CE8] transition-all duration-200 flex items-center gap-2 shadow-lg shadow-[#5B6CFF]/25"
          >
            <Plus className="w-5 h-5" />
            新建事项
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="搜索事项..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-5 py-3.5 bg-white border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30 shadow-sm"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ItemStatus | 'all')}
              className="px-5 py-3.5 bg-white border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 shadow-sm"
            >
              <option value="all">所有状态</option>
              {Object.entries(statusLabels).map(([status, label]) => (
                <option key={status} value={status}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(['in-progress', 'pending', 'confirm', 'on-hold', 'completed'] as ItemStatus[]).map((status) => {
            const statusItems = groupedByStatus[status] || []
            if (statusItems.length === 0) return null
            
            return (
              <div key={status} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn('px-4 py-1.5 rounded-full text-sm font-semibold', statusColors[status])}>
                      {statusLabels[status]}
                    </span>
                    <span className="text-[#6B7280] text-sm font-medium">({statusItems.length})</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {statusItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#5B6CFF]/20 hover:shadow-lg transition-all duration-200 overflow-hidden shadow-sm group">
                      <button 
                        onClick={() => handleItemClick(item.id)}
                        className="w-full text-left p-6 cursor-pointer hover:bg-[#F7F8FC]/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#111827] group-hover:text-[#5B6CFF] transition-colors">{item.title}</h3>
                          </div>
                        </div>
                        
                        <p className="text-sm text-[#6B7280] mb-4 leading-relaxed">{item.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', priorityColors[item.priority])}>
                            {priorityLabels[item.priority]}优先级
                          </span>
                          <span className="px-3 py-1 bg-[#F7F8FC] text-[#6B7280] rounded-full text-xs">
                            来源: {item.source}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-[#6B7280]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>截止: {item.deadline || '未设置'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>负责人: {item.assignee}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                          <p className="text-xs text-[#9CA3AF] mb-1">最新进度</p>
                          <p className="text-sm text-[#6B7280]">{item.latestProgress}</p>
                        </div>
                      </button>
                      
                      <div className="flex gap-2 px-6 pb-6 pt-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleMoreOptions(item.id) }}
                          className="p-2 text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F7F8FC] rounded-xl transition-colors cursor-pointer"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        {status !== 'completed' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleComplete(item.id) }}
                            className="flex-1 px-4 py-2.5 bg-[#10B981]/10 text-[#10B981] rounded-xl text-sm font-medium hover:bg-[#10B981]/15 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4.5 h-4.5" />
                            完成
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEdit(item.id) }}
                          className="flex-1 px-4 py-2.5 bg-[#F7F8FC] text-[#6B7280] rounded-xl text-sm font-medium hover:bg-[#F7F8FC] transition-colors cursor-pointer"
                        >
                          编辑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <Clock className="w-16 h-16 text-[#D1D5DB] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#111827]">没有找到事项</h3>
            <p className="text-[#6B7280] mt-1">尝试调整筛选条件</p>
          </div>
        )}
      </div>
    </div>
  )
}
