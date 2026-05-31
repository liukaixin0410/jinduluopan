import { useCallback, useEffect, useState } from 'react';
import {
  getAdsSummary,
  getDataSourceConfigs,
  activateDataSourceConfig,
} from '../../services/dashboard';
import type {
  AdsSummaryData,
  MetricItem,
  DataTableRow,
  AimeAnalysisData,
  DataSourceConfig,
  DataRefinement,
  TrendType,
} from '../../types/dashboard';
import { Card, ErrorState, Skeleton } from './shared/Card';
import { Modal } from './shared/Modal';
import { Button } from './shared/Card';
import { Badge } from './shared/Card';

interface MetricCardProps {
  metric: MetricItem;
}

function MetricCard({ metric }: MetricCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→',
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-500">{metric.label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-bold text-gray-900">{metric.displayValue}</p>
        <span className={`text-sm font-medium ${trendColors[metric.trend]} flex items-center gap-1`}>
          {trendIcons[metric.trend]}
          {metric.changeDisplay}
        </span>
      </div>
    </div>
  );
}

interface SummaryTextProps {
  summary: string;
}

function SummaryText({ summary }: SummaryTextProps) {
  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-700">{summary}</p>
      </div>
    </div>
  );
}

interface AttributionListProps {
  attributions: string[];
}

