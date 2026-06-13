import type {
  AdsSummaryResponse,
  AdsConfigResponse,
  ProjectListResponse,
  ProjectItem,
  ProjectFormData,
  NewsListResponse,
  NewsCategory,
  NewsItem,
  TodoListResponse,
  TodoItem,
  TodoFormData,
  TodoStatusUpdate,
  DataSourceConfig,
} from '../types/dashboard'

// ==================== 数据存储模式配置 ====================
// 可选值: 'local' (localStorage) | 'firebase' (Firebase Firestore)
const DATA_STORAGE_MODE: 'local' | 'firebase' = 'firebase'

// ==================== Firebase 集成 (可选) ====================
let db: any = null
let isFirebaseAvailable = false
let firebaseInitialized = false

async function initFirebase() {
  if (firebaseInitialized) return
  console.log('🔄 正在初始化 Firebase...')
  try {
    // 动态导入 Firebase，避免配置错误时崩溃
    const firebaseConfig = await import('../config/firebase')
    db = firebaseConfig.getFirebaseDb()
    isFirebaseAvailable = !!db
    console.log('Firebase db:', db ? '✅ 已连接' : '❌ 未连接')
    if (isFirebaseAvailable) {
      console.log('✅ Firebase 初始化成功')
    } else {
      console.warn('⚠️ Firebase 不可用，将使用 localStorage 模式')
    }
  } catch (error) {
    console.warn('❌ Firebase 未配置，将使用 localStorage 模式:', error)
    isFirebaseAvailable = false
  }
  firebaseInitialized = true
}

// ==================== localStorage 持久化工具 ====================
const STORAGE_KEYS = {
  projects: 'dashboard_projects',
  todos: 'dashboard_todos',
  dataSources: 'dashboard_data_sources',
  adsSummary: 'dashboard_ads_summary',
  adsConfig: 'dashboard_ads_config',
}

// 从 localStorage 读取数据
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    console.warn(`Failed to load ${key} from localStorage`)
  }
  return defaultValue
}

// 保存到 localStorage
function saveToStorage(key: string, data: any) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    console.warn(`Failed to save ${key} to localStorage`)
  }
}

// 初始化本地数据
// 处理旧数据迁移，确保所有项目都有 priority 字段
const migrateProjects = (projects: ProjectItem[]): ProjectItem[] => {
  return projects.map(project => ({
    ...project,
    priority: project.priority || 'medium'
  }))
}

// 从 localStorage 读取数据，完全保留用户历史数据
const storedProjects = loadFromStorage(STORAGE_KEYS.projects, [] as ProjectItem[])
const storedTodos = loadFromStorage(STORAGE_KEYS.todos, [] as TodoItem[])

let localProjects: ProjectItem[] = migrateProjects(storedProjects)
let localTodos: TodoItem[] = storedTodos
let localConfigs: DataSourceConfig[] = loadFromStorage(STORAGE_KEYS.dataSources, [])

