import { TodoPanel } from '../components/dashboard/TodoPanel'
import { CheckSquare, CalendarDays } from 'lucide-react'

export function Todos() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* 标题区域 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
              <CheckSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-700 to-emerald-600 bg-clip-text text-transparent">
                今日 Todo
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                高效管理待办事项，提升工作效率
              </p>
            </div>
          </div>
          
          {/* 装饰性分割线 */}
          <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-400 rounded-full opacity-60" />
        </div>
        
        <TodoPanel />
      </div>
    </div>
  )
}
