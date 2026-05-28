import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { DataSource, Update, ProgressStatus, POCStatus } from '../types'
import { mockDataSources } from '../mockData'

interface DataSourceContextType {
  dataSources: DataSource[]
  setDataSources: React.Dispatch<React.SetStateAction<DataSource[]>>
  updates: Update[]
  setUpdates: React.Dispatch<React.SetStateAction<Update[]>>
  syncDataSource: (id: string) => Promise<void>
  syncAllDataSources: () => Promise<void>
  isSyncing: boolean
  syncingSourceId: string | null
  clearUpdates: () => void
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined)

// 主题关键词映射
const topicKeywords = {
  '进度罗盘': ['项目管理', '进度跟踪', '风险评估', '里程碑'],
  '激励方向': ['奖金分配', '晋升机制', '团队激励', '绩效考核'],
  '产品': ['需求评审', '产品迭代', '用户反馈', '功能优化'],
  '技术': ['技术方案', '架构设计', '性能优化', '技术债务'],
  '设计': ['UI设计', '交互体验', '设计规范', '视觉优化'],
  '运营': ['活动策划', '用户增长', '数据分析', '市场推广'],
  '合集': ['团队周报', '周会纪要', '项目总结', '关键指标']
}

// 进度状态池
const statusPool: ProgressStatus[] = ['on-track', 'on-track', 'on-track', 'at-risk', 'completed', 'new']
const pocStatusPool: POCStatus[] = ['verified', 'in-progress', 'planned', 'verified']

// 生成随机进度
const getRandomProgress = (status: ProgressStatus): number => {
  switch (status) {
    case 'completed':
      return 100
    case 'new':
      return Math.floor(Math.random() * 20) + 5
    case 'at-risk':
      return Math.floor(Math.random() * 40) + 20
    case 'on-track':
      return Math.floor(Math.random() * 50) + 40
    default:
      return Math.floor(Math.random() * 70) + 20
  }
}

// 生成里程碑
const generateMilestones = (progress: number): string[] => {
  const allMilestones = [
    '需求调研完成',
    '方案设计完成',
    '技术评审通过',
    '开发进行中',
    '测试进行中',
    '灰度发布',
    '正式上线'
  ]
  
  const count = Math.ceil(progress / 20) + 1
  return allMilestones.slice(0, Math.min(count, allMilestones.length))
}

// 生成指标
const generateMetrics = (progress: number) => {
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (progress > 50) {
    trend = 'up'
  } else if (progress < 30) {
    trend = 'down'
  }
  
  const metrics = [
    { label: '完成度', value: `${progress}%`, trend },
    { label: '风险指数', value: progress > 70 ? '低' : progress > 40 ? '中' : '高', trend: 'stable' as const },
    { label: '进度偏差', value: progress > 80 ? '提前' : progress > 50 ? '正常' : '滞后', trend: 'stable' as const }
  ]
  return metrics
}

// 模拟从数据源解析生成团队动态
const mockParseUpdatesFromSource = (source: DataSource): Update[] => {
  const baseUpdates: Update[] = []
  
  // 根据主题确定关键词
  const keywords = topicKeywords[source.topic as keyof typeof topicKeywords] || ['项目管理', '进展更新', '团队协作']
  
  // 生成 2-4 条更新
  const updateCount = Math.floor(Math.random() * 3) + 2
  
  for (let i = 0; i < updateCount; i++) {
    const status = statusPool[Math.floor(Math.random() * statusPool.length)]
    const pocStatus = pocStatusPool[Math.floor(Math.random() * pocStatusPool.length)]
    const progress = getRandomProgress(status)
    const importance = status === 'new' || status === 'at-risk' ? 'high' : (Math.random() > 0.6 ? 'medium' : 'low')
    const time = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
    const lastUpdate = new Date(Date.now() - i * 3600000).toLocaleString()
    
    // 根据索引确定标题类型
    const titleTemplates = [
      `${source.name} - ${keywords[0]}进展`,
      `${source.name} - 关键${keywords[1]}`,
      `${source.name} - ${keywords[2]}更新`,
      `${source.name} - 重要决策`
    ]
    
    const summaryTemplates = [
      `从${source.name}同步的最新${keywords[0]}，包含${keywords[1]}和${keywords[2]}。`,
      `${source.name}的${keywords[1]}已完成，${keywords[2]}正在进行中。`,
      `${source.name}发布了新的${keywords[0]}，涉及${keywords[1]}和${keywords[2]}。`,
      `${source.name}中关于${keywords[0]}的重要更新，建议关注。`
    ]
    
    const assignees = ['产品经理', '技术负责人', '项目经理', '运营负责人', '设计负责人']
    const assignee = assignees[Math.floor(Math.random() * assignees.length)]
    
    const update: Update = {
      id: `${source.id}-update-${Date.now()}-${i}`,
      title: titleTemplates[i % titleTemplates.length],
      sourceType: 'document',
      time,
      summary: summaryTemplates[i % summaryTemplates.length],
      importance,
      affectedObjects: [keywords[0], keywords[1]],
      suggestedAction: '查看详情',
      sourceLink: source.link,
      status,
      pocStatus,
      lastUpdate,
      assignee,
      progress,
      milestones: generateMilestones(progress),
      metrics: generateMetrics(progress),
      relatedModules: [source.topic || '项目管理'],
      docName: source.name
    }
    
    baseUpdates.push(update)
  }
  
  // 根据数据源类型添加特定更新
  if (source.type === 'wiki') {
    baseUpdates.push({
      id: `${source.id}-wiki-update-${Date.now()}`,
      title: `${source.name} - Wiki知识更新`,
      sourceType: 'document',
      time: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      summary: `Wiki文档${source.name}有新的知识更新，包含了最新的${keywords[0]}和${keywords[1]}。`,
      importance: 'low',
      affectedObjects: ['知识管理'],
      sourceLink: source.link,
      status: 'on-track',
      pocStatus: 'planned',
      lastUpdate: new Date(Date.now() - 172800000).toLocaleString(),
      assignee: '知识库管理员',
      progress: 30,
      milestones: ['文档更新', '待审核'],
      metrics: [
        { label: '完成度', value: '30%', trend: 'up' },
        { label: '风险指数', value: '低', trend: 'stable' },
        { label: '进度偏差', value: '正常', trend: 'stable' }
      ],
      relatedModules: ['知识库'],
      docName: source.name
    })
  }
  
  return baseUpdates
}