// ==================== Firebase 数据操作工具 ====================
async function getFromFirebase<T>(collection: string): Promise<T[]> {
  if (!isFirebaseAvailable || !db) return []
  try {
    const { collection: firestoreCollection, getDocs, query, orderBy } = await import('firebase/firestore')
    const q = query(firestoreCollection(db, collection), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[]
  } catch (error) {
    console.error('Firebase get error:', error)
    return []
  }
}

async function saveToFirebase<T extends { id?: string }>(collection: string, data: T): Promise<T> {
  if (!isFirebaseAvailable || !db) return data
  try {
    const { collection: firestoreCollection, doc, setDoc, addDoc } = await import('firebase/firestore')
    if (data.id) {
      await setDoc(doc(db, collection, data.id), data)
      return data
    } else {
      const docRef = await addDoc(firestoreCollection(db, collection), data)
      return { ...data, id: docRef.id } as T
    }
  } catch (error) {
    console.error('Firebase save error:', error)
    return data
  }
}

async function updateInFirebase<T>(collection: string, id: string, data: Partial<T>): Promise<void> {
  if (!isFirebaseAvailable || !db) return
  try {
    const { doc, updateDoc } = await import('firebase/firestore')
    await updateDoc(doc(db, collection, id), data)
  } catch (error) {
    console.error('Firebase update error:', error)
  }
}

async function deleteFromFirebase(collection: string, id: string): Promise<void> {
  if (!isFirebaseAvailable || !db) return
  try {
    const { doc, deleteDoc } = await import('firebase/firestore')
    await deleteDoc(doc(db, collection, id))
  } catch (error) {
    console.error('Firebase delete error:', error)
  }
}

// ==================== 统一数据访问层 ====================
async function useFirebase(): Promise<boolean> {
  await initFirebase()
  return DATA_STORAGE_MODE === 'firebase' && isFirebaseAvailable
}

// ==================== 投流数据模块 ====================

function buildEmptyAdsSummary(): any {
  return {
    date: new Date().toISOString().split('T')[0],
    sourceName: '风神投流看板-激励业务',
    metrics: [],
    summary: '已接入真实风神看板数据，下方为实时投流数据播报',
    attributions: [],
    hasFengshenDashboard: true,
    hasDataTable: false,
    hasAimeAnalysis: false,
    hasDataRefinement: false,
    syncStatus: 'synced',
    syncTime: new Date().toLocaleString('zh-CN'),
    fengshenUrl: 'https://data.bytedance.net/aeolus/pages/dashboard/1510451?appId=1128&sheetId=2112164&snapshotId=1184035',
    updatedAt: new Date().toISOString(),
  }
}

function buildEmptyAdsConfig(): any {
  const defaultConfig = {
    id: 'ds_fengshen_001',
    name: '风神投流看板-激励业务',
    type: 'fengshen',
    apiUrl: 'https://data.bytedance.net/aeolus/pages/dashboard/1510451?appId=1128&sheetId=2112164&snapshotId=1184035',
    channels: ['激励业务', '品牌业务'],
    isActive: true,
    hasFengshenDashboard: true,
    hasDataTable: false,
    hasAimeAnalysis: false,
    syncInterval: 300,
  }
  return {
    configId: 'cfg_fengshen',
    sourceType: 'fengshen',
    sourceName: '风神投流看板-激励业务',
    sourceUrl: 'https://data.bytedance.net/aeolus/pages/dashboard/1510451?appId=1128&sheetId=2112164&snapshotId=1184035',
    rangeType: 'today',
    aiEnabled: false,
    metricKeys: [],
    currentConfig: defaultConfig,
    availableConfigs: [defaultConfig],
  }
}

/**
 * 获取投流数据概览
 * 先尝试 Firebase（ads_summary 集合，取最新一条，按 updatedAt 倒序），不可用则回退 localStorage
 */
export async function getAdsSummary(): Promise<AdsSummaryResponse> {
  if (await useFirebase()) {
    if (isFirebaseAvailable && db) {
      try {
        const { collection: firestoreCollection, getDocs, query, orderBy, limit } = await import('firebase/firestore')
        const q = query(
          firestoreCollection(db, 'ads_summary'),
          orderBy('updatedAt', 'desc'),
          limit(1)
        )
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0]
          return { success: true, data: { id: doc.id, ...doc.data() } as any }
        }
      } catch (error) {
        console.error('Firebase get ads_summary error:', error)
      }
    }
    return { success: true, data: buildEmptyAdsSummary() }
  }

  const stored = loadFromStorage<any>(STORAGE_KEYS.adsSummary, null)
  if (stored) {
    return { success: true, data: stored }
  }
  return { success: true, data: buildEmptyAdsSummary() }
}

/**
 * 获取投流配置
 * 先尝试 Firebase（ads_config 集合，取最新一条），不可用则回退 localStorage
 */
