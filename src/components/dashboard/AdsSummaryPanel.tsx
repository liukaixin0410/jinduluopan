import { useCallback, useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Sparkles, Lightbulb, Settings, RefreshCw, ExternalLink } from 'lucide-react'
import { Card, Skeleton, ErrorState, Badge, Button } from './shared/Card'
import { Modal } from './shared/Modal'
import { getAdsSummary, getAdsConfig } from '../../services/dashboard'

type TrendType = 'up' | 'down' | 'stable'

interface MetricItem {
  key: string
  label: string
  displayValue: string
  changeDisplay: string
  trend: TrendType
}

interface DataTableRow {
  channel: string
  cost: number
  impression: number
  click: number
  ctr: number
  conversion: number
  roi: number
  conversionCost: number
}

interface AimeSuggestion {
  title: string
  description: string
}

interface DataRefinementSection {
  title: string
  items: Array<{
    label: string
    value: string
    percentage: number
    trend: TrendType
    changeDisplay: string
  }>
  tone: 'success' | 'warning'
}

interface InsightItem {
  title: string
  impact: 'high' | 'medium' | 'low'
  description: string
  recommendation?: string
}

interface AdsSummaryData {
  date: string
  metrics: MetricItem[]
  summary: string
  hasFengshenDashboard: boolean
  fengshenUrl: string
  syncTime: string
  sourceName: string
  updatedAt: string
  hasDataTable: boolean
  dataTableData: DataTableRow[]
  hasDataRefinement: boolean
  keyMetrics: MetricItem[]
  topPerformers: DataRefinementSection['items']
  weakPoints: DataRefinementSection['items']
  insights: InsightItem[]
  hasAimeAnalysis: boolean
  aimeScore: number
  aimeTrend: TrendType
  suggestions: AimeSuggestion[]
  optimizations: Array<{ name: string; expectedImprovement: string; priority: 'high' | 'medium' | 'low' }>
}

interface DataSourceConfig {
  id: string
  name: string
  type: string
  isActive: boolean
  hasFengshenDashboard: boolean
  hasDataTable: boolean
  hasAimeAnalysis: boolean
  channels: string[]
  syncInterval?: number
}



/* ===========================================================
   Trend icons & utilities
   =========================================================== */
function getTrendIcon(trend: TrendType) {
  const icons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  }
  return icons[trend]
}

function getTrendColor(trend: TrendType) {
  return {
    up: 'text-emerald-600',
    down: 'text-red-600',
    stable: 'text-slate-500',
  }[trend]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/* ===========================================================
   Metric Card
   =========================================================== */
function MetricCard({ metric }: { metric: MetricItem }) {
  const Icon = getTrendIcon(metric.trend)
  return (
    <div className="group p-4 rounded-2xl bg-slate-50/60 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all duration-300">
      <p className="text-xs text-slate-500 font-medium">{metric.label}</p>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <p className="text-xl font-bold text-slate-900 tracking-tight">{metric.displayValue}</p>
        <div className={`flex items-center gap-0.5 text-xs font-semibold ${getTrendColor(metric.trend)}`}>
          <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span>{metric.changeDisplay}</span>
        </div>
      </div>
    </div>
  )
}

/* ===========================================================
   Summary Panel
   =========================================================== */
function SummaryPanel({ summary }: { summary: string }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100/60 p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 flex-shrink-0">
          <Sparkles className="w-4.5 h-4.5" strokeWidth={2} />
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
      </div>
    </div>
  )
}

/* ===========================================================
   Data Table
   =========================================================== */
