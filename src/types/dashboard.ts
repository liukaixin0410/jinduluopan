export type TrendType = 'up' | 'down' | 'stable'

export interface MetricItem {
  key: string
  label: string
  value: number
  displayValue: string
  changeValue: number
  changeDisplay: string
  trend: TrendType
  unit: string
}

export interface DataDrillDownItem {
  key: string
  label: string
  value: number
  displayValue: string
  percentage: number
  trend: TrendType
  changeValue: number
  changeDisplay: string
}

export interface AttributionInsight {
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  relatedMetrics: string[]
  actionable: boolean
  recommendation?: string
}

export interface DataRefinement {
  keyMetrics: {
    label: string
    value: string
    trend: TrendType
  }[]
  topPerformers: DataDrillDownItem[]
  weakPoints: DataDrillDownItem[]
  insights: AttributionInsight[]
}

export interface AdsSummaryData {
  date: string
  sourceName: string
  metrics: MetricItem[]
  summary: string
  attributions: string[]
  hasFengshenDashboard: boolean
  hasDataTable: boolean
  hasAimeAnalysis: boolean
  hasDataRefinement: boolean
  dataTableData?: DataTableRow[]
  aimeAnalysis?: AimeAnalysisData
  dataRefinement?: DataRefinement
  // 同步相关字段
  syncStatus: 'synced' | 'syncing' | 'error'
  syncTime: string
  fengshenUrl: string
  updatedAt: string
}

export interface DataTableRow {
  channel: string
  cost: number
  impression: number
  click: number
  ctr: number
  conversion: number
  roi: number
  conversionCost: number
}

export interface AimeAnalysisData {
  overallScore: number
  suggestions: string[]
  optimizations: {
    name: string
    expectedImprovement: string
    priority: 'high' | 'medium' | 'low'
  }[]
  trendPrediction: 'up' | 'stable' | 'down'
}

export type DataSourceType = 'fengshen' | 'api' | 'mock'

export interface DataSourceConfig {
  id: string
  name: string
  type: DataSourceType
  apiUrl?: string
  apiKey?: string
  channels: string[]
  isActive: boolean
  hasFengshenDashboard: boolean
  hasDataTable: boolean
  hasAimeAnalysis: boolean
  syncInterval?: number
}

export interface AdsConfigData {
  configId: string
  sourceType: DataSourceType
  sourceName: string
  sourceUrl: string
  rangeType: string
  aiEnabled: boolean
  metricKeys: string[]
  currentConfig: DataSourceConfig
  availableConfigs: DataSourceConfig[]
}

export interface AdsSummaryResponse {
  success: boolean
  data: AdsSummaryData
  message?: string
}

export interface AdsConfigResponse {
  success: boolean
  data: AdsConfigData
}

export type ProjectStatus = 'not_started' | 'in_progress' | 'at_risk' | 'completed' | 'paused'

export interface ProjectItem {
  id: string
  name: string
  goal: string
  startDate: string
  endDate: string
  progress: number
  status: ProjectStatus
  priority: 'high' | 'medium' | 'low'
  currentTask: string
  collaborators: string[]
  detail: string
  updatedAt: string
  createdAt: string
}

export interface ProjectListResponse {
  success: boolean
  data: ProjectItem[]
}

export interface ProjectFormData {
  name: string
  goal: string
  startDate: string
  endDate: string
  progress: number
  status: ProjectStatus
  priority: 'high' | 'medium' | 'low'
  currentTask: string
  collaborators: string[]
  detail: string
}

export type NewsCategory = 'all' | 'ai' | 'tech' | 'finance'

export interface NewsItem {
  id: string
  title: string
  summary: string
  sourceName: string
  sourceUrl: string
  imageUrl: string
  category: 'ai' | 'tech' | 'finance'
  publishedAt: string
}

export interface NewsListResponse {
  success: boolean
  data: NewsItem[]
  error?: string
}

export type TodoPriority = 'high' | 'medium' | 'low'

export type TodoStatus = 'todo' | 'doing' | 'done'

export interface TodoItem {
  id: string
  date: string
  content: string
  priority: TodoPriority
  status: TodoStatus
  remark: string
  updatedAt: string
  createdAt: string
}

export interface TodoListResponse {
  success: boolean
  data: TodoItem[]
}

export interface TodoFormData {
  date: string
  content: string
  priority: TodoPriority
  status: TodoStatus
  remark: string
}

export interface TodoStatusUpdate {
  status: TodoStatus
}
