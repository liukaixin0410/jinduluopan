import { Outlet, useLocation, Link } from 'react-router-dom'
import {
  TrendingUp,
  Target,
  CheckSquare,
  Newspaper,
  Sparkles,
  ChevronRight,
  Zap,
  Rocket,
} from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

interface NavItem {
  path: string
  icon: React.ComponentType<any>
  label: string
  accent: string
}

const navItems: NavItem[] = [
  { path: '/ads-summary', icon: TrendingUp, label: '投流数据播报', accent: 'blue' },
  { path: '/projects',    icon: Target,     label: '跟进项目进展', accent: 'purple' },
  { path: '/todos',       icon: CheckSquare, label: '今日 Todo',   accent: 'emerald' },
  { path: '/news',        icon: Newspaper,   label: '科技新闻动态', accent: 'amber' },
]

const accentStyles: Record<string, { iconBg: string; activeBg: string; activeBar: string; dot: string }> = {
  blue: {
    iconBg: 'bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30',
    activeBg: 'bg-primary-50 text-primary-700',
    activeBar: 'bg-gradient-to-b from-primary-400 to-primary-600',
    dot: 'bg-primary-500',
  },
  purple: {
    iconBg: 'bg-gradient-to-br from-accent-400 to-accent-600 shadow-lg shadow-accent-500/30',
    activeBg: 'bg-accent-50 text-accent-700',
    activeBar: 'bg-gradient-to-b from-accent-400 to-accent-600',
    dot: 'bg-accent-500',
  },
  emerald: {
    iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30',
    activeBg: 'bg-emerald-50 text-emerald-700',
    activeBar: 'bg-gradient-to-b from-emerald-400 to-emerald-600',
    dot: 'bg-emerald-500',
  },
  amber: {
    iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30',
    activeBg: 'bg-amber-50 text-amber-700',
    activeBar: 'bg-gradient-to-b from-amber-400 to-amber-600',
    dot: 'bg-amber-500',
  },
}

export function Layout() {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-app overflow-hidden">
      {/* =========================================
          Sidebar
          ========================================= */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200/70">

        {/* ---- Logo / Brand ---- */}
        <div className="px-5 pt-6 pb-5">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 via-accent-500 to-pink-500 flex items-center justify-center shadow-float shadow-primary-500/30 group-hover:shadow-glow-blue transition-all duration-300">
              <Rocket className="w-5 h-5 text-white transform -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">开心工作台</h1>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" strokeWidth={2.5} />
                效率办公平台
              </p>
            </div>
          </Link>
        </div>

        {/* ---- Section Divider ---- */}
        <div className="px-5 mb-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            功能模块
          </div>
        </div>

        {/* ---- Navigation Menu ---- */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            const styles = accentStyles[item.accent]

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'relative group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                  isActive
                    ? `${styles.activeBg} shadow-soft`
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {/* Left accent bar for active state */}
                {isActive && (
                  <div className={cn('absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full', styles.activeBar)} />
                )}

                {/* Icon */}
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
                  isActive
                    ? `${styles.iconBg} text-white`
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                )}>
                  <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                </div>

                {/* Label */}
                <span className={cn(
                  'text-sm font-medium flex-1 truncate transition-colors',
                  isActive ? '' : 'group-hover:text-slate-900'
                )}>
                  {item.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <div className="flex items-center gap-1.5">
                    <ChevronRight className="w-4 h-4 opacity-60" strokeWidth={2.5} />
                  </div>
                )}

                {/* Subtle dot for inactive items */}
                {!isActive && (
                  <div className={cn('w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-40 transition-opacity', styles.dot)} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* ---- Bottom Card: Motivational / Tip ---- */}
        <div className="p-3 mt-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-accent-500 to-pink-500 p-4 text-white shadow-float shadow-primary-500/20">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -left-2 w-16 h-16 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-200" strokeWidth={2.5} fill="currentColor" />
                <span className="text-xs font-semibold text-white/90">今日能量</span>
              </div>
              <p className="text-sm font-medium leading-snug">
                专注当下，稳步前行 ✨
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================
          Main Content Area
          ========================================= */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
