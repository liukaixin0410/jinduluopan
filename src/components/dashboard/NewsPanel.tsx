import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, Clock, ExternalLink, Sparkles } from 'lucide-react'
import { Card, Skeleton, ErrorState, Button } from './shared/Card'
import { getNews } from '../../services/dashboard'
import type { NewsItem, NewsCategory } from '../../types/dashboard'

const NEWS_DISPLAY_LIMIT = 30

/* ===========================================================
   Utilities
   =========================================================== */
const categoryConfig: Record<NewsCategory, { label: string; gradient: string; emoji: string }> = {
  all: { label: '全部', gradient: 'from-slate-500 to-slate-600', emoji: '📰' },
  ai: { label: 'AI', gradient: 'from-violet-500 to-accent-600', emoji: '🤖' },
  tech: { label: '科技', gradient: 'from-primary-500 to-cyan-600', emoji: '💻' },
  finance: { label: '金融', gradient: 'from-emerald-500 to-teal-600', emoji: '📈' },
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const diff = now.getTime() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return '刚刚'
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

/* ===========================================================
   Filter Tabs
   =========================================================== */
function FilterTabs({
  current,
  onChange,
}: {
  current: NewsCategory
  onChange: (c: NewsCategory) => void
}) {
  const tabs: NewsCategory[] = ['all', 'ai', 'tech', 'finance']

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
      {tabs.map((tab) => {
        const isActive = current === tab
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={[
              'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60',
            ].join(' ')}
          >
            {categoryConfig[tab].label}
          </button>
        )
      })}
    </div>
  )
}

/* ===========================================================
   News Card
   =========================================================== */
function NewsCard({ item }: { item: NewsItem }) {
  const cfg = categoryConfig[item.category]

  return (
    <a
      href={item.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl bg-white border border-slate-200 overflow-hidden hover:shadow-float hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-300"
    >
      {/* Image / Gradient Header */}
      <div className="aspect-[16/9] relative overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${cfg.gradient} flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
            <span className="text-5xl drop-shadow-lg">{cfg.emoji}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 text-xs font-semibold text-white bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
          {cfg.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <h4 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
          {item.title}
        </h4>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-2">
          {item.summary}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-500">{item.sourceName}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" strokeWidth={2} />
            {formatTimeAgo(item.publishedAt)}
          </span>
        </div>
      </div>
    </a>
  )
}

/* ===========================================================
   News Panel - Main Component
   =========================================================== */
export function NewsPanel() {
  const [data, setData] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [category, setCategory] = useState<NewsCategory>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [nextRefresh, setNextRefresh] = useState(300)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(
    async (cat: NewsCategory, isRefresh = false) => {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      try {
        const res = await getNews(cat)
        if (res.success) {
          const sortedData = [...res.data]
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
            .slice(0, NEWS_DISPLAY_LIMIT)
          setData(sortedData)
        } else {
          // 本地 RSS 服务未启动：展示空状态并提示
          setData([])
          setErrorMsg('请先启动本地 RSS 服务：`node local-api-server.js`')
        }
      } catch (err) {
        setData([])
        setErrorMsg((err as Error).message || '加载失败')
      } finally {
        setLoading(false)
        setRefreshing(false)
        setNextRefresh(300)
      }
    },
    []
  )

  useEffect(() => {
    loadData(category)
  }, [loadData, category])

  // Auto-refresh countdown
  useEffect(() => {
    if (!autoRefresh) return
    const timer = setInterval(() => {
      setNextRefresh((prev) => {
        if (prev <= 1) {
          loadData(category, false)
          return 300
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [autoRefresh, category, loadData])

  return (
    <Card
      title="科技新闻动态"
      subtitle="行业资讯 · 实时更新"
      action={
        <div className="flex items-center gap-3">
          <FilterTabs current={category} onChange={setCategory} />
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={[
                'flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all duration-200',
                autoRefresh
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
              ].join(' ')}
            >
              <span className={['w-1.5 h-1.5 rounded-full', autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'].join(' ')} />
              {autoRefresh ? `下次 ${Math.floor(nextRefresh / 60)}:${String(nextRefresh % 60).padStart(2, '0')}` : '自动刷新已关闭'}
            </button>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadData(category, true)}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={2} />
            刷新
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
              <Skeleton className="h-36 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
                <div className="pt-2 flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : errorMsg ? (
        <ErrorState
          message="无法获取真实新闻"
          description={errorMsg}
          onRetry={() => loadData(category, true)}
        />
      ) : data.length === 0 ? (
        <ErrorState
          message="暂无资讯"
          description="该分类下暂无内容，试试其他分类或稍后再看"
          onRetry={() => loadData('all', true)}
        />
      ) : (
        <div>
          {/* Tip banner */}
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary-50 via-white to-accent-50 border border-primary-100/50 p-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 flex-shrink-0">
              <Sparkles className="w-4 h-4" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-700 leading-relaxed">
                共 <span className="font-semibold text-slate-900">{data.length}</span> 条精选资讯
                {category !== 'all' && ` · ${categoryConfig[category].label}分类`}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
              <span>点击查看原文</span>
            </div>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
