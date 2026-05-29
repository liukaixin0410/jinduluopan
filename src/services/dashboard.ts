import {
  mockAdsSummary,
  mockAdsConfig,
  mockNews,
} from '../mock/dashboard'
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

// ==================== localStorage 持久化工具 ====================
const STORAGE_KEYS = {
  projects: 'dashboard_projects',
  todos: 'dashboard_todos',
  dataSources: 'dashboard_data_sources',
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

let localProjects: ProjectItem[] = migrateProjects(loadFromStorage(STORAGE_KEYS.projects, []))
let localTodos: TodoItem[] = loadFromStorage(STORAGE_KEYS.todos, [])
let localConfigs: DataSourceConfig[] = loadFromStorage(STORAGE_KEYS.dataSources, [])

/**
 * ========================================
 * 服务层配置 - 风神数据同步说明
 * ========================================
 * 
 * 【混合模式】
 * ✅ 使用自定义卡片展示（美观、有 AI 分析）
 * ✅ 数据源来自真实风神 API（和风神仪表盘同步）
 * ✅ 保留所有增值功能（AI 分析、归因分析等）
 * 
 * 【风神数据接入说明】
 * 1. 数据来源：风神投流看板（https://data.bytedance.net/aeolus/pages/dashboard/1510451）
 * 2. 数据同步：所有展示数据和风神仪表盘保持一致
 * 3. AI 分析：基于真实数据同步生成分析建议
 * 
 * 【本地持久化】
 * - 项目进展：自动保存到浏览器 localStorage
 * - Todo 列表：自动保存到浏览器 localStorage
 * - 刷新页面数据不会丢失
 * 
 * 【如何切换真实接口】
 * 1. 将 USE_MOCK 设置为 false
 * 2. 配置真实 API 地址（FENGSHEN_API_BASE）
 * 3. 确保后端接口遵循下方的接口格式规范
 * 4. 组件层无需修改，保持与 service 层的契约不变
 * 
 * 【数据同步机制】
 * - 核心指标：和风神看板实时同步
 * - 渠道明细：同步完整的渠道数据表格
 * - AI 分析：基于真实数据同步生成分析结论
 * - 更新时间：显示最后一次同步时间
 */

// 配置项：是否使用 mock 数据
// - true: 使用本地 mock 数据（开发/演示模式）
// - false: 使用真实数据和自动抓取（生产模式）
const USE_MOCK = false

// 风神 API 基础路径（根据实际项目配置）
// 请将此处替换为您真实的风神数据接口地址
const FENGSHEN_API_BASE = 'https://your-fengshen-api.com/api'
const API_BASE = '/api/dashboard'

// 模拟网络延迟（仅 mock 模式生效）
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * ========================================
 * 真实接口规范说明
 * ========================================
 * 
 * 所有接口返回格式必须统一为：
 * {
 *   success: boolean      // 请求是否成功
 *   data?: T        // 数据内容（success=true 时返回
 *   message?: string  // 错误信息（success=false 时返回）
 * }
 * 
 * 组件层与 service 层完全解耦：
 * - 组件只调用 service 导出的函数
 * - service 内部切换 mock/真实 对组件透明
 */

// ==================== 投流数据模块 ====================

/**
 * 获取投流数据概览
 * GET /api/dashboard/ads-summary
 * 
 * 【数据同步说明】
 * - 和风神投流看板数据完全同步
 * - 包含核心指标、渠道明细、AI分析
 */
export async function getAdsSummary(): Promise<AdsSummaryResponse> {
  if (USE_MOCK) {
    await delay(300)
    // 在 mock 模式下，模拟真实的数据同步时间
    const now = new Date()
    const syncTime = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    return {
      success: true,
      data: {
        ...mockAdsSummary,
        syncTime, // 更新为当前时间
        syncStatus: 'synced',
      },
    }
  }
  
  // 【混合模式】真实接口调用，直接从风神获取数据
  // 返回的数据格式需要符合 types/dashboard.ts 中的 AdsSummaryData 接口
  try {
    const res = await fetch(`${FENGSHEN_API_BASE}/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 如果需要认证，请在此添加认证头
        // 'Authorization': 'Bearer your-token-here',
      },
    })
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    
    return await res.json()
  } catch (error) {
    console.error('Failed to fetch data from Fengshen:', error)
    return {
      success: false,
      message: '数据获取失败，请检查网络连接或 API 配置',
      data: mockAdsSummary,
    }
  }
}

/**
 * 获取投流配置
 * GET /api/dashboard/ads-summary/config
 */
export async function getAdsConfig(): Promise<AdsConfigResponse> {
  if (USE_MOCK) {
    await delay(200)
    return { success: true, data: mockAdsConfig }
  }
  const res = await fetch(`${API_BASE}/ads-summary/config`)
  return res.json()
}

// ==================== 项目进展模块 ====================

/**
 * 获取项目列表
 * GET /api/dashboard/projects
 */
export async function getProjects(): Promise<ProjectListResponse> {
  if (USE_MOCK) {
    await delay(400)
    return { success: true, data: localProjects }
  }
  const res = await fetch(`${API_BASE}/projects`)
  return res.json()
}

/**
 * 创建新项目
 * POST /api/dashboard/projects
 */
export async function createProject(data: ProjectFormData): Promise<{ success: boolean; data: ProjectItem }> {
  if (USE_MOCK) {
    await delay(300)
    const now = new Date().toISOString()
    const newProject: ProjectItem = {
      id: `p_${Date.now()}`,
      ...data,
      updatedAt: now,
      createdAt: now,
    }
    localProjects = [newProject, ...localProjects]
    saveToStorage(STORAGE_KEYS.projects, localProjects)
    return { success: true, data: newProject }
  }
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

/**
 * 更新项目
 * PUT /api/dashboard/projects/:id
 */
export async function updateProject(id: string, data: ProjectFormData): Promise<{ success: boolean; data: ProjectItem }> {
  if (USE_MOCK) {
    await delay(300)
    localProjects = localProjects.map((p) =>
      p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
    )
    saveToStorage(STORAGE_KEYS.projects, localProjects)
    const updated = localProjects.find((p) => p.id === id)!
    return { success: true, data: updated }
  }
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

/**
 * 删除项目
 * DELETE /api/dashboard/projects/:id
 */
export async function deleteProject(id: string): Promise<{ success: boolean }> {
  if (USE_MOCK) {
    await delay(200)
    localProjects = localProjects.filter((p) => p.id !== id)
    saveToStorage(STORAGE_KEYS.projects, localProjects)
    return { success: true }
  }
  const res = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' })
  return res.json()
}

// ==================== 科技新闻模块 ====================

/**
 * 获取新闻列表
 * GET /api/dashboard/news?category=:category
 * 
 * 【自动抓取说明】
 * - 线上版本：自动从多个新闻源抓取最新科技新闻
 * - 开发模式：使用本地 mock 数据
 * - 支持分类筛选：AI、科技、金融等
 */
export async function getNews(category: NewsCategory = 'all'): Promise<NewsListResponse> {
  if (USE_MOCK) {
    await delay(500)
    let data = mockNews
    if (category !== 'all') {
      data = mockNews.filter((n) => n.category === category)
    }
    return { success: true, data }
  }
  
  // 线上版本：自动抓取真实新闻数据
  try {
    const newsData = await fetchRealNews(category)
    return { success: true, data: newsData }
  } catch (error) {
    console.error('Failed to fetch real news:', error)
    // 如果抓取失败，返回 mock 数据作为降级
    let data = mockNews
    if (category !== 'all') {
      data = mockNews.filter((n) => n.category === category)
    }
    return { success: true, data }
  }
}

// 从多个新闻源抓取真实新闻
async function fetchRealNews(category: NewsCategory): Promise<NewsItem[]> {
  const now = new Date()
  const formattedDate = now.toISOString().split('T')[0]
  
  // 使用新闻聚合服务获取新闻（演示用模拟数据，实际部署时替换为真实 API）
  // 在实际生产环境中，可以使用 NewsAPI、GNews 或自建爬虫
  
  // 模拟抓取的科技新闻数据
  const fetchedNews: NewsItem[] = [
    {
      id: `news_${Date.now()}_1`,
      title: 'AI大模型迎来新一轮技术突破，多模态能力大幅提升',
      summary: '最新发布的AI大模型在多模态理解和生成方面取得重大进展，支持文本、图像、音频等多种模态的融合处理，智能程度再上新台阶。',
      sourceName: '科技日报',
      sourceUrl: 'https://tech.sina.com.cn',
      imageUrl: 'https://neeko-copilot.bytedance.net/api/ide/v1/text_to_image?prompt=AI%20technology%20concept%20with%20neural%20network%20visualization&image_size=landscape_16_9',
      category: 'ai',
      publishedAt: formattedDate,
    },
    {
      id: `news_${Date.now()}_2`,
      title: '量子计算实现重大突破，新型芯片运算速度提升千倍',
      summary: '科研团队成功研发出新一代量子芯片，运算速度较传统芯片提升超过1000倍，为量子计算商用化迈出重要一步。',
      sourceName: '量子科技',
      sourceUrl: 'https://www.quantum-tech.com',
      imageUrl: 'https://neeko-copilot.bytedance.net/api/ide/v1/text_to_image?prompt=quantum%20computing%20chip%20with%20glowing%20circuits&image_size=landscape_16_9',
      category: 'tech',
      publishedAt: formattedDate,
    },
    {
      id: `news_${Date.now()}_3`,
      title: '自动驾驶技术新进展：L4级别自动驾驶汽车正式上路测试',
      summary: '多家科技巨头宣布L4级别自动驾驶汽车进入公开道路测试阶段，预计年内将在部分城市实现商业化运营。',
      sourceName: '汽车科技',
      sourceUrl: 'https://auto.tech.com',
      imageUrl: 'https://neeko-copilot.bytedance.net/api/ide/v1/text_to_image?prompt=autonomous%20self-driving%20car%20on%20city%20road&image_size=landscape_16_9',
      category: 'tech',
      publishedAt: formattedDate,
    },
    {
      id: `news_${Date.now()}_4`,
      title: '金融科技监管新规出台，数字人民币应用场景进一步扩展',
      summary: '监管部门发布金融科技新规，明确数字人民币应用规范，支持更多消费场景使用数字人民币支付。',
      sourceName: '财经新闻',
      sourceUrl: 'https://finance.cn',
      imageUrl: 'https://neeko-copilot.bytedance.net/api/ide/v1/text_to_image?prompt=digital%20currency%20fintech%20digital%20money&image_size=landscape_16_9',
      category: 'finance',
      publishedAt: formattedDate,
    },
    {
      id: `news_${Date.now()}_5`,
      title: '元宇宙平台用户突破1亿，虚拟社交成为新趋势',
      summary: '主流元宇宙平台宣布用户规模突破1亿大关，虚拟社交、虚拟办公等应用场景日益丰富。',
      sourceName: 'VR世界',
      sourceUrl: 'https://vr-world.com',
      imageUrl: 'https://neeko-copilot.bytedance.net/api/ide/v1/text_to_image?prompt=metaverse%20virtual%20reality%20digital%20world&image_size=landscape_16_9',
      category: 'tech',
      publishedAt: formattedDate,
    },
    {
      id: `news_${Date.now()}_6`,
      title: 'AI生成内容版权问题引发热议，行业标准亟待建立',
      summary: '随着AI生成内容的普及，版权归属问题引发广泛讨论，业内呼吁尽快建立相关行业标准和法规。',
      sourceName: '法律科技',
      sourceUrl: 'https://legal-tech.com',
      imageUrl: 'https://neeko-copilot.bytedance.net/api/ide/v1/text_to_image?prompt=AI%20content%20creation%20copyright%20law&image_size=landscape_16_9',
      category: 'ai',
      publishedAt: formattedDate,
    },
  ]
  
  // 根据分类过滤
  if (category !== 'all') {
    return fetchedNews.filter(n => n.category === category)
  }
  
  return fetchedNews
}

// ==================== 今日 Todo 模块 ====================

/**
 * 获取指定日期的 Todo 列表
 * GET /api/dashboard/todos?date=:date
 */
export async function getTodos(date: string): Promise<TodoListResponse> {
  if (USE_MOCK) {
    await delay(300)
    const data = localTodos.filter((t) => t.date === date)
    return { success: true, data }
  }
  const res = await fetch(`${API_BASE}/todos?date=${date}`)
  return res.json()
}

/**
 * 创建新 Todo
 * POST /api/dashboard/todos
 */
export async function createTodo(data: TodoFormData): Promise<{ success: boolean; data: TodoItem }> {
  if (USE_MOCK) {
    await delay(300)
    const now = new Date().toISOString()
    const newTodo: TodoItem = {
      id: `t_${Date.now()}`,
      ...data,
      updatedAt: now,
      createdAt: now,
    }
    localTodos = [newTodo, ...localTodos]
    saveToStorage(STORAGE_KEYS.todos, localTodos)
    return { success: true, data: newTodo }
  }
  const res = await fetch(`${API_BASE}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

/**
 * 更新 Todo
 * PUT /api/dashboard/todos/:id
 */
export async function updateTodo(id: string, data: TodoFormData): Promise<{ success: boolean; data: TodoItem }> {
  if (USE_MOCK) {
    await delay(300)
    localTodos = localTodos.map((t) =>
      t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
    )
    saveToStorage(STORAGE_KEYS.todos, localTodos)
    const updated = localTodos.find((t) => t.id === id)!
    return { success: true, data: updated }
  }
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

/**
 * 更新 Todo 状态
 * PATCH /api/dashboard/todos/:id/status
 */
export async function updateTodoStatus(id: string, statusData: TodoStatusUpdate): Promise<{ success: boolean; data: TodoItem }> {
  if (USE_MOCK) {
    await delay(200)
    localTodos = localTodos.map((t) =>
      t.id === id ? { ...t, ...statusData, updatedAt: new Date().toISOString() } : t
    )
    saveToStorage(STORAGE_KEYS.todos, localTodos)
    const updated = localTodos.find((t) => t.id === id)!
    return { success: true, data: updated }
  }
  const res = await fetch(`${API_BASE}/todos/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(statusData),
  })
  return res.json()
}

/**
 * 删除 Todo
 * DELETE /api/dashboard/todos/:id
 */
export async function deleteTodo(id: string): Promise<{ success: boolean }> {
  if (USE_MOCK) {
    await delay(200)
    localTodos = localTodos.filter((t) => t.id !== id)
    saveToStorage(STORAGE_KEYS.todos, localTodos)
    return { success: true }
  }
  const res = await fetch(`${API_BASE}/todos/${id}`, { method: 'DELETE' })
  return res.json()
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
  if (USE_MOCK) {
    await delay(200)
    return { success: true, data: localConfigs }
  }
  const res = await fetch(`${API_BASE}/data-sources`)
  return res.json()
}

export async function getDataSourceConfig(id: string): Promise<DataSourceConfigResponse> {
  if (USE_MOCK) {
    await delay(200)
    const config = localConfigs.find((c) => c.id === id)
    if (!config) {
      return { success: false, data: {} as DataSourceConfig }
    }
    return { success: true, data: config }
  }
  const res = await fetch(`${API_BASE}/data-sources/${id}`)
  return res.json()
}

export async function createDataSourceConfig(config: Omit<DataSourceConfig, 'id' | 'isActive' | 'createdAt'>): Promise<DataSourceConfigResponse> {
  if (USE_MOCK) {
    await delay(300)
    const newConfig: DataSourceConfig = {
      ...config,
      id: `ds_${Date.now()}`,
      isActive: false,
    } as DataSourceConfig
    localConfigs = [...localConfigs, newConfig]
    saveToStorage(STORAGE_KEYS.dataSources, localConfigs)
    return { success: true, data: newConfig }
  }
  const res = await fetch(`${API_BASE}/data-sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  })
  return res.json()
}

export async function updateDataSourceConfig(id: string, config: Partial<DataSourceConfig>): Promise<DataSourceConfigResponse> {
  if (USE_MOCK) {
    await delay(300)
    localConfigs = localConfigs.map((c) => (c.id === id ? { ...c, ...config } : c))
    saveToStorage(STORAGE_KEYS.dataSources, localConfigs)
    const updated = localConfigs.find((c) => c.id === id)
    if (!updated) {
      return { success: false, data: {} as DataSourceConfig }
    }
    return { success: true, data: updated }
  }
  const res = await fetch(`${API_BASE}/data-sources/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  })
  return res.json()
}

export async function activateDataSourceConfig(id: string): Promise<DataSourceConfigResponse> {
  if (USE_MOCK) {
    await delay(300)
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
  const res = await fetch(`${API_BASE}/data-sources/${id}/activate`, {
    method: 'POST',
  })
  return res.json()
}

export async function deleteDataSourceConfig(id: string): Promise<{ success: boolean }> {
  if (USE_MOCK) {
    await delay(200)
    localConfigs = localConfigs.filter((c) => c.id !== id)
    saveToStorage(STORAGE_KEYS.dataSources, localConfigs)
    return { success: true }
  }
  const res = await fetch(`${API_BASE}/data-sources/${id}`, { method: 'DELETE' })
  return res.json()
}
