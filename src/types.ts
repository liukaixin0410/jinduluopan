export type ItemStatus = 'pending' | 'in-progress' | 'confirm' | 'completed' | 'on-hold'

export interface Item {
  id: string
  title: string
  description: string
  status: ItemStatus
  priority: 'high' | 'medium' | 'low'
  deadline?: string
  source: string
  assignee: string
  latestProgress: string
  risks?: string
  createdAt: string
  updatedAt: string
}

export type ProgressStatus = 'on-track' | 'at-risk' | 'blocked' | 'completed' | 'new';
export type POCStatus = 'verified' | 'in-progress' | 'planned';

export interface Update {
  id: string;
  sourceType: 'document' | 'meeting' | 'chat' | 'external';
  time: string;
  summary: string;
  importance: 'high' | 'medium' | 'low';
  affectedObjects: string[];
  suggestedAction?: string;
  sourceLink?: string;
  
  // 新增加展面板字段
  title: string; // 进展标题
  status: ProgressStatus; // 进展状态
  pocStatus?: POCStatus; // POC验证状态
  lastUpdate: string; // 最后更新时间
  assignee?: string; // 负责人
  progress: number; // 进度百分比 0-100
  milestones: string[]; // 关键里程碑
  metrics?: { // 数据支撑
    label: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
  }[];
  relatedModules: string[]; // 关联模块
  docName?: string; // 文档名称
}

export interface Event {
  id: string
  title: string
  category: 'ai' | 'tech' | 'internet' | 'competitor' | 'policy'
  time: string
  summary: string
  sourceLink?: string
  source?: string
  sources?: string[] // 多个来源
  impactAnalysis?: string
  // 新增的高价值推荐字段
  oneLineSummary: string // 一句话概要
  aiComment: string // AI评论：这意味着什么
  reasonForRecommendation: string // 推荐原因：为什么值得用户看
  recommendationLevel: 'S' | 'A' | 'B' // 推荐等级：S=必须关注，A=建议关注，B=了解即可
  hotTags: string[] // 热度标签
  suggestedFocus: string[] // 建议关注点（数组形式）
  hotScore: number // 热度分数（用于排序）
  authoritativeScore: number // 权威度分数
  influenceScore: number // 影响力分数（用于排序）
  relevanceScore: number // 相关性分数（用于排序）
  timelinessScore: number // 时效性分数
  isFeatured?: boolean // 是否精选
  isHighHeat?: boolean // 是否高热
  isRelatedToMe?: boolean // 是否与我相关
  isFollowed?: boolean // 是否已关注
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// 团队动态数据源配置
export type DataSourceType = 'wiki' | 'doc' | 'docx'
export type SyncFrequency = 'daily' | 'weekly' | 'manual'
export type DataSourceStatus = 'enabled' | 'disabled'
export type SyncStatus = 'success' | 'failed' | 'pending' | 'syncing'

export interface DataSource {
  id: string
  name: string // 数据源名称
  link: string // 飞书链接
  type: DataSourceType // 数据源类型
  module: string // 归属模块，固定为 'team'
  topic?: string // 归属主题/项目
  frequency: SyncFrequency // 同步频率
  status: DataSourceStatus // 状态
  remark?: string // 备注
  lastSyncTime?: string // 最近同步时间
  lastSyncStatus?: SyncStatus // 最近同步状态
  lastSyncResult?: string // 最近同步结果
  createdAt: string // 创建时间
  updatedAt: string // 更新时间
}

export interface SyncLog {
  id: string
  dataSourceId: string
  startTime: string
  endTime: string
  status: SyncStatus
  hasChanges: boolean
  snapshotVersion: string
  parsedRecords: number
  errorMessage?: string
}
