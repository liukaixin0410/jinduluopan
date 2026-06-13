import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, Skeleton, EmptyState, Button, Badge } from './shared/Card'
import { Modal } from './shared/Modal'
import { getTodos, createTodo, updateTodo, updateTodoStatus, deleteTodo } from '../../services/dashboard'

type TodoPriority = 'high' | 'medium' | 'low'
type TodoStatus = 'todo' | 'doing' | 'done'

interface TodoItem {
  id: string
  content: string
  remark?: string
  priority: TodoPriority
  status: TodoStatus
  date: string
  createdAt: string
}

interface TodoFormData {
  date: string
  content: string
  priority: TodoPriority
  status: TodoStatus
  remark: string
}

const todayISO = new Date().toISOString().split('T')[0]

/* ===========================================================
   Utilities
   =========================================================== */
const priorityConfig: Record<TodoPriority, { label: string; badge: string; dot: string; ring: string }> = {
  high: {
    label: '高',
    badge: 'bg-red-50 text-red-700 border border-red-100',
    dot: 'bg-red-500',
    ring: 'ring-red-500/30 focus:ring-red-500/30',
  },
  medium: {
    label: '中',
    badge: 'bg-amber-50 text-amber-700 border border-amber-100',
    dot: 'bg-amber-500',
    ring: 'ring-amber-500/30',
  },
  low: {
    label: '低',
    badge: 'bg-slate-100 text-slate-600 border border-slate-200',
    dot: 'bg-slate-400',
    ring: 'ring-slate-400/30',
  },
}

const statusConfig: Record<TodoStatus, { label: string; badge: string; label2: string }> = {
  todo: { label: '待办', badge: 'bg-slate-100 text-slate-600', label2: '待办' },
  doing: { label: '进行中', badge: 'bg-primary-100 text-primary-700', label2: '进行中' },
  done: { label: '已完成', badge: 'bg-emerald-100 text-emerald-700', label2: '已完成' },
}

function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return '今天'
  if (d.toDateString() === tomorrow.toDateString()) return '明天'
  if (d.toDateString() === yesterday.toDateString()) return '昨天'

  return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })
}

/* ===========================================================
   Todo Row
   =========================================================== */
