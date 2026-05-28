import { useState } from 'react'
import { Plus, Edit, Trash2, Play, RefreshCw, CheckCircle, AlertCircle, Settings, Link, Calendar, Clock } from 'lucide-react'
import { useDataSources } from '../context/DataSourceContext'
import { DataSourceType, SyncFrequency, DataSourceStatus } from '../types'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

const typeLabels: Record<DataSourceType, string> = {
  'wiki': 'Wiki',
  'doc': 'Doc',
  'docx': 'Docx',
}

const frequencyLabels: Record<SyncFrequency, string> = {
  'daily': '每日一次',
  'weekly': '每周一次',
  'manual': '手动同步',
}

const statusColors: Record<DataSourceStatus, string> = {
  'enabled': 'bg-green-100 text-green-700',
  'disabled': 'bg-gray-100 text-gray-500',
}

const syncStatusColors = {
  'success': 'text-green-600',
  'failed': 'text-red-600',
  'pending': 'text-yellow-600',
  'syncing': 'text-blue-600',
}

export function TeamConfig() {
  const { dataSources, setDataSources, syncDataSource, isSyncing, syncAllDataSources, syncingSourceId, clearUpdates } = useDataSources()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    type: 'wiki' as DataSourceType,
    topic: '',
    frequency: 'manual' as SyncFrequency,
    remark: '',
  })

  const handleOpenModal = (source: any = null) => {
    if (source) {
      setEditingSource(source)
      setFormData({
        name: source.name,
        link: source.link,
        type: source.type,
        topic: source.topic || '',
        frequency: source.frequency,
        remark: source.remark || '',
      })
    } else {
      setEditingSource(null)
      setFormData({
        name: '',
        link: '',
        type: 'wiki',
        topic: '',
        frequency: 'manual',
        remark: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.link) return

    const now = new Date().toISOString().split('T')[0]
    
    if (editingSource) {
      setDataSources(prev => prev.map(source => 
        source.id === editingSource.id
          ? { ...source, ...formData, updatedAt: now }
          : source
      ))
    } else {
      const newSource = {
        id: String(Date.now()),
        ...formData,
        module: 'team',
        status: 'enabled' as DataSourceStatus,
        createdAt: now,
        updatedAt: now,
      }
      setDataSources([...dataSources, newSource])
    }

    setIsModalOpen(false)
    setEditingSource(null)
  }

  const handleToggleStatus = (id: string) => {
    setDataSources(prev => prev.map(source => 
      source.id === id
        ? { ...source, status: source.status === 'enabled' ? 'disabled' : 'enabled', updatedAt: new Date().toISOString().split('T')[0] }
        : source
    ))
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个数据源吗？')) {
      setDataSources(prev => prev.filter(source => source.id !== id))
    }
  }

  const handleManualSync = (id: string) => {
    syncDataSource(id)
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] p-6 pb-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 页面头部 */}
        <div className="bg-gradient-to-r from-[#5B6CFF]/10 via-[#8B5CF6]/10 to-[#EC4899]/10 rounded-3xl p-6 border border-[#5B6CFF]/20 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-[#5B6CFF] to-[#8B5CF6] rounded-2xl flex items-center justify-center shrink-0">
                <Settings className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[#111827]">团队动态配置</h1>
                <p className="text-[#6B7280] mt-1.5 leading-relaxed text-sm">
                  配置飞书文档/Wiki作为数据源，系统将自动解析并生成团队动态
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={syncAllDataSources}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium disabled:opacity-50"
              >
                <RefreshCw className={cn("w-4.5 h-4.5", isSyncing && "animate-spin")} />
                {isSyncing ? '同步中...' : '全部同步'}
              </button>
              <button 
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#5B6CFF] to-[#8B5CF6] text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium"
              >
                <Plus className="w-4.5 h-4.5" />
                新增数据源
              </button>
              <button 
                onClick={clearUpdates}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 text-sm font-medium"
              >
                <Trash2 className="w-4.5 h-4.5" />
                清空动态
              </button>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-[#6B7280] text-sm">已启用</span>
            </div>
            <div className="text-2xl font-bold text-[#111827]">
              {dataSources.filter(s => s.status === 'enabled').length}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-[#6B7280] text-sm">今日同步</span>
            </div>
            <div className="text-2xl font-bold text-[#111827]">
              {dataSources.filter(s => s.lastSyncTime?.includes(new Date().toISOString().split('T')[0])).length}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-[#6B7280] text-sm">同步失败</span>
            </div>
            <div className="text-2xl font-bold text-[#111827]">
              {dataSources.filter(s => s.lastSyncStatus === 'failed').length}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-5 h-5 text-purple-500" />
              <span className="text-[#6B7280] text-sm">总数据源</span>
            </div>
            <div className="text-2xl font-bold text-[#111827]">
              {dataSources.length}
            </div>
          </div>
        </div>

        {/* 数据源列表 */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F7F8FC] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    数据源名称
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    同步频率
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    最近同步
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {dataSources.map(source => (
                  <tr key={source.id} className="hover:bg-[#F7F8FC] transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#111827]">{source.name}</span>
                          {source.topic && (
                            <span className="px-2 py-0.5 bg-[#5B6CFF]/10 text-[#5B6CFF] rounded-full text-xs">
                              {source.topic}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                          <Link className="w-3 h-3" />
                          <a 
                            href={source.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-[#5B6CFF] truncate max-w-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {source.link}
                          </a>
                        </div>
                        {source.remark && (
                          <p className="text-xs text-[#6B7280] truncate max-w-xs">{source.remark}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-[#F7F8FC] text-[#6B7280] rounded-full text-xs border border-[#E5E7EB]">
                        {typeLabels[source.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#6B7280]">{frequencyLabels[source.frequency]}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusColors[source.status])}>
                        {source.status === 'enabled' ? '已启用' : '已停用'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {source.lastSyncTime && (
                          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                            <Clock className="w-3 h-3" />
                            {source.lastSyncTime}
                          </div>
                        )}
                        {source.lastSyncStatus && (
                          <div className={cn("text-xs", syncStatusColors[source.lastSyncStatus as keyof typeof syncStatusColors])}>
                            {source.lastSyncStatus === 'success' ? source.lastSyncResult : 
                             source.lastSyncStatus === 'syncing' ? '正在解析...' : 
                             source.lastSyncStatus === 'failed' ? source.lastSyncResult : '待同步'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleManualSync(source.id)}
                        disabled={isSyncing}
                        className={cn(
                          "p-1.5 rounded-lg transition-all duration-200",
                          syncingSourceId === source.id
                            ? "bg-blue-100 text-blue-600 cursor-not-allowed"
                            : isSyncing
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "text-[#5B6CFF] hover:bg-[#5B6CFF]/10"
                        )}
                        title="手动同步"
                      >
                        <RefreshCw className={cn("w-4.5 h-4.5", syncingSourceId === source.id && "animate-spin")} />
                      </button>
                        <button 
                          onClick={() => handleOpenModal(source)}
                          className="p-1.5 text-[#6B7280] hover:text-[#5B6CFF] hover:bg-[#5B6CFF]/10 rounded-lg transition-all duration-200"
                          title="编辑"
                        >
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(source.id)}
                          className={cn(
                            "p-1.5 rounded-lg transition-all duration-200",
                            source.status === 'enabled'
                              ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                              : "text-green-600 hover:text-green-700 hover:bg-green-50"
                          )}
                          title={source.status === 'enabled' ? '停用' : '启用'}
                        >
                          {source.status === 'enabled' ? <AlertCircle className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5" />}
                        </button>
                        <button 
                          onClick={() => handleDelete(source.id)}
                          className="p-1.5 text-[#EF4444] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="删除"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dataSources.length === 0 && (
            <div className="py-16 text-center">
              <Settings className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
              <h3 className="text-base font-medium text-[#111827] mb-1">暂无数据源</h3>
              <p className="text-sm text-[#6B7280]">点击右上角按钮添加第一个数据源</p>
            </div>
          )}
        </div>
      </div>

      {/* 新增/编辑弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#111827]">
                  {editingSource ? '编辑数据源' : '新增数据源'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F7F8FC] rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">数据源名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：激励方向大周会-26年Q2"
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">飞书链接</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://bytedance.larkoffice.com/wiki/..."
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">数据源类型</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as DataSourceType })}
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30 text-sm"
                >
                  <option value="wiki">Wiki</option>
                  <option value="doc">Doc</option>
                  <option value="docx">Docx</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">归属主题/项目（可选）</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="例如：进度罗盘、激励方向"
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">同步频率</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as SyncFrequency })}
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30 text-sm"
                >
                  <option value="manual">手动同步</option>
                  <option value="daily">每日一次</option>
                  <option value="weekly">每周一次</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">备注（可选）</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  placeholder="说明该数据源的用途或抽取重点"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30 text-sm resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[#E5E7EB] flex gap-3 justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 bg-white text-[#6B7280] border border-[#E5E7EB] rounded-xl hover:bg-[#F7F8FC] transition-all text-sm font-medium"
              >
                取消
              </button>
              <button 
                onClick={handleSave}
                disabled={!formData.name || !formData.link}
                className="px-4 py-2.5 bg-gradient-to-r from-[#5B6CFF] to-[#8B5CF6] text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
