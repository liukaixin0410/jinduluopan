import { NewsPanel } from '../components/dashboard/NewsPanel'
import { Newspaper, Clock } from 'lucide-react'

export function News() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题区域 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Newspaper className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-orange-700 to-amber-600 bg-clip-text text-transparent">
                科技新闻动态
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                前沿资讯，科技动态，第一时间掌握
              </p>
            </div>
          </div>
          
          {/* 装饰性分割线 */}
          <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 rounded-full opacity-60" />
        </div>
        
        <NewsPanel />
      </div>
    </div>
  )
}
