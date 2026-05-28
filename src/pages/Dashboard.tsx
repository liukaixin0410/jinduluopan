import { AdsSummaryPanel } from '../components/dashboard/AdsSummaryPanel'
import { NewsPanel } from '../components/dashboard/NewsPanel'
import { ProjectProgressPanel } from '../components/dashboard/ProjectProgressPanel'
import { TodoPanel } from '../components/dashboard/TodoPanel'

export function Dashboard() {
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">个人工作台</h1>
            <p className="text-gray-500 mt-1">{today}</p>
          </div>
        </div>

        {/* First Row - 3 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Ads Summary - Left */}
          <div className="lg:col-span-1">
            <AdsSummaryPanel />
          </div>

          {/* News - Middle */}
          <div className="lg:col-span-1">
            <NewsPanel />
          </div>

          {/* Todo - Right */}
          <div className="lg:col-span-1">
            <TodoPanel />
          </div>
        </div>

        {/* Second Row - Full width Projects */}
        <div>
          <ProjectProgressPanel />
        </div>
      </div>
    </div>
  )
}
