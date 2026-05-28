import { useCallback, useEffect, useState } from 'react'
import { getTodos, createTodo, updateTodo, updateTodoStatus, deleteTodo } from '../../services/dashboard'
import type { TodoItem, TodoPriority, TodoStatus, TodoFormData } from '../../types/dashboard'
import { Card, ErrorState, EmptyState, Skeleton, Button, Badge } from './shared/Card'
import { Modal } from './shared/Modal'

interface PriorityTagProps {
  priority: TodoPriority
}

function PriorityTag({ priority }: PriorityTagProps) {
  const config: Record<TodoPriority, { color: any; label: string }> = {
    high: { color: 'red', label: '高' },
    medium: { color: 'orange', label: '中' },
    low: { color: 'gray', label: '低' },
  }
  const { color, label } = config[priority]
  return <Badge color={color}>{label}</Badge>
}

interface TodoStatusTagProps {
  status: TodoStatus
}

function TodoStatusTag({ status }: TodoStatusTagProps) {
  const config: Record<TodoStatus, { color: any; label: string }> = {
    todo: { color: 'gray', label: '待办' },
    doing: { color: 'blue', label: '进行中' },
    done: { color: 'green', label: '已完成' },
  }
  const { color, label } = config[status]
  return <Badge color={color}>{label}</Badge>
}

interface TodoRowProps {
  todo: TodoItem
  onEdit: (todo: TodoItem) => void
  onDelete: (todo: TodoItem) => void
  onStatusChange: (todo: TodoItem, status: TodoStatus) => void
}

