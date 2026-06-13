import { useEffect, useState } from 'react'
import { Newspaper, Search, TrendingUp, Info, Sparkles, ExternalLink } from 'lucide-react'
import { getNews } from '../services/dashboard'
import type { NewsItem } from '../types/dashboard'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

const categoryLabels = {
  'ai': 'AI',
  'tech': '科技',
  'finance': '财经'
}

const categoryColors = {
  'ai': 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
  'tech': 'bg-[#5B6CFF]/10 text-[#5B6CFF]',
  'finance': 'bg-[#10B981]/10 text-[#10B981]'
}

const categoryIcons = {
  'ai': TrendingUp,
  'tech': Info,
  'finance': Newspaper
}

const getNewsImageUrl = (_category: string, index: number) => {
  const images = [
    'https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=technology%20news%20AI%20technology&image_size=square_hd',
    'https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=tech%20startup%20business&image_size=square_hd',
    'https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=modern%20digital%20workspace&image_size=square_hd',
    'https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=artificial%20intelligence%20concept&image_size=square_hd',
    'https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=business%20innovation%20tech&image_size=square_hd'
  ]
  return images[index % images.length]
}

type DisplayEvent = {
  id: string
  title: string
  oneLineSummary: string
  time: string
  category: 'ai' | 'tech' | 'finance'
  sourceLink: string
  source: string
  imageUrl: string
  hotTags: string[]
}

function mapToDisplay(newsItems: NewsItem[]): DisplayEvent[] {
  return newsItems.map((item, index) => ({
    id: item.id || `${item.category}_${index}`,
    title: item.title,
    oneLineSummary: item.summary || '',
    time: item.publishedAt || '',
    category: item.category,
    sourceLink: item.sourceUrl || '',
    source: item.sourceName || '',
    imageUrl: item.imageUrl || getNewsImageUrl(item.category, index),
    hotTags: []
  }))
}

export function Events() {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'ai' | 'tech' | 'finance'>('all')
  const [search, setSearch] = useState('')
  const [allEvents, setAllEvents] = useState<DisplayEvent[]>([])

  useEffect(() => {
    getNews('all')
      .then(res => {
        setAllEvents(mapToDisplay(res.data || []))
      })
  }, [])

  const filteredEvents = [...allEvents].filter(event => {
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter
    const matchesSearch = !search ||
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.oneLineSummary.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  }).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  const topEvents = filteredEvents.slice(0, 3)
  const otherEvents = filteredEvents.slice(3)

  const NewsCard = ({ event, index, isTop = false }: { event: DisplayEvent; index: number; isTop?: boolean }) => {
    const category = event.category as keyof typeof categoryIcons
    const imageUrl = event.imageUrl || getNewsImageUrl(category, index)

    return (
      <a
        href={event.sourceLink}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "bg-white rounded-3xl border border-[#E5E7EB] shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group block",
          isTop && "hover:border-[#5B6CFF]/30"
        )}
      >
        <div className="relative h-48 overflow-hidden bg-[#F7F8FC]">
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className={cn("px-3 py-1 rounded-full text-xs font-medium", categoryColors[category])}>
              {categoryLabels[category]}
            </span>
          </div>
          <div className="absolute bottom-3 right-3">
            <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {event.time}
            </span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-base font-semibold text-[#111827] mb-2 line-clamp-2 leading-relaxed group-hover:text-[#5B6CFF] transition-colors">
            {event.title}
          </h3>

          <p className="text-[#6B7280] text-sm leading-relaxed mb-3 line-clamp-2">
            {event.oneLineSummary}
          </p>

          {event.hotTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {event.hotTags.slice(0, 3).map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-[#F7F8FC] text-[#6B7280] rounded-lg text-xs border border-[#E5E7EB]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <div className="flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5" />
              {event.source || event.sourceLink ? '来源' : ''}
            </div>
          </div>
        </div>
      </a>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] p-6 pb-12">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-[#5B6CFF]/10 via-[#8B5CF6]/10 to-[#EC4899]/10 rounded-3xl p-5 border border-[#5B6CFF]/20 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#5B6CFF] to-[#8B5CF6] rounded-2xl flex items-center justify-center shrink-0">
              <Sparkles className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-[#111827]">大事记</h1>
              <p className="text-[#6B7280] mt-1.5 leading-relaxed text-sm">
                精选AI、科技、互联网领域的重要新闻，来自36氪、虎嗅、极客公园等权威媒体
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="搜索新闻..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30 shadow-sm text-sm"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            <button
              onClick={() => setCategoryFilter('all')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap",
                categoryFilter === 'all'
                  ? "bg-[#5B6CFF] text-white shadow-sm"
                  : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#5B6CFF]/30 hover:text-[#5B6CFF]"
              )}
            >
              全部
            </button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCategoryFilter(key as 'all' | 'ai' | 'tech' | 'finance')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap",
                  categoryFilter === key
                    ? "bg-[#5B6CFF] text-white shadow-sm"
                    : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#5B6CFF]/30 hover:text-[#5B6CFF]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {topEvents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Sparkles className="w-4.5 h-4.5 text-[#F59E0B]" />
              <h2 className="text-sm font-semibold text-[#111827]">重点推荐</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topEvents.map((event, index) => (
                <NewsCard key={event.id} event={event} index={index} isTop={true} />
              ))}
            </div>
          </div>
        )}

        {otherEvents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Newspaper className="w-4.5 h-4.5 text-[#6B7280]" />
              <h2 className="text-sm font-semibold text-[#111827]">更多新闻</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherEvents.map((event, index) => (
                <NewsCard key={event.id} event={event} index={index + 3} />
              ))}
            </div>
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="bg-white rounded-3xl p-10 border border-[#E5E7EB] text-center shadow-sm">
            <Search className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
            <h3 className="text-base font-medium text-[#111827]">没有找到新闻</h3>
            <p className="text-[#6B7280] mt-1.5 text-sm">尝试调整搜索条件</p>
          </div>
        )}
      </div>
    </div>
  )
}