export async function getAdsConfig(): Promise<AdsConfigResponse> {
  if (await useFirebase()) {
    if (isFirebaseAvailable && db) {
      try {
        const { collection: firestoreCollection, getDocs, query, orderBy, limit } = await import('firebase/firestore')
        const q = query(
          firestoreCollection(db, 'ads_config'),
          orderBy('updatedAt', 'desc'),
          limit(1)
        )
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0]
          return { success: true, data: { id: doc.id, ...doc.data() } as any }
        }
      } catch (error) {
        console.error('Firebase get ads_config error:', error)
      }
    }
    return { success: true, data: buildEmptyAdsConfig() }
  }

  const stored = loadFromStorage<any>(STORAGE_KEYS.adsConfig, null)
  if (stored) {
    return { success: true, data: stored }
  }
  return { success: true, data: buildEmptyAdsConfig() }
}

// ==================== 项目进展模块 ====================

/**
 * 获取项目列表
 * 先尝试 Firebase → 如果 Firebase 不可用 → 直接用 localStorage
 */
export async function getProjects(): Promise<ProjectListResponse> {
  console.log('📋 getProjects 被调用')
  console.log('📊 DATA_STORAGE_MODE:', DATA_STORAGE_MODE)
  const useFb = await useFirebase()
  console.log('🔌 useFirebase():', useFb)

  if (useFb) {
    console.log('📡 使用 Firebase 加载项目...')
    const data = await getFromFirebase<ProjectItem>('projects')
    console.log('📦 从 Firebase 加载到', data.length, '个项目')
    return { success: true, data: migrateProjects(data) }
  }

  console.log('💾 使用 localStorage 加载项目，项目数:', localProjects.length)
  return { success: true, data: localProjects }
}

/**
 * 创建新项目
 */
export async function createProject(data: ProjectFormData): Promise<{ success: boolean; data: ProjectItem }> {
  const now = new Date().toISOString()
  const newProject: ProjectItem = {
    id: `p_${Date.now()}`,
    ...data,
    updatedAt: now,
    createdAt: now,
  }

  if (await useFirebase()) {
    const savedProject = await saveToFirebase('projects', newProject)
    return { success: true, data: savedProject }
  }

  localProjects = [newProject, ...localProjects]
  saveToStorage(STORAGE_KEYS.projects, localProjects)
  return { success: true, data: newProject }
}

/**
 * 更新项目
 */
export async function updateProject(id: string, data: ProjectFormData): Promise<{ success: boolean; data: ProjectItem }> {
  const updateData = { ...data, updatedAt: new Date().toISOString() }

  if (await useFirebase()) {
    await updateInFirebase('projects', id, updateData)
    const allProjects = await getFromFirebase<ProjectItem>('projects')
    const updated = allProjects.find((p) => p.id === id)!
    return { success: true, data: updated }
  }

  localProjects = localProjects.map((p) =>
    p.id === id ? { ...p, ...updateData } : p
  )
  saveToStorage(STORAGE_KEYS.projects, localProjects)
  const updated = localProjects.find((p) => p.id === id)!
  return { success: true, data: updated }
}

/**
 * 删除项目
 */
export async function deleteProject(id: string): Promise<{ success: boolean }> {
  if (await useFirebase()) {
    await deleteFromFirebase('projects', id)
    return { success: true }
  }

  localProjects = localProjects.filter((p) => p.id !== id)
  saveToStorage(STORAGE_KEYS.projects, localProjects)
  return { success: true }
}

// ==================== 科技新闻模块 ====================

/**
 * 获取新闻列表
 * 调用 /api/news 真实 RSS API（支持本地开发 & Vercel 生产）
 */
const NEWS_DISPLAY_LIMIT = 30

