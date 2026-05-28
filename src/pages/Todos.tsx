import { TodoPanel } from '../components/dashboard/TodoPanel'

export function Todos() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">今日 Todo</h1>
          <p className="text-gray-500 mt-1">高效管理待办事项，提升工作效率</p>
        </div>
        <TodoPanel />
      </div>
    </div>
  )
}
