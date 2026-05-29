import { ProjectProgressPanel } from '../components/dashboard/ProjectProgressPanel'
import { Target, Calendar } from 'lucide-react'

export function Projects() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* 标题区域 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-700 to-pink-600 bg-clip-text text-transparent">
                跟进项目进展
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                项目全生命周期管理，进度一目了然
              </p>
            </div>
          </div>
          
          {/* 装饰性分割线 */}
          <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full opacity-60" />
        </div>
        
        <ProjectProgressPanel />
      </div>
    </div>
  )
}