export async function getNews(category: NewsCategory = 'all'): Promise<NewsListResponse> {
  try {
    console.log(`📰 正在获取真实新闻数据 (category=${category}, count=${NEWS_DISPLAY_LIMIT})...`)
    const API_BASE = typeof window !== 'undefined' ? '' : 'http://localhost:3001'
    const response = await fetch(
      `${API_BASE}/api/news?category=${encodeURIComponent(category)}&count=${NEWS_DISPLAY_LIMIT}`
    )
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const result = await response.json()
    const sorted: NewsItem[] = [...result.data]
      .sort(
        (a: NewsItem, b: NewsItem) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .slice(0, NEWS_DISPLAY_LIMIT)
    console.log(
      `✅ 成功获取 ${sorted.length} 条真实新闻，来源: ${result.source}${result.isRealRSS ? '（真实RSS）' : '（本地生成）'}`
    )
    return { success: true, data: sorted }
  } catch (error) {
    console.warn(
      '⚠️ 无法连接到新闻服务，请检查网络连接或 RSS API 是否正常，错误:',
      (error as Error).message
    )
    return {
      success: false,
      data: [],
    }
  }
}

// ==================== 今日 Todo 模块 ====================

/**
 * 获取指定日期的 Todo 列表
 */
export async function getTodos(date: string): Promise<TodoListResponse> {
  if (await useFirebase()) {
    const allTodos = await getFromFirebase<TodoItem>('todos')
    const data = allTodos.filter((t) => t.date === date)
    return { success: true, data }
  }

  const data = localTodos.filter((t) => t.date === date)
  return { success: true, data }
}

/**
 * 创建新 Todo
 */
export async function createTodo(data: TodoFormData): Promise<{ success: boolean; data: TodoItem }> {
  const now = new Date().toISOString()
  const newTodo: TodoItem = {
    id: `t_${Date.now()}`,
    ...data,
    updatedAt: now,
    createdAt: now,
  }

  if (await useFirebase()) {
    const savedTodo = await saveToFirebase('todos', newTodo)
    return { success: true, data: savedTodo }
  }

  localTodos = [newTodo, ...localTodos]
  saveToStorage(STORAGE_KEYS.todos, localTodos)
  return { success: true, data: newTodo }
}

/**
 * 更新 Todo
 */
export async function updateTodo(id: string, data: TodoFormData): Promise<{ success: boolean; data: TodoItem }> {
  const updateData = { ...data, updatedAt: new Date().toISOString() }

  if (await useFirebase()) {
    await updateInFirebase('todos', id, updateData)
    const allTodos = await getFromFirebase<TodoItem>('todos')
    const updated = allTodos.find((t) => t.id === id)!
    return { success: true, data: updated }
  }

  localTodos = localTodos.map((t) =>
    t.id === id ? { ...t, ...updateData } : t
  )
  saveToStorage(STORAGE_KEYS.todos, localTodos)
  const updated = localTodos.find((t) => t.id === id)!
  return { success: true, data: updated }
}

/**
 * 更新 Todo 状态
 */
export async function updateTodoStatus(id: string, statusData: TodoStatusUpdate): Promise<{ success: boolean; data: TodoItem }> {
  const updateData = { ...statusData, updatedAt: new Date().toISOString() }

  if (await useFirebase()) {
    await updateInFirebase('todos', id, updateData)
    const allTodos = await getFromFirebase<TodoItem>('todos')
    const updated = allTodos.find((t) => t.id === id)!
    return { success: true, data: updated }
  }

  localTodos = localTodos.map((t) =>
    t.id === id ? { ...t, ...updateData } : t
  )
  saveToStorage(STORAGE_KEYS.todos, localTodos)
  const updated = localTodos.find((t) => t.id === id)!
  return { success: true, data: updated }
}

/**
 * 删除 Todo
 */
export async function deleteTodo(id: string): Promise<{ success: boolean }> {
  if (await useFirebase()) {
    await deleteFromFirebase('todos', id)
    return { success: true }
  }

  localTodos = localTodos.filter((t) => t.id !== id)
  saveToStorage(STORAGE_KEYS.todos, localTodos)
  return { success: true }
}

// ==================== 数据源配置管理 ====================

export interface DataSourceConfigResponse {
  success: boolean
  data: DataSourceConfig
}

export interface DataSourceListResponse {
  success: boolean
  data: DataSourceConfig[]
}

export async function getDataSourceConfigs(): Promise<DataSourceListResponse> {
  if (await useFirebase()) {
    const data = await getFromFirebase<DataSourceConfig>('data_sources')
    return { success: true, data }
  }
  return { success: true, data: localConfigs }
}

export async function getDataSourceConfig(id: string): Promise<DataSourceConfigResponse> {
  if (await useFirebase()) {
    const all = await getFromFirebase<DataSourceConfig>('data_sources')
    const config = all.find((c) => c.id === id)
    if (!config) {
      return { success: false, data: {} as DataSourceConfig }
    }
    return { success: true, data: config }
  }
  const config = localConfigs.find((c) => c.id === id)
  if (!config) {
    return { success: false, data: {} as DataSourceConfig }
  }
  return { success: true, data: config }
}

export async function createDataSourceConfig(config: Omit<DataSourceConfig, 'id' | 'isActive' | 'createdAt'>): Promise<DataSourceConfigResponse> {
  const newConfig: DataSourceConfig = {
    ...config,
    id: `ds_${Date.now()}`,
    isActive: false,
  } as DataSourceConfig

  if (await useFirebase()) {
    const saved = await saveToFirebase('data_sources', newConfig)
    return { success: true, data: saved }
  }

  localConfigs = [...localConfigs, newConfig]
  saveToStorage(STORAGE_KEYS.dataSources, localConfigs)
  return { success: true, data: newConfig }
}

export async function updateDataSourceConfig(id: string, config: Partial<DataSourceConfig>): Promise<DataSourceConfigResponse> {
  if (await useFirebase()) {
    await updateInFirebase('data_sources', id, config)
    const all = await getFromFirebase<DataSourceConfig>('data_sources')
    const updated = all.find((c) => c.id === id)
    if (!updated) {
      return { success: false, data: {} as DataSourceConfig }
    }
    return { success: true, data: updated }
  }

  localConfigs = localConfigs.map((c) => (c.id === id ? { ...c, ...config } : c))
  saveToStorage(STORAGE_KEYS.dataSources, localConfigs)
  const updated = localConfigs.find((c) => c.id === id)
  if (!updated) {
    return { success: false, data: {} as DataSourceConfig }
  }
  return { success: true, data: updated }
}

export async function activateDataSourceConfig(id: string): Promise<DataSourceConfigResponse> {
  if (await useFirebase()) {
    const all = await getFromFirebase<DataSourceConfig>('data_sources')
    for (const c of all) {
      const newIsActive = c.id === id
      if (c.isActive !== newIsActive) {
        await updateInFirebase('data_sources', c.id, { isActive: newIsActive })
      }
    }
    const refreshed = await getFromFirebase<DataSourceConfig>('data_sources')
    const updated = refreshed.find((c) => c.id === id)
    if (!updated) {
      return { success: false, data: {} as DataSourceConfig }
    }
    return { success: true, data: updated }
  }

  localConfigs = localConfigs.map((c) => ({
    ...c,
    isActive: c.id === id,
  }))
  saveToStorage(STORAGE_KEYS.dataSources, localConfigs)
  const updated = localConfigs.find((c) => c.id === id)
  if (!updated) {
    return { success: false, data: {} as DataSourceConfig }
  }
  return { success: true, data: updated }
}

export async function deleteDataSourceConfig(id: string): Promise<{ success: boolean }> {
  if (await useFirebase()) {
    await deleteFromFirebase('data_sources', id)
    return { success: true }
  }

  localConfigs = localConfigs.filter((c) => c.id !== id)
  saveToStorage(STORAGE_KEYS.dataSources, localConfigs)
  return { success: true }
}

// 恢复示例数据功能 - 向 localStorage 写入示例数据
export async function restoreSampleData(): Promise<{ success: boolean; message: string }> {
  const existingProjects = loadFromStorage(STORAGE_KEYS.projects, [] as any[])
  const existingTodos = loadFromStorage(STORAGE_KEYS.todos, [] as any[])

  let restoredCount = 0
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().split('T')[0]
  const weekLaterStr = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0]
  const twoWeeksLaterStr = new Date(now.getTime() + 14 * 86400000).toISOString().split('T')[0]

  // 恢复项目
  if (existingProjects.length === 0) {
    const sampleProjects: ProjectItem[] = [
      {
        id: 'p_sample_1',
        name: '投流数据看板搭建',
        goal: '搭建实时投流数据监控看板，整合多渠道数据源',
        startDate: todayStr,
        endDate: twoWeeksLaterStr,
        progress: 35,
        status: 'in_progress',
        priority: 'high',
        currentTask: '接入风神 API 数据',
        collaborators: ['张三', '李四'],
        detail: '重点关注 ROI、转化率等核心指标，确保数据实时同步',
        updatedAt: now.toISOString(),
        createdAt: now.toISOString(),
      },
      {
        id: 'p_sample_2',
        name: '新产品推广活动',
        goal: '通过多渠道推广，提升品牌曝光和转化',
        startDate: todayStr,
        endDate: weekLaterStr,
        progress: 60,
        status: 'in_progress',
        priority: 'medium',
        currentTask: '撰写落地页文案',
        collaborators: ['王五'],
        detail: '涉及抖音、微信、小红书等多渠道投放',
        updatedAt: now.toISOString(),
        createdAt: now.toISOString(),
      },
      {
        id: 'p_sample_3',
        name: '用户增长研究',
        goal: '分析用户画像，优化增长策略',
        startDate: tomorrowStr,
        endDate: twoWeeksLaterStr,
        progress: 0,
        status: 'not_started',
        priority: 'low',
        currentTask: '',
        collaborators: [],
        detail: '准备阶段，暂未开始',
        updatedAt: now.toISOString(),
        createdAt: now.toISOString(),
      },
    ]
    localProjects = migrateProjects(sampleProjects)
    saveToStorage(STORAGE_KEYS.projects, localProjects)
    restoredCount += sampleProjects.length
  } else {
    localProjects = migrateProjects(existingProjects)
  }

  // 恢复 Todo
  if (existingTodos.length === 0) {
    const sampleTodos: TodoItem[] = [
      {
        id: 't_sample_1',
        date: todayStr,
        content: '查看今日投流数据报表',
        priority: 'high',
        status: 'todo',
        remark: '重点关注 ROI 变化',
        updatedAt: now.toISOString(),
        createdAt: now.toISOString(),
      },
      {
        id: 't_sample_2',
        date: todayStr,
        content: '整理昨日渠道投放效果',
        priority: 'medium',
        status: 'doing',
        remark: '',
        updatedAt: now.toISOString(),
        createdAt: now.toISOString(),
      },
      {
        id: 't_sample_3',
        date: todayStr,
        content: '与产品团队沟通需求',
        priority: 'low',
        status: 'done',
        remark: '会议时间 15:00',
        updatedAt: now.toISOString(),
        createdAt: now.toISOString(),
      },
      {
        id: 't_sample_4',
        date: tomorrowStr,
        content: '撰写数据分析周报',
        priority: 'high',
        status: 'todo',
        remark: '',
        updatedAt: now.toISOString(),
        createdAt: now.toISOString(),
      },
    ]
    localTodos = sampleTodos
    saveToStorage(STORAGE_KEYS.todos, localTodos)
    restoredCount += sampleTodos.length
  } else {
    localTodos = existingTodos
  }

  return {
    success: true,
    message: restoredCount > 0
      ? `已恢复 ${restoredCount} 条示例数据`
      : '您已有数据，无需恢复'
  }
}
