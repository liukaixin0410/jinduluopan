import { AdsSummaryPanel } from '../components/dashboard/AdsSummaryPanel'
import { TrendingUp, Activity } from 'lucide-react'

export function AdsSummary() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题区域 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-cyan-600 bg-clip-text text-transparent">
                投流数据播报
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                实时监控投放效果，智能分析数据趋势
              </p>
            </div>
          </div>
          
          {/* 装饰性分割线 */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400 rounded-full opacity-60" />
        </div>
        
        <AdsSummaryPanel />
      </div>
    </div>
  )
}