function TodoRow({ todo, onEdit, onDelete, onStatusChange }: TodoRowProps) {
  const isDone = todo.status === 'done'

  const nextStatus: Record<TodoStatus, TodoStatus> = {
    todo: 'doing',
    doing: 'done',
    done: 'todo',
  }

  return (
    <tr className={isDone ? 'text-gray-400' : ''}>
      <td className='px-4 py-3'>
        <button
          onClick={() => onStatusChange(todo, nextStatus[todo.status])}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isDone
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-blue-500'
          }`}
        >
          {isDone && (
            <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
            </svg>
          )}
        </button>
      </td>
      <td className='px-4 py-3'>
        <div className={`text-sm ${isDone ? 'line-through' : ''}`}>{todo.content}</div>
        {todo.remark && (
          <div className='text-xs text-gray-400 mt-1'>{todo.remark}</div>
        )}
      </td>
      <td className='px-4 py-3'>
        <PriorityTag priority={todo.priority} />
      </td>
      <td className='px-4 py-3'>
        <TodoStatusTag status={todo.status} />
      </td>
      <td className='px-4 py-3 text-right text-xs text-gray-500 whitespace-nowrap'>
        <div className='flex items-center justify-end gap-2'>
          <button
            onClick={() => onEdit(todo)}
            className='p-1 text-gray-400 hover:text-gray-600 transition-colors'
            title='编辑'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
            </svg>
          </button>
          <button
            onClick={() => onDelete(todo)}
            className='p-1 text-gray-400 hover:text-red-600 transition-colors'
            title='删除'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}

interface TodoFormModalProps {
  isOpen: boolean
  onClose: () => void
  todo?: TodoItem
  defaultDate?: string
  onSubmit: (data: TodoFormData) => void
}

function TodoFormModal({ isOpen, onClose, todo, defaultDate, onSubmit }: TodoFormModalProps) {
  const [formData, setFormData] = useState<TodoFormData>({
    date: defaultDate || new Date().toISOString().split('T')[0],
    content: '',
    priority: 'medium',
    status: 'todo',
    remark: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (todo) {
      setFormData({
        date: todo.date,
        content: todo.content,
        priority: todo.priority,
        status: todo.status,
        remark: todo.remark,
      })
    } else {
      setFormData({
        date: defaultDate || new Date().toISOString().split('T')[0],
        content: '',
        priority: 'medium',
        status: 'todo',
        remark: '',
      })
    }
    setErrors({})
  }, [todo, defaultDate, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.date) newErrors.date = '请选择日期'
    if (!formData.content.trim()) newErrors.content = '请输入待办内容'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={todo ? '编辑待办' : '新增待办'}
      footer={
        <>
          <Button variant='secondary' onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit}>保存</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>日期 *</label>
          <input
            type='date'
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.date ? 'border-red-300' : 'border-gray-300'}`}
          />
          {errors.date && <p className='mt-1 text-xs text-red-600'>{errors.date}</p>}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>待办内容 *</label>
          <input
            type='text'
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.content ? 'border-red-300' : 'border-gray-300'}`}
            placeholder='请输入待办内容'
          />
          {errors.content && <p className='mt-1 text-xs text-red-600'>{errors.content}</p>}
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>优先级</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as TodoPriority })}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='high'>高</option>
              <option value='medium'>中</option>
              <option value='low'>低</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TodoStatus })}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='todo'>待办</option>
              <option value='doing'>进行中</option>
              <option value='done'>已完成</option>
            </select>
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>备注</label>
          <textarea
            value={formData.remark}
            onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
            rows={2}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='可选备注'
          />
        </div>
      </form>
    </Modal>
  )
}

export function TodoPanel() {
  const today = new Date().toISOString().split('T')[0]
  const [currentDate, setCurrentDate] = useState(today)
  const [data, setData] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<TodoItem | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<TodoItem | undefined>()

  const fetchData = useCallback(async (date: string, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(false)
      const res = await getTodos(date)
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

  useEffect(() => {
    fetchData(currentDate)
  }, [fetchData, currentDate])

  const handleRefresh = () => {
    fetchData(currentDate, true)
  }

  const handlePrevDay = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 1)
    setCurrentDate(d.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 1)
    setCurrentDate(d.toISOString().split('T')[0])
  }

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const isToday = d.toDateString() === today.toDateString()
    const isTomorrow = d.toDateString() === tomorrow.toDateString()
    const isYesterday = d.toDateString() === yesterday.toDateString()

    if (isToday) return '今天'
    if (isTomorrow) return '明天'
    if (isYesterday) return '昨天'

    return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })
  }

  const handleCreate = async (formData: TodoFormData) => {
    const res = await createTodo(formData)
    if (res.success) {
      if (formData.date === currentDate) {
        setData([res.data, ...data])
      }
    }
  }

  const handleEdit = async (formData: TodoFormData) => {
    if (!editingTodo) return
    const res = await updateTodo(editingTodo.id, formData)
    if (res.success) {
      if (formData.date === currentDate) {
        setData(data.map((t) => t.id === editingTodo.id ? res.data : t))
      } else {
        setData(data.filter((t) => t.id !== editingTodo.id))
      }
    }
    setEditingTodo(undefined)
  }

  const handleStatusChange = async (todo: TodoItem, status: TodoStatus) => {
    const res = await updateTodoStatus(todo.id, { status })
    if (res.success) {
      setData(data.map((t) => t.id === todo.id ? res.data : t))
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    const res = await deleteTodo(deleteConfirm.id)
    if (res.success) {
      setData(data.filter((t) => t.id !== deleteConfirm.id))
    }
    setDeleteConfirm(undefined)
  }

  const sortedData = [...data].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const statusOrder = { todo: 0, doing: 1, done: 2 }
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status]
    }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <>
      <Card
        title='今日 Todo'
        action={
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2 border border-gray-300 rounded-lg'>
              <button
                onClick={handlePrevDay}
                className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                </svg>
              </button>
              <span className='px-3 text-sm font-medium text-gray-700 min-w-[100px] text-center'>
                {formatDisplayDate(currentDate)}
              </span>
              <button
                onClick={handleNextDay}
                className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </button>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className='p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50'
              title='刷新'
            >
              <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 6.239A9 9 0 004 12c0-1.263.23-2.479.659-3.603M4.582 9H4m11.418 7H20m-1.582 0a9 9 0 01-15.356-2.761M9.582 9H4m15.356 2.239L20 9h.582M11.418 16H4m1.582 0A9 9 0 0020 12c0-1.263-.23-2.479-.659-3.603' />
              </svg>
            </button>

            <Button onClick={() => setShowForm(true)}>
              <svg className='w-4 h-4 mr-1.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
              </svg>
              新增
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className='space-y-2'>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className='h-12' />
            ))}
          </div>
        ) : error ? (
          <ErrorState onRetry={handleRefresh} />
        ) : sortedData.length === 0 ? (
          <EmptyState
            message='暂无待办'
            description='点击右上角"新增"添加今日待办'
            action={
              <Button onClick={() => setShowForm(true)}>新增待办</Button>
            }
          />
        ) : (
          <div className='overflow-hidden'>
            <table className='w-full'>
              <thead>
                <tr className='text-xs text-gray-500 border-b border-gray-100'>
                  <th className='px-4 py-2 w-10'></th>
                  <th className='px-4 py-2 text-left'>待办内容</th>
                  <th className='px-4 py-2 w-16'></th>
                  <th className='px-4 py-2 w-20'></th>
                  <th className='px-4 py-2 w-20 text-right'>操作</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {sortedData.map((todo) => (
                  <TodoRow
                    key={todo.id}
                    todo={todo}
                    onEdit={(t) => {
                      setEditingTodo(t)
                      setShowForm(true)
                    }}
                    onDelete={setDeleteConfirm}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <TodoFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingTodo(undefined)
        }}
        todo={editingTodo}
        defaultDate={currentDate}
        onSubmit={editingTodo ? handleEdit : handleCreate}
      />

      {deleteConfirm && (
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(undefined)}
          title='确认删除'
          footer={
            <>
              <Button variant='secondary' onClick={() => setDeleteConfirm(undefined)}>取消</Button>
              <Button variant='danger' onClick={handleDelete}>删除</Button>
            </>
          }
        >
          <p className='text-gray-600'>
            确定要删除待办「<span className='font-semibold text-gray-900'>{deleteConfirm.content}</span>」吗？此操作不可恢复。
          </p>
        </Modal>
      )}
    </>
  )
}
