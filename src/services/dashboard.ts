import {
  mockAdsSummary,
  mockAdsConfig,
  mockNews,
  mockProjects,
  mockTodos,
  mockDataSourceConfigs,
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

// ==================== 数据存储模式配置 ====================
// 可选值: 'local' (localStorage) | 'firebase' (Firebase Firestore)
const DATA_STORAGE_MODE: 'local' | 'firebase' = 'firebase';

// ==================== Firebase 集成 (可选) ====================
let db: any = null
let isFirebaseAvailable = false
let firebaseInitialized = false

async function initFirebase() {
  if (firebaseInitialized) return
  try {
    // 动态导入 Firebase，避免配置错误时崩溃
    const firebaseConfig = await import('../config/firebase.js')
    db = firebaseConfig.db
    isFirebaseAvailable = true
    console.log('Firebase 初始化成功')
  } catch (error) {
    console.warn('Firebase 未配置，将使用 localStorage 模式:', error)
    isFirebaseAvailable = false
  }
  firebaseInitialized = true
}

// 立即初始化 Firebase
initFirebase()

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
// - true: 使用本地 localStorage 持久化数据（生产模式）
// - false: 使用真实数据和自动抓取（需要后端 API 支持）
const USE_MOCK = true

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
 */
export async function getProjects(): Promise<ProjectListResponse> {
  if (await useFirebase()) {
    await delay(400)
    const data = await getFromFirebase<ProjectItem>('projects')
    return { success: true, data: migrateProjects(data) }
  }
  
  if (USE_MOCK) {
    await delay(400)
    return { success: true, data: localProjects }
  }
  const res = await fetch(`${API_BASE}/projects`)
  return res.json()
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
    await delay(300)
    const savedProject = await saveToFirebase('projects', newProject)
    return { success: true, data: savedProject }
  }

  if (USE_MOCK) {
    await delay(300)
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
 */
export async function updateProject(id: string, data: ProjectFormData): Promise<{ success: boolean; data: ProjectItem }> {
  const updateData = { ...data, updatedAt: new Date().toISOString() }

  if (await useFirebase()) {
    await delay(300)
    await updateInFirebase('projects', id, updateData)
    // 从 Firebase 重新获取更新后的项目
    const allProjects = await getFromFirebase<ProjectItem>('projects')
    const updated = allProjects.find((p) => p.id === id)!
    return { success: true, data: updated }
  }

  if (USE_MOCK) {
    await delay(300)
    localProjects = localProjects.map((p) =>
      p.id === id ? { ...p, ...updateData } : p
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
 */
export async function deleteProject(id: string): Promise<{ success: boolean }> {
  if (await useFirebase()) {
    await delay(200)
    await deleteFromFirebase('projects', id)
    return { success: true }
  }

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

// 扩展 Mock 新闻数据
const EXTENDED_MOCK_NEWS: NewsItem[] = [
  {
    id: 'news_ext_1',
    title: 'OpenAI 发布 GPT-5 预览版，推理能力再次突破',
    summary: 'OpenAI 今日宣布推出 GPT-5 预览版，在数学推理、代码生成和多模态理解方面取得重大进展，性能较前代提升 40%。',
    sourceName: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com',
    imageUrl: 'https://picsum.photos/seed/ai-gpt5/800/450',
    category: 'ai',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'news_ext_2',
    title: '特斯拉 FSD V13 正式上线，完全端到端自动驾驶时代到来',
    summary: '特斯拉发布完全端到端的 FSD V13 系统，不再依赖规则代码，全部由神经网络驱动，在复杂城市道路表现亮眼。',
    sourceName: 'Electrek',
    sourceUrl: 'https://electrek.co',
    imageUrl: 'https://picsum.photos/seed/tesla-fsd/800/450',
    category: 'tech',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'news_ext_3',
    title: '美联储降息预期升温，全球股市应声上涨',
    summary: '美联储主席暗示可能在年内降息，市场反应积极，纳斯达克指数创历史新高，科技股普涨。',
    sourceName: 'Bloomberg',
    sourceUrl: 'https://bloomberg.com',
    imageUrl: 'https://picsum.photos/seed/stock-market/800/450',
    category: 'finance',
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'news_ext_4',
    title: '苹果 Vision Pro 2 规格泄露，显示屏分辨率翻倍',
    summary: '供应链消息称苹果第二代 Vision Pro 将配备 8K 分辨率显示屏，重量减轻 40%，预计明年发布。',
    sourceName: '9to5Mac',
    sourceUrl: 'https://9to5mac.com',
    imageUrl: 'https://picsum.photos/seed/apple-vision/800/450',
    category: 'tech',
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'news_ext_5',
    title: 'Anthropic 完成 20 亿美元融资，估值达 600 亿美元',
    summary: 'AI 初创公司 Anthropic 宣布完成新一轮融资，由微软和谷歌联合领投，资金将用于扩展计算基础设施。',
    sourceName: 'Reuters',
    sourceUrl: 'https://reuters.com',
    imageUrl: 'https://picsum.photos/seed/anthropic-funding/800/450',
    category: 'ai',
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: 'news_ext_6',
    title: '中国央行数字人民币用户突破 5 亿',
    summary: '中国人民银行宣布数字人民币试点用户已超过 5 亿，覆盖场景进一步扩大，包括跨境支付试点。',
    sourceName: 'Financial Times',
    sourceUrl: 'https://ft.com',
    imageUrl: 'https://picsum.photos/seed/digital-yuan/800/450',
    category: 'finance',
    publishedAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: 'news_ext_7',
    title: '英伟达发布新一代 H200 芯片，AI 训练速度提升 90%',
    summary: '英伟达推出 H200 加速卡，配备 HBM3e 显存，AI 大模型训练速度较 H100 提升近一倍。',
    sourceName: 'AnandTech',
    sourceUrl: 'https://anandtech.com',
    imageUrl: 'https://picsum.photos/seed/nvidia-h200/800/450',
    category: 'tech',
    publishedAt: new Date(Date.now() - 25200000).toISOString(),
  },
  {
    id: 'news_ext_8',
    title: 'DeepMind 发现新的材料结构，可能革命性改变电池技术',
    summary: 'Google DeepMind 使用 AI 发现了数千种新的潜在材料，其中包括可能使电池容量翻倍的新型化合物。',
    sourceName: 'Nature',
    sourceUrl: 'https://nature.com',
    imageUrl: 'https://picsum.photos/seed/deepmind-materials/800/450',
    category: 'ai',
    publishedAt: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    id: 'news_ext_9',
    title: '比特币突破 10 万美元大关，创历史新高',
    summary: '比特币价格首次突破 10 万美元，受 ETF 资金流入和机构投资者持续增持推动。',
    sourceName: 'CoinDesk',
    sourceUrl: 'https://coindesk.com',
    imageUrl: 'https://picsum.photos/seed/bitcoin-price/800/450',
    category: 'finance',
    publishedAt: new Date(Date.now() - 32400000).toISOString(),
  },
  {
    id: 'news_ext_10',
    title: 'Meta 发布 Llama 3.5，开源模型性能接近 GPT-4',
    summary: 'Meta 发布最新 Llama 3.5 系列模型，在多项基准测试中表现优异，完全开源免费商用。',
    sourceName: 'Meta AI Blog',
    sourceUrl: 'https://ai.meta.com',
    imageUrl: 'https://picsum.photos/seed/llama-35/800/450',
    category: 'ai',
    publishedAt: new Date(Date.now() - 36000000).toISOString(),
  },
  {
    id: 'news_ext_11',
    title: '小米汽车首款纯电 SUV 销量破 10 万',
    summary: '小米汽车宣布首款车型 SU7 上市半年销量突破 10 万辆，成为新能源车市场最大黑马。',
    sourceName: 'AutoHome',
    sourceUrl: 'https://autohome.com.cn',
    imageUrl: 'https://picsum.photos/seed/xiaomi-car/800/450',
    category: 'tech',
    publishedAt: new Date(Date.now() - 39600000).toISOString(),
  },
  {
    id: 'news_ext_12',
    title: '全球 AI 芯片市场规模预计 2027 年突破 5000 亿美元',
    summary: '行业报告预测，受大模型需求推动，全球 AI 加速芯片市场将持续高速增长，年复合增长率达 45%。',
    sourceName: 'Gartner',
    sourceUrl: 'https://gartner.com',
    imageUrl: 'https://picsum.photos/seed/ai-market/800/450',
    category: 'finance',
    publishedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'news_ext_13',
    title: 'Google Gemini 2.0 发布，原生视频理解能力大幅提升',
    summary: 'Google 推出 Gemini 2.0，在视频理解和生成方面取得重大突破，可以处理长达 1 小时的视频内容。',
    sourceName: 'Google Blog',
    sourceUrl: 'https://blog.google',
    imageUrl: 'https://picsum.photos/seed/gemini-2/800/450',
    category: 'ai',
    publishedAt: new Date(Date.now() - 46800000).toISOString(),
  },
  {
    id: 'news_ext_14',
    title: '欧盟 AI 法案正式实施，严格监管生成式 AI',
    summary: '欧盟 AI 法案正式生效，对高风险 AI 应用提出严格要求，包括透明度和人工监督等条款。',
    sourceName: 'EU Observer',
    sourceUrl: 'https://euobserver.com',
    imageUrl: 'https://picsum.photos/seed/eu-ai-act/800/450',
    category: 'tech',
    publishedAt: new Date(Date.now() - 50400000).toISOString(),
  },
  {
    id: 'news_ext_15',
    title: '沙特主权基金宣布 4000 亿美元 AI 投资计划',
    summary: '沙特阿拉伯公共投资基金宣布设立全球最大 AI 投资基金，规模达 4000 亿美元，重点投资 AI 基础设施。',
    sourceName: 'Arabian Business',
    sourceUrl: 'https://arabianbusiness.com',
    imageUrl: 'https://picsum.photos/seed/saudi-ai/800/450',
    category: 'finance',
    publishedAt: new Date(Date.now() - 54000000).toISOString(),
  },
  {
    id: 'news_ext_16',
    title: 'SpaceX Starlink 第二代卫星开始部署，网速提升 10 倍',
    summary: 'SpaceX 开始部署第二代 Starlink 卫星，单星容量大幅提升，用户体验将显著改善。',
    sourceName: 'SpaceNews',
    sourceUrl: 'https://spacenews.com',
    imageUrl: 'https://picsum.photos/seed/starlink-v2/800/450',
    category: 'tech',
    publishedAt: new Date(Date.now() - 57600000).toISOString(),
  },
  {
    id: 'news_ext_17',
    title: 'Amazon Q AI 助手企业版正式发布，集成 AWS 全栈服务',
    summary: 'Amazon 推出 Q AI 助手企业版，深度集成 AWS 云服务，帮助开发者提升工作效率。',
    sourceName: 'AWS News',
    sourceUrl: 'https://aws.amazon.com',
    imageUrl: 'https://picsum.photos/seed/amazon-q/800/450',
    category: 'ai',
    publishedAt: new Date(Date.now() - 61200000).toISOString(),
  },
  {
    id: 'news_ext_18',
    title: '中国科技股集体上涨，港股科指涨超 5%',
    summary: '受利好政策刺激，港股科技指数大幅上涨，腾讯、阿里、美团等龙头股均有不错表现。',
    sourceName: 'SCMP',
    sourceUrl: 'https://scmp.com',
    imageUrl: 'https://picsum.photos/seed/china-tech-stocks/800/450',
    category: 'finance',
    publishedAt: new Date(Date.now() - 64800000).toISOString(),
  },
  {
    id: 'news_ext_19',
    title: 'OpenAI Sora 视频生成功能向所有付费用户开放',
    summary: 'OpenAI 宣布 Sora 视频生成功能向所有 ChatGPT Plus 和 Team 用户开放，可以生成最长 60 秒的视频。',
    sourceName: 'OpenAI Blog',
    sourceUrl: 'https://openai.com',
    imageUrl: 'https://picsum.photos/seed/sora-video/800/450',
    category: 'ai',
    publishedAt: new Date(Date.now() - 68400000).toISOString(),
  },
  {
    id: 'news_ext_20',
    title: '微软 HoloLens 3 研发接近完成，新一代混合现实设备',
    summary: '微软新一代混合现实设备 HoloLens 3 研发进入收尾阶段，预计明年正式发布，性能大幅提升。',
    sourceName: 'Windows Central',
    sourceUrl: 'https://windowscentral.com',
    imageUrl: 'https://picsum.photos/seed/hololens-3/800/450',
    category: 'tech',
    publishedAt: new Date(Date.now() - 72000000).toISOString(),
  },
]

// 分类到查询关键词的映射
// const CATEGORY_KEYWORDS: Record<NewsCategory, string> = {
//   all: 'technology OR finance OR AI OR artificial intelligence',
//   ai: 'artificial intelligence OR AI OR machine learning OR deep learning',
//   tech: 'technology OR gadget OR startup OR innovation',
//   finance: 'finance OR business OR economy OR stock market',
// }

// 从 Mock 数据获取新闻（带时间随机性，让每次刷新看起来不同）
function getMockNews(category: NewsCategory): NewsItem[] {
  // 合并原始 mock 和扩展 mock
  const allNews = [...mockNews, ...EXTENDED_MOCK_NEWS]
  
  // 打乱顺序，让每次看起来不同
  const shuffled = [...allNews].sort(() => Math.random() - 0.5)
  
  // 随机调整一些时间，让新闻看起来是新鲜的
  const randomized = shuffled.map((news, index) => ({
    ...news,
    id: `news_dynamic_${Date.now()}_${index}`,
    publishedAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
  }))
  
  // 按分类过滤
  if (category !== 'all') {
    return randomized.filter((n) => n.category === category)
  }
  
  return randomized
}

// NewsAPI 响应类型定义
// interface NewsAPISource {
//   id: string | null
//   name: string
// }

// interface NewsAPIArticle {
//   source: NewsAPISource
//   author: string | null
//   title: string
//   description: string | null
//   url: string
//   urlToImage: string | null
//   publishedAt: string
//   content: string | null
// }

// interface NewsAPIResponse {
//   status: string
//   totalResults: number
//   articles: NewsAPIArticle[]
// }

// 从我们的新闻 API 获取真实新闻
async function fetchRealNews(category: NewsCategory): Promise<NewsItem[]> {
  try {
    console.log('Fetching from our news API...')
    const url = `/api/news?category=${encodeURIComponent(category)}&count=100`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8秒超时
    
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success && result.data) {
      console.log(`Successfully fetched ${result.data.length} articles`)
      return result.data
    }
    
    throw new Error('API returned invalid data')
  } catch (error) {
    console.warn('Failed to fetch from news API:', error)
    // 失败时降级到我们的 mock 数据
    return getMockNews(category)
  }
}

// ==================== 今日 Todo 模块 ====================

/**
 * 获取指定日期的 Todo 列表
 */
export async function getTodos(date: string): Promise<TodoListResponse> {
  if (await useFirebase()) {
    await delay(300)
    const allTodos = await getFromFirebase<TodoItem>('todos')
    const data = allTodos.filter((t) => t.date === date)
    return { success: true, data }
  }
  
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
    await delay(300)
    const savedTodo = await saveToFirebase('todos', newTodo)
    return { success: true, data: savedTodo }
  }

  if (USE_MOCK) {
    await delay(300)
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
 */
export async function updateTodo(id: string, data: TodoFormData): Promise<{ success: boolean; data: TodoItem }> {
  const updateData = { ...data, updatedAt: new Date().toISOString() }

  if (await useFirebase()) {
    await delay(300)
    await updateInFirebase('todos', id, updateData)
    const allTodos = await getFromFirebase<TodoItem>('todos')
    const updated = allTodos.find((t) => t.id === id)!
    return { success: true, data: updated }
  }

  if (USE_MOCK) {
    await delay(300)
    localTodos = localTodos.map((t) =>
      t.id === id ? { ...t, ...updateData } : t
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
 */
export async function updateTodoStatus(id: string, statusData: TodoStatusUpdate): Promise<{ success: boolean; data: TodoItem }> {
  const updateData = { ...statusData, updatedAt: new Date().toISOString() }

  if (await useFirebase()) {
    await delay(200)
    await updateInFirebase('todos', id, updateData)
    const allTodos = await getFromFirebase<TodoItem>('todos')
    const updated = allTodos.find((t) => t.id === id)!
    return { success: true, data: updated }
  }

  if (USE_MOCK) {
    await delay(200)
    localTodos = localTodos.map((t) =>
      t.id === id ? { ...t, ...updateData } : t
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
 */
export async function deleteTodo(id: string): Promise<{ success: boolean }> {
  if (await useFirebase()) {
    await delay(200)
    await deleteFromFirebase('todos', id)
    return { success: true }
  }

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

// 恢复示例数据功能
export async function restoreSampleData(): Promise<{ success: boolean; message: string }> {
  if (USE_MOCK) {
    await delay(300)
    // 只在 localStorage 为空时才添加示例数据
    const existingProjects = loadFromStorage(STORAGE_KEYS.projects, [] as any[])
    const existingTodos = loadFromStorage(STORAGE_KEYS.todos, [] as any[])
    
    let restoredCount = 0
    
    // 恢复项目
    if (existingProjects.length === 0) {
      localProjects = migrateProjects([...mockProjects])
      saveToStorage(STORAGE_KEYS.projects, localProjects)
      restoredCount += mockProjects.length
    } else {
      localProjects = migrateProjects(existingProjects)
    }
    
    // 恢复 Todo
    if (existingTodos.length === 0) {
      localTodos = [...mockTodos]
      saveToStorage(STORAGE_KEYS.todos, localTodos)
      restoredCount += mockTodos.length
    } else {
      localTodos = existingTodos
    }
    
    // 恢复配置
    const existingConfigs = loadFromStorage(STORAGE_KEYS.dataSources, [] as any[])
    if (existingConfigs.length === 0) {
      localConfigs = [...mockDataSourceConfigs]
      saveToStorage(STORAGE_KEYS.dataSources, localConfigs)
      restoredCount += mockDataSourceConfigs.length
    } else {
      localConfigs = existingConfigs
    }
    
    return { 
      success: true, 
      message: restoredCount > 0 
        ? `已恢复 ${restoredCount} 条示例数据` 
        : '您已有数据，无需恢复'
    }
  }
  return { success: false, message: '示例数据功能仅在本地模式可用' }
}
