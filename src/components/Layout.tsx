import { Outlet, useLocation, Link } from 'react-router-dom'
import { TrendingUp, Newspaper, CheckSquare, Zap, Target, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

const navItems = [
  { path: '/ads-summary', icon: TrendingUp, label: '投流数据播报', color: 'from-blue-500 to-cyan-500' },
  { path: '/projects', icon: Target, label: '跟进项目进展', color: 'from-purple-500 to-pink-500' },
  { path: '/todos', icon: CheckSquare, label: '今日 Todo', color: 'from-green-500 to-emerald-500' },
  { path: '/news', icon: Newspaper, label: '科技新闻动态', color: 'from-orange-500 to-amber-500' },
]

export function Layout() {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* 侧边栏 */}
      <aside className="w-64 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200/50 flex flex-col shadow-xl">
        {/* Logo区域 */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-blue-500/30 overflow-hidden">
              <img 
                src="/logo.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">开心工作台</h1>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                效率办公平台
              </p>
            </div>
          </div>
        </div>
        
        {/* 导航菜单 */}
        <nav className="flex-1 px-4 space-y-2 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden',
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-semibold shadow-md'
                    : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-900',
                )}
              >
                {/* 背景光晕 */}
                {isActive && (
                  <div className={cn(
                    'absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-gradient-to-b',
                    item.color
                  )} />
                )}
                
                {/* 图标 */}
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300',
                  isActive
                    ? cn('bg-gradient-to-br', item.color, 'text-white shadow-lg')
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                )}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                
                {/* 标签 */}
                <span className="text-sm font-medium">{item.label}</span>
                
                {/* 激活指示器 */}
                {isActive && (
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse" />
                    <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* 底部装饰 */}
        <div className="px-4 pb-6">
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-blue-100/50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>高效工作，轻松掌控</span>
            </div>
          </div>
        </div>
      </aside>
      
      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
