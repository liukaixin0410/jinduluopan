import { Calendar, Sparkles, TrendingUp, Target, CheckSquare, Newspaper } from 'lucide-react'
import { AdsSummaryPanel } from '../components/dashboard/AdsSummaryPanel'
import { NewsPanel } from '../components/dashboard/NewsPanel'
import { ProjectProgressPanel } from '../components/dashboard/ProjectProgressPanel'
import { TodoPanel } from '../components/dashboard/TodoPanel'

function formatDate(date: Date) {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

interface QuickCardProps {
  title: string
  subtitle: string
  icon: React.ComponentType<any>
  gradient: string
  children?: React.ReactNode
}

function QuickCard({ title, subtitle, icon: Icon, gradient, children }: QuickCardProps) {
  return (
    <div className="group card-container hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
      <div className="card-content !p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg', gradient)}>
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
        </div>
        <h4 className="text-sm font-semibold text-slate-900 leading-tight">{title}</h4>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{subtitle}</p>
        {children && <div className="mt-3 pt-3 border-t border-slate-100">{children}</div>}
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}

export function Dashboard() {
  const today = new Date()
  const greeting = getGreeting()

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">

        {/* ======================================================
            Hero Header
            ====================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 text-white shadow-float shadow-primary-500/20">
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-10 right-32 w-40 h-40 bg-accent-300/20 rounded-full blur-2xl" />

          <div className="relative px-8 py-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-200" fill="currentColor" strokeWidth={0} />
                  <span>{greeting}，欢迎回来</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight leading-tight">
                  个人工作台
                </h1>
                <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                  <Calendar className="w-4 h-4" strokeWidth={2} />
                  <span>{formatDate(today)}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-3">
                <QuickStat label="今日 Todo" value="3" />
                <QuickStat label="进行中项目" value="5" />
                <QuickStat label="新资讯" value="12" />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            Quick Actions Grid
            ====================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickCard
            icon={TrendingUp}
            title="投流数据播报"
            subtitle="实时看板 · 归因分析"
            gradient="bg-gradient-to-br from-primary-400 to-primary-600 shadow-primary-500/30"
          >
            <p className="text-xs text-slate-400">最近更新: 2分钟前</p>
          </QuickCard>

          <QuickCard
            icon={Target}
            title="跟进项目进展"
            subtitle="里程碑 · 进度追踪"
            gradient="bg-gradient-to-br from-accent-400 to-accent-600 shadow-accent-500/30"
          >
            <p className="text-xs text-slate-400">5 个项目进行中</p>
          </QuickCard>

          <QuickCard
            icon={CheckSquare}
            title="今日 Todo"
            subtitle="待办事项 · 优先级管理"
            gradient="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
          >
            <p className="text-xs text-slate-400">3 项待完成 · 1 项高优先级</p>
          </QuickCard>

          <QuickCard
            icon={Newspaper}
            title="科技新闻动态"
            subtitle="行业资讯 · AI 精选"
            gradient="bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30"
          >
            <p className="text-xs text-slate-400">12 条新资讯</p>
          </QuickCard>
        </div>

        {/* ======================================================
            Main Content Panels
            ====================================================== */}

        {/* Row 1: Three-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AdsSummaryPanel />
          <NewsPanel />
          <TodoPanel />
        </div>

        {/* Row 2: Full-width project panel */}
        <div>
          <ProjectProgressPanel />
        </div>
      </div>

      {/* Bottom spacer for breathing room */}
      <div className="h-8" />
    </div>
  )
}

interface QuickStatProps {
  label: string
  value: string
  accent?: string
}

function QuickStat({ label, value }: QuickStatProps) {
  return (
    <div className="flex-shrink-0 min-w-[90px] px-4 py-3 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 text-center">
      <div className={cn('text-2xl font-bold leading-tight', 'text-white')}>
        {value}
      </div>
      <div className="text-xs text-white/80 mt-0.5">{label}</div>
    </div>
  )
}
