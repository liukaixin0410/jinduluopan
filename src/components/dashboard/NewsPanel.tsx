import { useCallback, useEffect, useState } from 'react'
import { getNews } from '../../services/dashboard'
import type { NewsItem, NewsCategory } from '../../types/dashboard'
import { Card, ErrorState, EmptyState, Skeleton } from './shared/Card'

// NewsCard 组件
interface NewsCardProps {
  news: NewsItem
}

function NewsCard({ news }: NewsCardProps) {
  const [imageError, setImageError] = useState(false)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return '刚刚'
    if (hours < 24) return `${hours}小时前`
    const days = Math.floor(hours / 24)
    return `${days}天前`
  }

  const getCategoryConfig = (category: string) => {
    const configs: Record<string, { gradient: string; icon: string; label: string }> = {
      ai: {
        gradient: 'from-violet-500 via-purple-500 to-indigo-600',
        icon: '🤖',
        label: 'AI资讯',
      },
      tech: {
        gradient: 'from-blue-500 via-cyan-500 to-teal-600',
        icon: '💻',
        label: '科技新闻',
      },
      finance: {
        gradient: 'from-emerald-500 via-green-500 to-teal-600',
        icon: '📈',
        label: '金融动态',
      },
    }
    return configs[category] || configs.tech
  }

  const config = getCategoryConfig(news.category)

  return (
    <a
      href={news.sourceUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='group block bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300'
    >
      <div className='aspect-[16/9] relative overflow-hidden'>
        {news.imageUrl && !imageError ? (
          <img
            src={news.imageUrl}
            alt={news.title}
            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
            onError={() => setImageError(true)}
            loading='lazy'
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
            <div className='text-white text-center p-4'>
              <div className='text-5xl mb-3 drop-shadow-lg'>{config.icon}</div>
              <div className='text-sm font-medium opacity-90 backdrop-blur-sm bg-white/20 px-3 py-1 rounded-full'>{config.label}</div>
            </div>
          </div>
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent' />
      </div>
      <div className='p-5'>
        <h4 className='text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug'>
          {news.title}
        </h4>
        <p className='mt-3 text-sm text-gray-500 line-clamp-2 leading-relaxed'>
          {news.summary}
        </p>
        <div className='mt-4 flex items-center justify-between text-xs text-gray-400'>
          <span className='font-medium'>{news.sourceName}</span>
          <span>{formatDate(news.publishedAt)}</span>
        </div>
      </div>
    </a>
  )
}

// NewsFilterTabs 组件
interface NewsFilterTabsProps {
  current: NewsCategory
  onChange: (category: NewsCategory) => void
}

function NewsFilterTabs({ current, onChange }: NewsFilterTabsProps) {
  const tabs: { id: NewsCategory; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'ai', label: 'AI' },
    { id: 'tech', label: '科技' },
    { id: 'finance', label: '金融' },
  ]

  return (
    <div className='flex items-center gap-1 bg-gray-50 p-1 rounded-lg'>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            current === tab.id
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// NewsGrid 组件
interface NewsGridProps {
  news: NewsItem[]
}

function NewsGrid({ news }: NewsGridProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {news.map((item) => (
        <NewsCard key={item.id} news={item} />
      ))}
    </div>
  )
}

// NewsSkeleton 组件
function NewsSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {[...Array(6)].map((_, i) => (
        <div key={i} className='bg-white rounded-xl border border-gray-100 overflow-hidden'>
          <Skeleton className='h-48' />
          <div className='p-5 space-y-4'>
            <div className='space-y-2'>
              <Skeleton className='h-5 w-full' />
              <Skeleton className='h-5 w-5/6' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-4/5' />
            </div>
            <div className='flex justify-between pt-2'>
              <Skeleton className='h-3 w-20' />
              <Skeleton className='h-3 w-16' />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function NewsPanel() {
  const [data, setData] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [category, setCategory] = useState<NewsCategory>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [nextRefreshIn, setNextRefreshIn] = useState(300) // 5分钟 = 300秒

  const fetchData = useCallback(async (cat: NewsCategory, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(false)
      const res = await getNews(cat)
      if (res.success) {
        setData(res.data)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // 初始加载和分类切换
  useEffect(() => {
    fetchData(category)
    // 重置倒计时
    setNextRefreshIn(300)
  }, [fetchData, category])

  // 自动刷新定时器
  useEffect(() => {
    if (!autoRefreshEnabled) return

    const timer = setInterval(() => {
      setNextRefreshIn(prev => {
        if (prev <= 1) {
          fetchData(category, false)
          return 300 // 重置为5分钟
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [autoRefreshEnabled, category, fetchData])

  const handleRefresh = () => {
    fetchData(category, true)
    setNextRefreshIn(300) // 手动刷新后重置倒计时
  }

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card
      title='科技新闻动态'
      action={
        <div className='flex items-center gap-4'>
          <NewsFilterTabs current={category} onChange={setCategory} />
          <div className='flex items-center gap-3'>
            {/* 自动刷新开关 */}
            <div className='flex items-center gap-2'>
              <span className='text-xs text-gray-500'>
                {autoRefreshEnabled ? `下次更新: ${formatCountdown(nextRefreshIn)}` : '自动刷新已关闭'}
              </span>
              <button
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  autoRefreshEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                title={autoRefreshEnabled ? '关闭自动刷新' : '开启自动刷新'}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autoRefreshEnabled ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
            {/* 手动刷新按钮 */}
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className='p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50'
              title='刷新'
            >
              <svg 
                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
                fill='none' 
                stroke='currentColor' 
                viewBox='0 0 24 24'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 6.239A9 9 0 004 12c0-1.263.23-2.479.659-3.603M4.582 9H4m11.418 7H20m-1.582 0a9 9 0 01-15.356-2.761M9.582 9H4m15.356 2.239L20 9h.582M11.418 16H4m1.582 0A9 9 0 0020 12c0-1.263-.23-2.479-.659-3.603' />
              </svg>
            </button>
          </div>
        </div>
      }
    >
      {loading ? (
        <NewsSkeleton />
      ) : error ? (
        <ErrorState onRetry={handleRefresh} />
      ) : data.length === 0 ? (
        <EmptyState
          message='暂无新闻'
          description='换个分类试试吧'
        />
      ) : (
        <NewsGrid news={data} />
      )}
    </Card>
  )
}
