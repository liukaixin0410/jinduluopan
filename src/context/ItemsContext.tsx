import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { Item, ItemStatus } from '../types'
import { getProjects, updateProject } from '../services/dashboard'
import type { ProjectItem, ProjectFormData } from '../types/dashboard'

interface ItemsContextType {
  items: Item[]
  updateItem: (id: string, updatedItem: Partial<Item>) => void
  getItemById: (id: string) => Item | undefined
  refresh: () => Promise<void>
  loading: boolean
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined)

function projectStatusToItemStatus(status: ProjectItem['status']): ItemStatus {
  switch (status) {
    case 'in_progress':
      return 'in-progress'
    case 'completed':
      return 'completed'
    case 'paused':
      return 'on-hold'
    case 'at_risk':
      return 'confirm'
    case 'not_started':
    default:
      return 'pending'
  }
}

function mapProjectToItem(project: ProjectItem): Item {
  return {
    id: project.id,
    title: project.name,
    description: project.goal,
    status: projectStatusToItemStatus(project.status),
    priority: project.priority,
    deadline: project.endDate,
    source: '项目',
    assignee: project.collaborators && project.collaborators.length > 0 ? project.collaborators[0] : '',
    latestProgress: project.currentTask,
    risks: project.detail,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }
}

function itemPartialToProjectFormData(id: string, items: Item[], partial: Partial<Item>): ProjectFormData {
  const current = items.find((i) => i.id === id)
  const name = partial.title ?? current?.title ?? ''
  const goal = partial.description ?? current?.description ?? ''
  const endDate = partial.deadline ?? current?.deadline ?? ''
  const startDate = current?.createdAt ? current.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
  const priority = partial.priority ?? current?.priority ?? 'medium'
  const collaborators = partial.assignee
    ? [partial.assignee]
    : (current?.assignee ? [current.assignee] : [])

  let status: ProjectItem['status'] = 'not_started'
  const statusToUse = partial.status ?? current?.status
  switch (statusToUse) {
    case 'in-progress':
      status = 'in_progress'
      break
    case 'completed':
      status = 'completed'
      break
    case 'on-hold':
      status = 'paused'
      break
    case 'confirm':
      status = 'at_risk'
      break
    case 'pending':
      status = 'not_started'
      break
    default:
      status = 'not_started'
      break
  }

  const progress: number = status === 'completed' ? 100 : status === 'not_started' ? 0 : 50

  return {
    name,
    goal,
    startDate,
    endDate,
    progress,
    status,
    priority,
    currentTask: partial.latestProgress ?? current?.latestProgress ?? '',
    collaborators,
    detail: partial.risks ?? current?.risks ?? '',
  }
}

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  const loadProjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getProjects()
      if (res && res.success && Array.isArray(res.data)) {
        setItems(res.data.map(mapProjectToItem))
      } else {
        setItems([])
      }
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const updateItem = async (id: string, updatedItem: Partial<Item>) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, ...updatedItem, updatedAt: new Date().toISOString() }
          : item
      )
    )

    try {
      const formData = itemPartialToProjectFormData(id, items, updatedItem)
      const projectRes = await updateProject(id, formData)
      if (projectRes && projectRes.success && projectRes.data) {
        const updated = mapProjectToItem(projectRes.data)
        setItems(prevItems =>
          prevItems.map(item => (item.id === id ? updated : item))
        )
      }
    } catch {
      // Keep optimistic update on failure
    }
  }

  const getItemById = (id: string) => {
    return items.find(item => item.id === id)
  }

  return (
    <ItemsContext.Provider value={{ items, updateItem, getItemById, refresh: loadProjects, loading }}>
      {children}
    </ItemsContext.Provider>
  )
}

export function useItems() {
  const context = useContext(ItemsContext)
  if (context === undefined) {
    throw new Error('useItems must be used within an ItemsProvider')
  }
  return context
}