function DataTable({ data }: { data: DataTableRow[] }) {
  const columns = [
    { key: 'channel' as const, label: '渠道', align: 'left' as const },
    { key: 'cost' as const, label: '消耗', format: (v: number) => `¥${(v / 1000).toFixed(1)}K`, align: 'right' as const },
    { key: 'impression' as const, label: '展现', format: (v: number) => `${(v / 10000).toFixed(1)}万`, align: 'right' as const },
    { key: 'click' as const, label: '点击', format: (v: number) => `${(v / 1000).toFixed(1)}K`, align: 'right' as const },
    { key: 'ctr' as const, label: 'CTR', format: (v: number) => `${v.toFixed(1)}%`, align: 'right' as const },
    { key: 'conversion' as const, label: '转化', format: (v: number) => v.toString(), align: 'right' as const },
    { key: 'roi' as const, label: 'ROI', format: (v: number) => v.toFixed(2), highlight: true, align: 'right' as const },
    { key: 'conversionCost' as const, label: '转化成本', format: (v: number) => `¥${v.toFixed(0)}`, align: 'right' as const },
  ]

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                {columns.map((col) => {
                  const value = row[col.key]
                  const formatted = col.format ? col.format(value as number) : value
                  const isHighlight = (col as any).highlight
                  return (
                    <td
                      key={col.key}
                      className={`px-4 py-3 whitespace-nowrap ${
                        col.align === 'right' ? 'text-right' : 'text-left'
                      } ${
                        col.key === 'channel' ? 'font-semibold text-slate-900' : 'text-slate-600'
                      } ${isHighlight ? 'text-primary-700 font-semibold' : ''}`}
                    >
                      {formatted}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ===========================================================
   Refinement Section - Top Performers & Weak Points
   =========================================================== */
function RefinementBlock({
  title,
  items,
  tone,
}: {
  title: string
  items: DataRefinementSection['items']
  tone: 'success' | 'warning'
}) {
  const bgGradient = tone === 'success'
    ? 'from-emerald-50 to-teal-50 border-emerald-100/60'
    : 'from-amber-50 to-orange-50 border-amber-100/60'
  const barFill = tone === 'success' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'
  const barTrack = tone === 'success' ? 'bg-emerald-100/60' : 'bg-amber-100/60'
  const Icon = tone === 'success' ? TrendingUp : TrendingDown

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${bgGradient} border p-5`}>
      <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Icon className={`w-4 h-4 ${tone === 'success' ? 'text-emerald-600' : 'text-amber-600'}`} strokeWidth={2.5} />
        {title}
      </h4>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2 gap-4">
              <div className="min-w-0 flex-1">
                <h5 className="text-sm font-semibold text-slate-900 truncate">{item.label}</h5>
                <p className="text-xs text-slate-500 mt-0.5">贡献占比 · {item.percentage}%</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold whitespace-nowrap ${getTrendColor(item.trend)}`}>
                <Icon className="w-3 h-3" strokeWidth={2.5} />
                {item.changeDisplay}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex-1 ${barTrack} rounded-full h-1.5 overflow-hidden`}>
                <div className={`${barFill} h-full rounded-full transition-all duration-700`} style={{ width: `${item.percentage}%` }} />
              </div>
              <span className="text-sm font-bold text-slate-700 whitespace-nowrap">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===========================================================
   Insights Section
   =========================================================== */
function InsightsSection({ insights }: { insights: InsightItem[] }) {
  const impactConfig = {
    high: { label: '高影响', badge: 'bg-red-100 text-red-700 border-red-200', leftBar: 'border-l-red-300 bg-red-50/40' },
    medium: { label: '中影响', badge: 'bg-amber-100 text-amber-700 border-amber-200', leftBar: 'border-l-amber-300 bg-amber-50/40' },
    low: { label: '低影响', badge: 'bg-slate-100 text-slate-600 border-slate-200', leftBar: 'border-l-slate-300 bg-slate-50/40' },
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5">
      <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-500" strokeWidth={2} fill="currentColor" />
        归因洞察 · 深度分析
      </h4>
      <div className="space-y-3">
        {insights.map((insight, idx) => {
          const config = impactConfig[insight.impact]
          return (
            <div
              key={idx}
              className={`rounded-xl border border-slate-200 ${config.leftBar} border-l-4 p-4`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h5 className="text-sm font-semibold text-slate-900 leading-tight">{insight.title}</h5>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${config.badge} whitespace-nowrap`}>
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{insight.description}</p>
              {insight.recommendation && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50/80 border border-slate-100 p-3">
                  <div className="w-6 h-6 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">→</span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">{insight.recommendation}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ===========================================================
   AIME Analysis
   =========================================================== */
function AimeAnalysis({ score, trend, suggestions, optimizations }: {
  score: number
  trend: TrendType
  suggestions: AimeSuggestion[]
  optimizations: AdsSummaryData['optimizations']
}) {
  const TrendIcon = getTrendIcon(trend)
  const priorityConfig = {
    high: { label: '高优先', color: 'bg-red-100 text-red-700 border-red-200' },
    medium: { label: '中优先', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    low: { label: '低优先', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-50 via-white to-primary-50 border border-accent-100/60 p-6">
      {/* Decorative */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-200/40 rounded-full blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center text-white shadow-lg shadow-accent-500/30">
              <Sparkles className="w-5 h-5" strokeWidth={2} fill="currentColor" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-base">AIME 智能解读</h4>
              <p className="text-xs text-slate-500 mt-0.5">基于风神数据 · 实时生成</p>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-accent-100 shadow-sm">
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-accent-600 tracking-tight">{score}</span>
                <span className="text-sm text-slate-400 font-medium">/ 100</span>
              </div>
              <div className={`flex items-center gap-1 justify-end text-xs font-semibold ${getTrendColor(trend)}`}>
                <TrendIcon className="w-3 h-3" strokeWidth={2.5} />
                <span>预期上升</span>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mb-5">
          <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">智能建议</h5>
          <ul className="space-y-2">
            {suggestions.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="flex-shrink-0 w-5 h-5 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <span className="font-medium text-slate-900">{s.title}</span>
                  <span className="text-slate-500"> — {s.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Optimizations */}
        <div>
          <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">优化方案</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {optimizations.map((opt, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3 rounded-xl bg-white border border-slate-100 p-3 hover:border-slate-200 transition-colors">
                <div className="min-w-0">
                  <h6 className="text-sm font-semibold text-slate-900 leading-tight">{opt.name}</h6>
                  <p className="text-xs text-slate-500 mt-0.5">{opt.expectedImprovement}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${priorityConfig[opt.priority].color}`}>
                  {priorityConfig[opt.priority].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===========================================================
   Config Modal
   =========================================================== */
function ConfigModal({
  isOpen,
  onClose,
  onSave,
  configs,
  currentConfig,
  selectedConfigId,
  setSelectedConfigId,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  configs: DataSourceConfig[]
  currentConfig: DataSourceConfig | null
  selectedConfigId: string
  setSelectedConfigId: (id: string) => void
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="数据源配置"
      description="选择一个数据源，保存后自动刷新数据"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={onSave} disabled={!selectedConfigId}>保存配置</Button>
        </>
      }
    >
      <div className="space-y-4">
        {currentConfig && (
          <div className="rounded-2xl bg-primary-50 border border-primary-100 p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-primary-500/30">
                <span className="text-sm font-bold">✓</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900">当前数据源</h4>
                <p className="text-sm text-slate-600 mt-0.5">{currentConfig.name}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {currentConfig.hasFengshenDashboard && <Badge color="blue">风神看板</Badge>}
                  {currentConfig.hasDataTable && <Badge color="green">数据明细</Badge>}
                  {currentConfig.hasAimeAnalysis && <Badge color="purple">AI 分析</Badge>}
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-2">选择数据源</h4>
          <div className="space-y-2">
            {configs.map((config) => {
              const isSelected = selectedConfigId === config.id
              return (
                <div
                  key={config.id}
                  onClick={() => setSelectedConfigId(config.id)}
                  className={`border rounded-2xl p-4 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50/40 ring-2 ring-primary-500/20 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <input
                        type="radio"
                        name="dataSource"
                        checked={isSelected}
                        onChange={() => setSelectedConfigId(config.id)}
                        className="mt-1 text-primary-600 focus:ring-primary-500 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-sm font-semibold text-slate-900">{config.name}</h5>
                          {config.isActive && <Badge color="green">当前使用</Badge>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          类型: {config.type === 'fengshen' ? '风神看板' : config.type === 'api' ? '自定义 API' : '演示数据'}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {config.channels.slice(0, 4).map((ch, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {ch}
                            </span>
                          ))}
                          {config.channels.length > 4 && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                              +{config.channels.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
                      {config.hasFengshenDashboard && <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />}
                      {config.hasDataTable && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      {config.hasAimeAnalysis && <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />}
                    </div>
                  </div>
                  {config.syncInterval && (
                    <p className="text-xs text-slate-400 mt-2 ml-7">
                      同步间隔: {Math.floor(config.syncInterval / 60)} 分钟
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-amber-50/60 border border-amber-200 p-4">
          <p className="text-sm text-amber-800 font-medium mb-1">💡 配置说明</p>
          <ul className="text-xs text-amber-700 space-y-1 mt-1">
            <li>• 选择数据源后点击"保存配置"生效</li>
            <li>• 保存后自动刷新页面数据</li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

/* ===========================================================
   Main Component
   =========================================================== */
export function AdsSummaryPanel() {
  const [data, setData] = useState<AdsSummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [configs, setConfigs] = useState<DataSourceConfig[]>([])
  const [currentConfig, setCurrentConfig] = useState<DataSourceConfig | null>(null)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [selectedConfigId, setSelectedConfigId] = useState<string>('')

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const [summaryRes, configRes] = await Promise.all([
        getAdsSummary(),
        getAdsConfig(),
      ])

      if (summaryRes && summaryRes.success && summaryRes.data) {
        setData(summaryRes.data as unknown as AdsSummaryData)
      } else {
        setData(null)
      }

      if (configRes && configRes.success && configRes.data) {
        const cfgData = configRes.data as any
        const list: DataSourceConfig[] = Array.isArray(cfgData.availableConfigs) && cfgData.availableConfigs.length > 0
          ? cfgData.availableConfigs
          : (cfgData.currentConfig ? [cfgData.currentConfig] : [])
        setConfigs(list)
        const activeCfg = list.find((c) => c.isActive) || list[0] || null
        setCurrentConfig(activeCfg)
        if (activeCfg) setSelectedConfigId(activeCfg.id)
      }
    } catch (err) {
      setData(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveConfig = () => {
    const cfg = configs.find((c) => c.id === selectedConfigId)
    if (cfg) {
      setCurrentConfig(cfg)
      loadData(true)
    }
    setConfigModalOpen(false)
  }

  return (
    <>
      <Card
        title="投流数据播报"
        subtitle={data ? `数据日期 · ${data.date}` : ''}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfigModalOpen(true)}
            >
              <Settings className="w-3.5 h-3.5" strokeWidth={2} />
              配置
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => loadData(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={2} />
              刷新
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
            <Skeleton className="h-24" />
            <Skeleton className="h-64" />
          </div>
        ) : !data ? (
          <ErrorState onRetry={() => loadData(true)} />
        ) : (
          <div className="space-y-5">
            {/* Connection banner */}
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100/50 p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 flex-shrink-0">
                  <ExternalLink className="w-4 h-4" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-slate-900">{data.sourceName}</h4>
                    <Badge color="green">已同步</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">数据同步 · {data.syncTime}</p>
                </div>
              </div>
            </div>

            {/* Fengshen Dashboard Embed */}
            {data.fengshenUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 truncate">实时风神看板</h3>
                  </div>
                  <a
                    href={data.fengshenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1 flex-shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                    在新窗口打开
                  </a>
                </div>
                <div className="relative" style={{ height: '600px' }}>
                  <iframe
                    src={data.fengshenUrl}
                    className="w-full h-full border-0"
                    style={{ minHeight: '600px' }}
                    title="风神投流看板"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                  />
                  <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 bg-white/70 px-2 py-0.5 rounded backdrop-blur-sm">
                    需登录字节 SSO 账号查看
                  </div>
                </div>
              </div>
            )}

            {/* Metrics Grid */}
            {data.metrics && data.metrics.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">关键指标</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.metrics.map((metric) => (
                    <MetricCard key={metric.key} metric={metric} />
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <SummaryPanel summary={data.summary} />

            {/* Data Table */}
            {data.hasDataTable && data.dataTableData && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">渠道数据明细</h3>
                <DataTable data={data.dataTableData} />
              </div>
            )}

            {/* Data Refinement */}
            {data.hasDataRefinement && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700">数据提炼 · 深度洞察</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">核心指标</h4>
                    <div className="space-y-2">
                      {data.keyMetrics.map((m, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white border border-slate-200">
                          <p className="text-xs text-slate-500">{m.label}</p>
                          <div className="flex items-baseline justify-between gap-2 mt-1">
                            <span className="text-lg font-bold text-slate-900">{m.displayValue}</span>
                            <div className={`flex items-center gap-0.5 text-xs font-semibold ${getTrendColor(m.trend)}`}>
                              {m.changeDisplay}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <RefinementBlock
                      title="优质渠道 · Top 表现"
                      items={data.topPerformers}
                      tone="success"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <RefinementBlock
                      title="待优化渠道 · 关注归因"
                      items={data.weakPoints}
                      tone="warning"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Insights */}
            {data.hasDataRefinement && data.insights && (
              <InsightsSection insights={data.insights} />
            )}

            {/* AIME Analysis */}
            {data.hasAimeAnalysis && (
              <AimeAnalysis
                score={data.aimeScore}
                trend={data.aimeTrend}
                suggestions={data.suggestions}
                optimizations={data.optimizations}
              />
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
              <span>数据源 · {data.sourceName}</span>
              <span>最后更新 · {formatDate(data.updatedAt)}</span>
            </div>
          </div>
        )}
      </Card>

      <ConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onSave={handleSaveConfig}
        configs={configs}
        currentConfig={currentConfig}
        selectedConfigId={selectedConfigId}
        setSelectedConfigId={setSelectedConfigId}
      />
    </>
  )
}