export function DataSourceProvider({ children }: { children: ReactNode }) {
  // 从localStorage加载数据，如果没有则使用默认值
  const [dataSources, setDataSources] = useState<DataSource[]>(() => {
    const saved = localStorage.getItem('dataSources')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return mockDataSources
      }
    }
    return mockDataSources
  })

  const [updates, setUpdates] = useState<Update[]>(() => {
    const saved = localStorage.getItem('updates')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return []
      }
    }
    return []
  })

  const [isSyncing, setIsSyncing] = useState(false)
  const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null)

  // 保存到localStorage
  useEffect(() => {
    localStorage.setItem('dataSources', JSON.stringify(dataSources))
  }, [dataSources])

  useEffect(() => {
    localStorage.setItem('updates', JSON.stringify(updates))
  }, [updates])

  // 清空所有更新
  const clearUpdates = () => {
    setUpdates([])
  }

  // 同步单个数据源
  const syncDataSource = async (id: string) => {
    setIsSyncing(true)
    setSyncingSourceId(id)
    
    try {
      const source = dataSources.find(s => s.id === id)
      if (!source) {
        throw new Error('数据源不存在')
      }

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

      // 更新数据源状态为同步中
      setDataSources(prev => prev.map(s => 
        s.id === id 
          ? { 
              ...s, 
              lastSyncStatus: 'syncing'
            }
          : s
      ))

      // 模拟解析生成团队动态
      const parsedUpdates = mockParseUpdatesFromSource(source)
      
      // 更新数据源状态
      setDataSources(prev => prev.map(s => 
        s.id === id 
          ? { 
              ...s, 
              lastSyncTime: new Date().toLocaleString(), 
              lastSyncStatus: 'success',
              lastSyncResult: `成功解析${parsedUpdates.length}条团队动态`,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : s
      ))

      // 添加新的更新（不重复）
      setUpdates(prev => {
        const existingIds = new Set(prev.map(u => u.id))
        const newUpdates = parsedUpdates.filter(u => !existingIds.has(u.id))
        return [...newUpdates, ...prev]
      })

    } catch (error) {
      setDataSources(prev => prev.map(s => 
        s.id === id 
          ? { 
              ...s, 
              lastSyncTime: new Date().toLocaleString(), 
              lastSyncStatus: 'failed',
              lastSyncResult: error instanceof Error ? error.message : '同步失败',
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : s
      ))
    } finally {
      setIsSyncing(false)
      setSyncingSourceId(null)
    }
  }

  // 同步所有启用的数据源
  const syncAllDataSources = async () => {
    const enabledSources = dataSources.filter(s => s.status === 'enabled')
    if (enabledSources.length === 0) {
      alert('没有启用的数据源，请先在配置中启用数据源')
      return
    }
    
    for (const source of enabledSources) {
      await syncDataSource(source.id)
    }
  }

  return (
    <DataSourceContext.Provider value={{
      dataSources,
      setDataSources,
      updates,
      setUpdates,
      syncDataSource,
      syncAllDataSources,
      isSyncing,
      syncingSourceId,
      clearUpdates
    }}>
      {children}
    </DataSourceContext.Provider>
  )
}

export function useDataSources() {
  const context = useContext(DataSourceContext)
  if (!context) {
    throw new Error('useDataSources must be used within a DataSourceProvider')
  }
  return context
}