function TodoRow({
  todo,
  onToggle,
  onEdit,
  onDelete,
}: {
  todo: TodoItem
  onToggle: (todo: TodoItem) => void
  onEdit: (todo: TodoItem) => void
  onDelete: (todo: TodoItem) => void
}) {
  const isDone = todo.status === 'done'
  const priority = priorityConfig[todo.priority]

  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200',
        isDone
          ? 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm hover:bg-slate-50/30'
      )}
    >
      {/* Checkbox / Toggle */}
      <button
        onClick={() => onToggle(todo)}
        className={cn(
          'mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200',
          isDone
            ? 'bg-emerald-500 text-white shadow-sm'
            : `border-2 border-slate-300 text-transparent hover:border-primary-400 hover:bg-primary-50 hover:text-primary-400`
        )}
      >
        <CheckCircle2 className="w-5 h-5" strokeWidth={isDone ? 2.5 : 2} />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'text-sm font-medium leading-snug',
              isDone ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-800'
            )}
          >
            {todo.content}
          </span>
          <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md', priority.badge)}>
            {priority.label}
          </span>
          <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md', statusConfig[todo.status].badge)}>
            {statusConfig[todo.status].label}
          </span>
        </div>
        {todo.remark && (
          <p className={cn('text-xs mt-1.5 leading-relaxed', isDone ? 'text-slate-400' : 'text-slate-500')}>
            {todo.remark}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => onEdit(todo)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
          title="编辑"
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
        <button
          onClick={() => onDelete(todo)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
          title="删除"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

/* ===========================================================
   Todo Panel - Main Component
   =========================================================== */
export function TodoPanel() {
  const [date, setDate] = useState<string>(todayISO)
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null)

  const loadData = useCallback(
    (targetDate: string) => {
      setLoading(true)
      getTodos(targetDate)
        .then(res => {
          const data = (res.data || []).map(t => ({
            ...t,
            remark: typeof t.remark === 'string' ? t.remark : ''
          })) as TodoItem[]
          const sorted = data.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 } as any
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
              return priorityOrder[a.priority] - priorityOrder[b.priority]
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          })
          setTodos(sorted)
        })
        .finally(() => {
          setLoading(false)
        })
    },
    []
  )

  useEffect(() => {
    loadData(date)
  }, [loadData, date])

  const handleToggle = (todo: TodoItem) => {
    const newStatus: TodoStatus = todo.status === 'done' ? 'todo' : 'done'
    updateTodoStatus(todo.id, { status: newStatus })
      .then(() => {
        loadData(date)
      })
      .catch(() => {
        // 乐观回退
        loadData(date)
      })
  }

  const handleEdit = (todo: TodoItem) => {
    setEditingTodo(todo)
    setModalOpen(true)
  }

  const handleDelete = (todo: TodoItem) => {
    deleteTodo(todo.id)
      .then(() => {
        loadData(date)
      })
  }

  const handleAdd = () => {
    setEditingTodo(null)
    setModalOpen(true)
  }

  const handleSubmit = (data: TodoFormData) => {
    const payload: TodoFormData = {
      date: data.date,
      content: data.content,
      priority: data.priority,
      status: data.status,
      remark: data.remark || ''
    }
    const promise = editingTodo
      ? updateTodo(editingTodo.id, payload)
      : createTodo(payload)
    promise
      .then(() => {
        setModalOpen(false)
        setEditingTodo(null)
        loadData(date)
      })
      .catch(() => {
        setModalOpen(false)
        setEditingTodo(null)
        loadData(date)
      })
  }

  const doneCount = todos.filter((t) => t.status === 'done').length
  const totalCount = todos.length
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <Card
      title="今日待办"
      subtitle={formatDisplayDate(date)}
      action={
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field text-xs"
          />
          <Button size="sm" onClick={handleAdd}>
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            新增
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : todos.length === 0 ? (
        <EmptyState message="暂无待办" description="点击右上角「新增」添加第一条今日待办" />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <span>
                完成 <strong className="text-slate-900">{doneCount}</strong> / {totalCount}
              </span>
              {totalCount > 0 && (
                <Badge color={progress >= 80 ? 'green' : progress >= 40 ? 'blue' : 'gray'}>
                  {progress}%
                </Badge>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {todos.map((todo) => (
              <TodoRow
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      <TodoFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingTodo(null)
        }}
        todo={editingTodo || undefined}
        defaultDate={date}
        onSubmit={handleSubmit}
      />
    </Card>
  )
}

/* ===========================================================
   Todo Form Modal
   =========================================================== */
function TodoFormModal({
  isOpen,
  onClose,
  todo,
  defaultDate,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  todo?: TodoItem
  defaultDate?: string
  onSubmit: (data: TodoFormData) => void
}) {
  const [form, setForm] = useState<TodoFormData>({
    date: defaultDate || todayISO,
    content: '',
    priority: 'medium',
    status: 'todo',
    remark: '',
  })
  const [errors, setErrors] = useState<{ content?: string }>({})

  useEffect(() => {
    if (isOpen) {
      setForm({
        date: todo?.date || defaultDate || todayISO,
        content: todo?.content || '',
        priority: todo?.priority || 'medium',
        status: todo?.status || 'todo',
        remark: todo?.remark || '',
      })
      setErrors({})
    }
  }, [isOpen, todo, defaultDate])

  const validate = () => {
    if (!form.content.trim()) {
      setErrors({ content: '请输入待办内容' })
      return false
    }
    setErrors({})
    return true
  }

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(form)
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={todo ? '编辑待办' : '新增待办'}
      description="记录今天要完成的事项"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit}>{todo ? '保存' : '添加'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">日期</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="input-field"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">内容 *</label>
          <input
            type="text"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="请输入待办内容"
            className={cn('input-field', errors.content && 'border-red-300 focus:ring-red-500/30')}
          />
          {errors.content && <p className="text-xs text-red-600 mt-1">{errors.content}</p>}
        </div>

        {/* Priority + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">优先级</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as TodoPriority })}
              className="select-field"
            >
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">状态</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as TodoStatus })}
              className="select-field"
            >
              <option value="todo">待办</option>
              <option value="doing">进行中</option>
              <option value="done">已完成</option>
            </select>
          </div>
        </div>

        {/* Remark */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
          <textarea
            value={form.remark}
            onChange={(e) => setForm({ ...form, remark: e.target.value })}
            rows={3}
            className="input-field resize-none"
            placeholder="可选补充信息"
          />
        </div>
      </div>
    </Modal>
  )
}
