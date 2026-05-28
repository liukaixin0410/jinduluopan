import { AdsSummaryPanel } from '../components/dashboard/AdsSummaryPanel'

export function AdsSummary() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">投流数据播报</h1>
          <p className="text-gray-500 mt-1">实时监控投放效果，智能分析数据趋势</p>
        </div>
        <AdsSummaryPanel />
      </div>
    </div>
  )
}
