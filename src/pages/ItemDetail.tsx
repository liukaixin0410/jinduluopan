import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, Calendar, User, Clock, CheckCircle2, AlertTriangle, FileText, Edit, X, Save } from 'lucide-react'

import { Item, ItemStatus } from '../types'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useItems } from '../context/ItemsContext'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

const statusLabels: Record<ItemStatus, string> = {
  'pending': '待办',
  'in-progress': '进行中',
  'confirm': '待确认',
  'completed': '已完成',
  'on-hold': '暂停'
}

const statusColors: Record<ItemStatus, string> = {
  'pending': 'bg-[#6B7280]/10 text-[#6B7280]',
  'in-progress': 'bg-[#5B6CFF]/10 text-[#5B6CFF]',
  'confirm': 'bg-[#F59E0B]/10 text-[#F59E0B]',
  'completed': 'bg-[#10B981]/10 text-[#10B981]',
  'on-hold': 'bg-[#EF4444]/10 text-[#EF4444]'
}

const priorityLabels = {
  'high': '高',
  'medium': '中',
  'low': '低'
}

const priorityColors = {
  'high': 'bg-[#EF4444]/10 text-[#EF4444]',
  'medium': 'bg-[#F59E0B]/10 text-[#F59E0B]',
  'low': 'bg-[#10B981]/10 text-[#10B981]'
}