function AttributionList({ attributions }: AttributionListProps) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-3">归因分析</h4>
      <ul className="space-y-2">
        {attributions.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface DataTableProps {
  data: DataTableRow[];
}

function DataTable({ data }: DataTableProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                渠道
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                消耗
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                展现
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                点击
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                CTR
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                转化
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ROI
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                转化成本
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.channel}</td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                  {(row.cost / 1000).toFixed(2)}千
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                  {(row.impression / 10000).toFixed(1)}万
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                  {(row.click / 1000).toFixed(1)}千
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                  {row.ctr.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">{row.conversion}</td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right font-medium">
                  {row.roi.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                  {row.conversionCost.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface AimeAnalysisProps {
  analysis: AimeAnalysisData;
}

function AimeAnalysis({ analysis }: AimeAnalysisProps) {
  const priorityColors = {
    high: 'bg-red-50 text-red-700',
    medium: 'bg-yellow-50 text-yellow-700',
    low: 'bg-gray-50 text-gray-600',
  };

  const priorityLabels = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级',
  };

  const trendPredictionConfig = {
    up: { color: 'text-green-600', icon: '↑', label: '预计上升' },
    stable: { color: 'text-gray-600', icon: '→', label: '预计持平' },
    down: { color: 'text-red-600', icon: '↓', label: '预计下降' },
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">AIME 智能解读 · 基于风神数据</h4>
            <p className="text-xs text-gray-500">实时分析风神数据看板的归因结果</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-purple-600">{analysis.overallScore}</span>
                <span className="text-sm text-gray-500">/ 100</span>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${trendPredictionConfig[analysis.trendPrediction].color}`}>
                <span>{trendPredictionConfig[analysis.trendPrediction].icon}</span>
                <span>{trendPredictionConfig[analysis.trendPrediction].label}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">基于风神数据 · AI 实时生成</p>
        </div>
      </div>

      <div className="mb-5">
        <h5 className="text-sm font-medium text-gray-700 mb-3">智能建议</h5>
        <ul className="space-y-2">
          {analysis.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h5 className="text-sm font-medium text-gray-700 mb-3">优化方案</h5>
        <div className="space-y-3">
          {analysis.optimizations.map((opt, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-purple-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h6 className="text-sm font-medium text-gray-900">{opt.name}</h6>
                  <p className="text-xs text-gray-500 mt-1">{opt.expectedImprovement}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityColors[opt.priority]}`}>
                  {priorityLabels[opt.priority]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DataRefinementProps {
  dataRefinement: DataRefinement;
}

function DataRefinement({ dataRefinement }: DataRefinementProps) {
  const trendColors: Record<TrendType, string> = {
    up: 'text-green-600 bg-green-100',
    down: 'text-red-600 bg-red-100',
    stable: 'text-gray-600 bg-gray-100',
  };

  const impactColors: Record<'high' | 'medium' | 'low', string> = {
    high: 'border-l-red-300 bg-red-50',
    medium: 'border-l-yellow-300 bg-yellow-50',
    low: 'border-l-gray-300 bg-gray-50',
  };

  const impactLabels: Record<'high' | 'medium' | 'low', string> = {
    high: '高影响',
    medium: '中影响',
    low: '低影响',
  };

  return (
    <div className="space-y-6">
      {/* 关键指标概览 */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-5 border border-blue-100">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          数据提炼 · 关键指标
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dataRefinement.keyMetrics.map((metric, index: number) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${trendColors[metric.trend as TrendType]}`}>
                  {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 渠道表现分析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 优质渠道 */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            优质渠道 · 归因分析
          </h4>
          <div className="space-y-3">
            {dataRefinement.topPerformers.map((item, index: number) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="text-sm font-semibold text-gray-900">{item.label}</h5>
                    <p className="text-xs text-gray-500 mt-0.5">贡献占比：{item.percentage}%</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${trendColors[item.trend as TrendType]}`}>
                    {item.changeDisplay}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-green-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-green-700">{item.displayValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 待优化渠道 */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-5 border border-amber-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            待优化渠道 · 归因下钻
          </h4>
          <div className="space-y-3">
            {dataRefinement.weakPoints.map((item, index: number) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-amber-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="text-sm font-semibold text-gray-900">{item.label}</h5>
                    <p className="text-xs text-gray-500 mt-0.5">当前占比：{item.percentage}%</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${trendColors[item.trend as TrendType]}`}>
                    {item.changeDisplay}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-amber-100 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-amber-700">{item.displayValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 归因洞察 */}
      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          归因洞察 · 深度分析
        </h4>
        <div className="space-y-4">
          {dataRefinement.insights.map((insight, index: number) => (
            <div key={index} className={`rounded-lg p-4 border-l-4 ${impactColors[insight.impact as 'high' | 'medium' | 'low']}`}>
              <div className="flex items-start justify-between mb-2">
                <h5 className="text-sm font-semibold text-gray-900">{insight.title}</h5>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    insight.impact === 'high' ? 'bg-red-200 text-red-700' :
                    insight.impact === 'medium' ? 'bg-yellow-200 text-yellow-700' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {impactLabels[insight.impact as 'high' | 'medium' | 'low']}
                  </span>
                  {insight.actionable && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      可执行
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
              {insight.recommendation && (
                <div className="flex items-start gap-2 bg-white rounded-lg p-3 border border-gray-200">
                  <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <p className="text-sm text-gray-800 font-medium">{insight.recommendation}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {insight.relatedMetrics.map((metric: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {metric}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdsSummaryPanel() {
  const [data, setData] = useState<AdsSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configs, setConfigs] = useState<DataSourceConfig[]>([]);
  const [currentConfig, setCurrentConfig] = useState<DataSourceConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState<string>('');
  
  // 显示模式：custom = 自定义卡片，embed = 直接嵌入风神仪表盘
  const [displayMode, setDisplayMode] = useState<'custom' | 'embed'>('embed');
  
  // 当前选中的仪表盘类型
  const [dashboardType, setDashboardType] = useState<'daily' | 'weekly' | 'realtime'>('daily');
  
  // 三个风神仪表盘地址
  const DASHBOARD_URLS = {
    daily: 'https://data.bytedance.net/aeolus/pages/dashboard/1510451?appId=1128&sheetId=2112164&snapshotId=1184035',
    weekly: 'https://data.bytedance.net/aeolus/pages/dashboard/1627430?appId=1128&sheetId=2320850&snapshotId=1184827',
    realtime: 'https://data.bytedance.net/aeolus/pages/dashboard/1557333?appId=1002633&isDefault=1&sheetId=2196108&snapshotId=1184828'
  };

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(false);
      const res = await getAdsSummary();
      if (res.success) {
        setData(res.data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(true);
  };

  const openConfigModal = async () => {
    setConfigModalOpen(true);
    await loadConfigs();
  };

  const loadConfigs = async () => {
    setConfigLoading(true);
    try {
      const res = await getDataSourceConfigs();
      if (res.success) {
        setConfigs(res.data);
        const active = res.data.find((c) => c.isActive);
        if (active) {
          setCurrentConfig(active);
          setSelectedConfigId(active.id);
        }
      }
    } catch (err) {
      console.error('Failed to load configs:', err);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedConfigId) return;
    try {
      const res = await activateDataSourceConfig(selectedConfigId);
      if (res.success) {
        setCurrentConfig(res.data);
        await fetchData(true);
        setConfigModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to save config:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Card
        title="投流数据播报"
        subtitle={data && data.date ? '数据日期：' + data.date : ''}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {/* 仪表盘类型切换 */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setDashboardType('daily')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  dashboardType === 'daily'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                日报
              </button>
              <button
                onClick={() => setDashboardType('weekly')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  dashboardType === 'weekly'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                周报
              </button>
              <button
                onClick={() => setDashboardType('realtime')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  dashboardType === 'realtime'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                实时
              </button>
            </div>
            
            {/* 显示模式切换 */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setDisplayMode('custom')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  displayMode === 'custom'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                自定义卡片
              </button>
              <button
                onClick={() => setDisplayMode('embed')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  displayMode === 'embed'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                风神仪表盘
              </button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={openConfigModal}
              title="数据源配置"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              title="刷新数据"
            >
              <svg
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 6.239A9 9 0 004 12c0-1.263.23-2.479.659-3.603M4.582 9H4m11.418 7H20m-1.582 0a9 9 0 01-15.356-2.761M9.582 9H4m15.356 2.239L20 9h.582M11.418 16H4m1.582 0A9 9 0 0020 12c0-1.263-.23-2.479-.659-3.603"
                />
              </svg>
            </Button>
          </div>
        }
      >
        {displayMode === 'embed' ? (
          // 嵌入模式：风神仪表盘
          <div className="w-full">
            {/* 风神仪表盘 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">风神仪表盘</h3>
                  <p className="text-sm text-gray-500">实时数据看板</p>
                </div>
              </div>
              <div className="w-full h-[1200px] rounded-lg overflow-hidden border border-gray-200">
                <iframe
                  src={DASHBOARD_URLS[dashboardType]}
                  title={`风神${dashboardType === 'daily' ? '日报' : dashboardType === 'weekly' ? '周报' : '实时'}仪表盘`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="no-referrer"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
              <div className="mt-3 text-center text-sm text-gray-500">
                <p>如果仪表盘无法正常显示，请点击下方按钮在新窗口打开</p>
                <button
                  onClick={() => window.open(DASHBOARD_URLS[dashboardType], '_blank')}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                >
                  在新窗口打开{dashboardType === 'daily' ? '日报' : dashboardType === 'weekly' ? '周报' : '实时'}仪表盘
                </button>
              </div>
            </div>
          </div>
        ) : (
          // 自定义卡片模式
          loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
              <Skeleton className="h-24" />
              <Skeleton className="h-32" />
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
          ) : error ? (
            <ErrorState onRetry={handleRefresh} />
          ) : data ? (
            <div className="space-y-6">
              {data.hasFengshenDashboard && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">风神仪表盘</h4>
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          已同步
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">
                        数据与风神仪表盘同步 · {data.syncTime}
                      </p>
                    </div>
                    <button
                      onClick={() => window.open(DASHBOARD_URLS[dashboardType], '_blank')}
                      className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {data.metrics.map((metric) => (
                  <MetricCard key={metric.key} metric={metric} />
                ))}
              </div>

              <SummaryText summary={data.summary} />

              <AttributionList attributions={data.attributions} />

              {data.hasDataTable && data.dataTableData && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M9 4v6m6 0v6m6-6v6M3 16h18"
                      />
                    </svg>
                    渠道数据明细
                  </h4>
                  <DataTable data={data.dataTableData} />
                </div>
              )}

              {data.hasDataRefinement && data.dataRefinement && (
                <DataRefinement dataRefinement={data.dataRefinement} />
              )}

              {data.hasAimeAnalysis && data.aimeAnalysis && (
                <AimeAnalysis analysis={data.aimeAnalysis} />
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>数据来源：{data.sourceName}</span>
                </div>
                <span className="text-xs text-gray-400">最后更新：{formatDate(data.updatedAt)}</span>
              </div>
            </div>
          ) : null
        )}
      </Card>

      <Modal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        title="数据源配置"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setConfigModalOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveConfig}
              disabled={!selectedConfigId}
            >
              保存配置
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {currentConfig && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">当前数据源</h4>
                  <p className="text-sm text-gray-700 mt-1">{currentConfig.name}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentConfig.hasFengshenDashboard && (
                      <Badge color="blue">风神仪表盘</Badge>
                    )}
                    {currentConfig.hasDataTable && (
                      <Badge color="green">数据明细</Badge>
                    )}
                    {currentConfig.hasAimeAnalysis && (
                      <Badge color="purple">AIME分析</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">选择数据源</h4>
            {configLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {configs.map((config) => (
                  <div
                    key={config.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50 ${
                      selectedConfigId === config.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedConfigId(config.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-gray-900">{config.name}</h5>
                          {config.isActive && (
                            <Badge color="green">当前使用</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          类型: {config.type === 'fengshen' ? '风神' : config.type === 'api' ? '自定义API' : '演示数据'}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {config.channels.slice(0, 3).map((channel, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                            >
                              {channel}
                            </span>
                          ))}
                          {config.channels.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              +{config.channels.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="dataSource"
                          value={config.id}
                          checked={selectedConfigId === config.id}
                          onChange={() => setSelectedConfigId(config.id)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {config.hasFengshenDashboard && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            仪表盘
                          </span>
                        )}
                        {config.hasDataTable && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            数据明细
                          </span>
                        )}
                        {config.hasAimeAnalysis && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            AI分析
                          </span>
                        )}
                      </div>
                      {config.syncInterval && (
                        <span className="text-xs text-gray-500">
                          同步间隔: {config.syncInterval}秒
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">配置说明</h5>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                    <span>选择需要的数据源后点击"保存配置"生效</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                    <span>保存后会自动刷新页面数据</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                    <span>如需添加新的数据源，请联系管理员</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
