import { Outlet, useLocation, Link } from 'react-router-dom'
import { TrendingUp, Newspaper, CheckSquare, Briefcase } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

const navItems = [
  { path: '/ads-summary', icon: TrendingUp, label: '投流数据播报' },
  { path: '/projects', icon: Briefcase, label: '跟进项目进展' },
  { path: '/todos', icon: CheckSquare, label: '今日 Todo' },
  { path: '/news', icon: Newspaper, label: '科技新闻动态' },
]

export function Layout() {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 overflow-hidden">
              <img 
                src="/logo.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">开心工作台</h1>
              <p className="text-xs text-gray-500 mt-0.5">效率办公平台</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </Link>
            )
          })}
        </nav>
      </aside>
      
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