export function ItemDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getItemById, updateItem } = useItems()
  const [isEditing, setIsEditing] = useState(false)
  const item = getItemById(id || '')

  const [editForm, setEditForm] = useState<Partial<Item>>({})

  if (!item) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-[#111827]">待办事项不存在</h2>
        <button
          onClick={() => navigate('/items')}
          className="mt-4 text-[#5B6CFF] hover:text-[#4A5CE8] cursor-pointer"
        >
          返回待办事项
        </button>
      </div>
    )
  }

  const handleEdit = () => {
    setEditForm({
      title: item.title,
      description: item.description,
      latestProgress: item.latestProgress,
      risks: item.risks,
      status: item.status,
      priority: item.priority,
      deadline: item.deadline,
      assignee: item.assignee,
      source: item.source
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editForm.title) {
      updateItem(item.id, editForm)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({})
  }

  const handleComplete = () => {
    updateItem(item.id, { status: 'completed' })
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] p-8 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/items')}
            className="p-2.5 hover:bg-white rounded-xl transition-colors cursor-pointer shadow-sm border border-transparent hover:border-[#E5E7EB]"
          >
            <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
          </button>
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="text-3xl font-bold text-[#111827] bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30 w-full"
                  placeholder="标题"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[#111827]">{item.title}</h1>
                <span className={cn('px-3.5 py-1.5 rounded-full text-sm font-medium', statusColors[item.status])}>
                  {statusLabels[item.status]}
                </span>
                <span className={cn('px-3.5 py-1.5 rounded-full text-sm font-medium', priorityColors[item.priority])}>
                  {priorityLabels[item.priority]}优先级
                </span>
              </div>
            )}
          </div>
          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-3 bg-[#F7F8FC] text-[#6B7280] rounded-2xl hover:bg-[#E5E7EB] transition-all duration-200 flex items-center gap-2 cursor-pointer border border-[#E5E7EB]"
              >
                <X className="w-4.5 h-4.5" />
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-3 bg-[#5B6CFF] text-white rounded-2xl hover:bg-[#4A5CE8] transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-lg shadow-[#5B6CFF]/25"
              >
                <Save className="w-4.5 h-4.5" />
                保存
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              {item.status !== 'completed' && (
                <button
                  onClick={handleComplete}
                  className="px-5 py-3 bg-[#10B981] text-white rounded-2xl hover:bg-[#0DA270] transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md shadow-[#10B981]/25"
                >
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  标记完成
                </button>
              )}
              <button
                onClick={handleEdit}
                className="px-5 py-3 bg-[#5B6CFF] text-white rounded-2xl hover:bg-[#4A5CE8] transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md shadow-[#5B6CFF]/25"
              >
                <Edit className="w-4.5 h-4.5" />
                编辑
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-7 border border-[#E5E7EB] shadow-sm">
              <h2 className="text-lg font-semibold text-[#111827] mb-4">描述</h2>
              {isEditing ? (
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full min-h-[150px] text-[#6B7280] bg-[#F7F8FC] border border-[#E5E7EB] rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30"
                  placeholder="描述"
                />
              ) : (
                <p className="text-[#6B7280] whitespace-pre-wrap leading-relaxed">{item.description}</p>
              )}
            </div>

            <div className="bg-white rounded-3xl p-7 border border-[#E5E7EB] shadow-sm">
              <h2 className="text-lg font-semibold text-[#111827] mb-4">最新进度</h2>
              {isEditing ? (
                <textarea
                  value={editForm.latestProgress || ''}
                  onChange={(e) => setEditForm({ ...editForm, latestProgress: e.target.value })}
                  className="w-full min-h-[100px] text-[#6B7280] bg-[#F7F8FC] border border-[#E5E7EB] rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30"
                  placeholder="最新进度"
                />
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 bg-[#5B6CFF] rounded-full mt-2" />
                  <p className="text-[#6B7280] whitespace-pre-wrap leading-relaxed">{item.latestProgress}</p>
                </div>
              )}
            </div>

            {(item.risks || isEditing) && (
              <div className="bg-white rounded-3xl p-7 border border-[#E5E7EB] shadow-sm">
                <h2 className="text-lg font-semibold text-[#111827] mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                  风险提示
                </h2>
                {isEditing ? (
                  <textarea
                    value={editForm.risks || ''}
                    onChange={(e) => setEditForm({ ...editForm, risks: e.target.value })}
                    className="w-full min-h-[80px] text-[#6B7280] bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 focus:border-[#F59E0B]/30"
                    placeholder="风险提示"
                  />
                ) : (
                  item.risks && (
                    <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-2xl p-5">
                      <p className="text-[#92400E]">{item.risks}</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-7 border border-[#E5E7EB] shadow-sm">
              <h2 className="text-lg font-semibold text-[#111827] mb-4">基本信息</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#9CA3AF]" />
                  <div className="flex-1">
                    <p className="text-sm text-[#6B7280]">负责人</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.assignee || ''}
                        onChange={(e) => setEditForm({ ...editForm, assignee: e.target.value })}
                        className="w-full text-[#111827] font-medium bg-[#F7F8FC] border border-[#E5E7EB] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30"
                      />
                    ) : (
                      <p className="text-[#111827] font-medium">{item.assignee}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#9CA3AF]" />
                  <div className="flex-1">
                    <p className="text-sm text-[#6B7280]">截止日期</p>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editForm.deadline || ''}
                        onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                        className="w-full text-[#111827] font-medium bg-[#F7F8FC] border border-[#E5E7EB] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30"
                      />
                    ) : (
                      <p className="text-[#111827] font-medium">{item.deadline || '未设置'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#9CA3AF]" />
                  <div className="flex-1">
                    <p className="text-sm text-[#6B7280]">来源</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.source || ''}
                        onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                        className="w-full text-[#111827] font-medium bg-[#F7F8FC] border border-[#E5E7EB] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30"
                      />
                    ) : (
                      <p className="text-[#111827] font-medium">{item.source}</p>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 text-[#9CA3AF] flex items-center justify-center">📊</div>
                      <div className="flex-1">
                        <p className="text-sm text-[#6B7280]">状态</p>
                        <select
                          value={editForm.status || item.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ItemStatus })}
                          className="w-full text-[#111827] font-medium bg-[#F7F8FC] border border-[#E5E7EB] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30"
                        >
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 text-[#9CA3AF] flex items-center justify-center">⚡</div>
                      <div className="flex-1">
                        <p className="text-sm text-[#6B7280]">优先级</p>
                        <select
                          value={editForm.priority || item.priority}
                          onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as 'high' | 'medium' | 'low' })}
                          className="w-full text-[#111827] font-medium bg-[#F7F8FC] border border-[#E5E7EB] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30"
                        >
                          {Object.entries(priorityLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#9CA3AF]" />
                  <div>
                    <p className="text-sm text-[#6B7280]">创建时间</p>
                    <p className="text-[#111827] font-medium">{item.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#9CA3AF]" />
                  <div>
                    <p className="text-sm text-[#6B7280]">更新时间</p>
                    <p className="text-[#111827] font-medium">{item.updatedAt}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
