import { NewsPanel } from '../components/dashboard/NewsPanel'

export function News() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">科技新闻动态</h1>
          <p className="text-gray-500 mt-1">前沿资讯，科技动态，第一时间掌握</p>
        </div>
        <NewsPanel />
      </div>
    </div>
  )
}
