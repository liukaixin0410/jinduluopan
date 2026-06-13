import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { DataSource, Update, ProgressStatus } from '../types'
import {
  getDataSourceConfigs,
  createDataSourceConfig,
  updateDataSourceConfig,
  activateDataSourceConfig,
  deleteDataSourceConfig,
  getProjects,
} from '../services/dashboard'
import type { DataSourceConfig, ProjectItem } from '../types/dashboard'

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
  refresh: () => Promise<void>
  addDataSource: (ds: Omit<DataSourceConfig, 'id' | 'isActive' | 'createdAt'>) => Promise<void>
  updateDataSource: (id: string, partial: Partial<DataSourceConfig>) => Promise<void>
  removeDataSource: (id: string) => Promise<void>
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined)

function mapConfigToDataSource(config: DataSourceConfig): DataSource {
  const typeField = (config as any).type
  const typeAny = typeField === 'fengshen' ? 'doc' : typeField === 'api' ? 'api' : 'wiki'
  return {
    id: config.id,
    name: config.name,
    link: (config as any).apiUrl || '',
    type: typeAny as any,
    module: 'team',
    topic: (config as any).topic || '',
    frequency: (config as any).frequency || 'weekly',
    status: config.isActive ? 'enabled' : 'disabled',
    remark: (config as any).remark || '',
    lastSyncTime: (config as any).lastSyncTime || '',
    lastSyncStatus: (config as any).lastSyncStatus || 'pending',
    lastSyncResult: (config as any).lastSyncResult || '',
    createdAt: (config as any).createdAt || new Date().toISOString(),
    updatedAt: (config as any).updatedAt || new Date().toISOString(),
  }
}

function mapDataSourceToConfig(ds: DataSource): DataSourceConfig {
  const typeStr: string = String(ds.type)
  const typeAny = typeStr === 'api' ? 'api' : 'mock'
  return {
    id: ds.id,
    name: ds.name,
    type: typeAny as any,
    apiUrl: ds.link,
    channels: [],
    isActive: ds.status === 'enabled',
    hasFengshenDashboard: false,
    hasDataTable: true,
    hasAimeAnalysis: false,
    syncInterval: 600,
  } as DataSourceConfig
}

function mapProjectToUpdate(p: ProjectItem): Update {
  const importance: 'high' | 'medium' | 'low' =
    p.priority === 'high' || p.priority === 'medium' || p.priority === 'low' ? p.priority : 'medium'

  let status: ProgressStatus = 'on-track'
  switch (p.status) {
    case 'at_risk':
      status = 'at-risk'
      break
    case 'completed':
      status = 'completed'
      break
    case 'in_progress':
      status = 'on-track'
      break
    case 'not_started':
      status = 'on-track'
      break
    case 'paused':
      status = 'on-track'
      break
    default:
      status = 'on-track'
  }

  const assignee = p.collaborators && p.collaborators.length > 0 ? p.collaborators[0] : ''

  return {
    id: p.id,
    sourceType: 'document',
    time: p.startDate,
    summary: p.goal,
    importance,
    affectedObjects: [p.name],
    suggestedAction: '',
    sourceLink: '',
    title: p.name,
    status,
    pocStatus: 'planned',
    lastUpdate: p.updatedAt || p.endDate || '',
    assignee,
    progress: typeof p.progress === 'number' ? p.progress : 0,
    milestones: [],
    metrics: [],
    relatedModules: [p.detail || '项目'],
    docName: p.name,
  }
}

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [updates, setUpdates] = useState<Update[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null)

  const loadDataSources = useCallback(async () => {
    try {
      const res = await getDataSourceConfigs()
      if (res && res.success && Array.isArray(res.data)) {
        setDataSources(res.data.map(mapConfigToDataSource))
      } else {
        setDataSources([])
      }
    } catch {
      setDataSources([])
    }
  }, [])

  const loadUpdates = useCallback(async () => {
    try {
      const res = await getProjects()
      if (res && res.success && Array.isArray(res.data)) {
        setUpdates(res.data.map(mapProjectToUpdate))
      } else {
        setUpdates([])
      }
    } catch {
      setUpdates([])
    }
  }, [])

  const refresh = useCallback(async () => {
    await Promise.all([loadDataSources(), loadUpdates()])
  }, [loadDataSources, loadUpdates])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Persist to localStorage as a fallback cache
  useEffect(() => {
    try {
      localStorage.setItem('dataSources', JSON.stringify(dataSources))
    } catch {}
  }, [dataSources])

  useEffect(() => {
    try {
      localStorage.setItem('updates', JSON.stringify(updates))
    } catch {}
  }, [updates])

  const clearUpdates = () => {
    setUpdates([])
  }

  const addDataSource = async (
    ds: Omit<DataSourceConfig, 'id' | 'isActive' | 'createdAt'>
  ) => {
    try {
      const res = await createDataSourceConfig(ds as any)
      if (res && res.success && res.data) {
        const newDs = mapConfigToDataSource(res.data)
        setDataSources(prev => [...prev, newDs])
      }
    } catch {
      // ignore
    }
  }

  const updateDataSource = async (id: string, partial: Partial<DataSourceConfig>) => {
    try {
      const res = await updateDataSourceConfig(id, partial)
      if (res && res.success && res.data) {
        const updated = mapConfigToDataSource(res.data)
        setDataSources(prev => prev.map(ds => (ds.id === id ? updated : ds)))
      }
    } catch {
      // ignore
    }
  }

  const removeDataSource = async (id: string) => {
    try {
      await deleteDataSourceConfig(id)
      setDataSources(prev => prev.filter(ds => ds.id !== id))
    } catch {
      // ignore
    }
  }

  const syncDataSource = async (id: string) => {
    setIsSyncing(true)
    setSyncingSourceId(id)

    try {
      await activateDataSourceConfig(id)

      setDataSources(prev =>
        prev.map(ds =>
          ds.id === id
            ? {
                ...ds,
                status: 'enabled',
                lastSyncStatus: 'success',
                lastSyncTime: new Date().toLocaleString(),
                lastSyncResult: '同步成功',
                updatedAt: new Date().toISOString(),
              }
            : {
                ...ds,
                status: 'disabled',
              }
        )
      )

      await loadUpdates()
    } catch {
      setDataSources(prev =>
        prev.map(ds =>
          ds.id === id
            ? { ...ds, lastSyncStatus: 'failed' as any, lastSyncTime: new Date().toLocaleString(), lastSyncResult: '同步失败', updatedAt: new Date().toISOString() }
            : ds
        )
      )
    } finally {
      setIsSyncing(false)
      setSyncingSourceId(null)
    }
  }

  const syncAllDataSources = async () => {
    const enabled = dataSources.filter(ds => ds.status === 'enabled')
    if (enabled.length === 0) {
      const first = dataSources[0]
      if (first) {
        await syncDataSource(first.id)
      }
      return
    }

    for (const source of enabled) {
      await syncDataSource(source.id)
    }
  }

  return (
    <DataSourceContext.Provider
      value={{
        dataSources,
        setDataSources,
        updates,
        setUpdates,
        syncDataSource,
        syncAllDataSources,
        isSyncing,
        syncingSourceId,
        clearUpdates,
        refresh,
        addDataSource,
        updateDataSource,
        removeDataSource,
      }}
    >
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

// Internal helper reference to silence unused-variable lint in some build configs
void mapDataSourceToConfig
