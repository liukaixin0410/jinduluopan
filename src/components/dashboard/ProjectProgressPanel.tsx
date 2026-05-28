import { useCallback, useEffect, useState } from 'react'
import { getProjects, createProject, updateProject, deleteProject } from '../../services/dashboard'
import type { ProjectItem, ProjectStatus, ProjectFormData } from '../../types/dashboard'
import { Card, ErrorState, EmptyState, Skeleton, Button, Badge } from './shared/Card'
import { Modal } from './shared/Modal'

interface StatusTagProps {
  status: ProjectStatus
}

function StatusTag({ status }: StatusTagProps) {
  const config: Record<ProjectStatus, { color: any; label: string }> = {
    not_started: { color: 'gray', label: '未开始' },
    in_progress: { color: 'blue', label: '进行中' },
    at_risk: { color: 'orange', label: '有风险' },
    completed: { color: 'green', label: '已完成' },
    paused: { color: 'purple', label: '已暂停' },
  }

  const { color, label } = config[status]
  return <Badge color={color}>{label}</Badge>
}

interface PriorityTagProps {
  priority: 'high' | 'medium' | 'low'
}

function PriorityTag({ priority }: PriorityTagProps) {
  const config: Record<'high' | 'medium' | 'low', { color: string; label: string }> = {
    high: { color: 'red', label: '高优先级' },
    medium: { color: 'yellow', label: '中优先级' },
    low: { color: 'gray', label: '低优先级' },
  }

  const { color, label } = config[priority]
  
  const colorClasses = {
    red: 'bg-red-100 text-red-700 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}>
      {label}
    </span>
  )
}

interface ProjectCardProps {
  project: ProjectItem
  onEdit: (project: ProjectItem) => void
  onDelete: (project: ProjectItem) => void
}

function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const [showDetail, setShowDetail] = useState(false)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }

  const formatUpdateTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const progressColor =
    project.progress >= 80 ? 'bg-green-500'
      : project.progress >= 50 ? 'bg-blue-500'
      : project.progress >= 20 ? 'bg-yellow-500'
      : 'bg-gray-300'

  const renderDetail = (text: string) => {
    const lines = text.split('\n')
    return (
      <div className='space-y-1.5'>
        {lines.map((line, idx) => {
          const trimmedLine = line.trim()
          if (!trimmedLine) return null
          
          // 匹配有序列表（1. 开头）
          const orderedMatch = trimmedLine.match(/^(\d+)\.\s*(.*)$/)
          // 匹配无序列表（- 或 * 开头）
          const unorderedMatch = trimmedLine.match(/^[-*]\s*(.*)$/)
          
          if (orderedMatch) {
            return (
              <div key={idx} className='flex gap-2'>
                <span className='text-gray-500 font-medium min-w-[20px]'>{orderedMatch[1]}.</span>
                <span className='text-gray-700'>{orderedMatch[2]}</span>
              </div>
            )
          } else if (unorderedMatch) {
            return (
              <div key={idx} className='flex gap-2'>
                <span className='text-gray-500 min-w-[20px]'>•</span>
                <span className='text-gray-700'>{unorderedMatch[1]}</span>
              </div>
            )
          } else {
            return (
              <p key={idx} className='text-gray-700'>{trimmedLine}</p>
            )
          }
        })}
      </div>
    )
  }

  return (
    <div className='bg-gray-50 rounded-lg p-5'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <h4 className='text-base font-semibold text-gray-900 truncate'>{project.name}</h4>
            <StatusTag status={project.status} />
            <PriorityTag priority={project.priority} />
          </div>
          <p className='mt-2 text-sm text-gray-600 line-clamp-2'>{project.goal}</p>
        </div>
        <div className='flex items-center gap-1 flex-shrink-0'>
          <button
            onClick={() => onEdit(project)}
            className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors'
            title='编辑'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
            </svg>
          </button>
          <button
            onClick={() => onDelete(project)}
            className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors'
            title='删除'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
            </svg>
          </button>
        </div>
      </div>

      <div className='mt-4 flex items-center gap-4 text-xs text-gray-500'>
        <span className='flex items-center gap-1'>
          <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
          </svg>
          {formatDate(project.startDate)} - {formatDate(project.endDate)}
        </span>
        {project.collaborators.length > 0 && (
          <span className='flex items-center gap-1'>
            <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' />
            </svg>
            {project.collaborators.join(', ')}
          </span>
        )}
      </div>

      <div className='mt-4'>
        <div className='flex items-center justify-between text-xs text-gray-600 mb-1.5'>
          <span>进度</span>
          <span>{project.progress}%</span>
        </div>
        <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
          <div
            className={`h-full ${progressColor} transition-all duration-500`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {project.currentTask && (
        <div className='mt-4 p-3 bg-white rounded-lg border border-gray-200'>
          <p className='text-xs text-gray-500 mb-1'>当前事项</p>
          <p className='text-sm text-gray-700'>{project.currentTask}</p>
        </div>
      )}

      {project.detail && (
        <div className='mt-3'>
          <button
            onClick={() => setShowDetail(!showDetail)}
            className='text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1'
          >
            {showDetail ? '收起详情' : '查看详情'}
            <svg
              className={`w-3 h-3 transition-transform ${showDetail ? 'rotate-180' : ''}`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
            </svg>
          </button>
          {showDetail && (
            <div className='mt-2 text-sm bg-white p-3 rounded-lg border border-gray-200'>
              {renderDetail(project.detail)}
            </div>
          )}
        </div>
      )}

      <div className='mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400'>
        <span>最后更新：{formatUpdateTime(project.updatedAt)}</span>
      </div>
    </div>
  )
}

interface ProjectFormModalProps {
  isOpen: boolean
  onClose: () => void
  project?: ProjectItem
  onSubmit: (data: ProjectFormData) => void
}

function ProjectFormModal({ isOpen, onClose, project, onSubmit }: ProjectFormModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    progress: 0,
    status: 'not_started',
    priority: 'medium',
    currentTask: '',
    collaborators: [],
    detail: '',
  })
  const [collaboratorInput, setCollaboratorInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        goal: project.goal,
        startDate: project.startDate,
        endDate: project.endDate,
        progress: project.progress,
        status: project.status,
        priority: project.priority,
        currentTask: project.currentTask,
        collaborators: [...project.collaborators],
        detail: project.detail,
      })
    } else {
      const today = new Date().toISOString().split('T')[0]
      setFormData({
        name: '',
        goal: '',
        startDate: today,
        endDate: '',
        progress: 0,
        status: 'not_started',
        priority: 'medium',
        currentTask: '',
        collaborators: [],
        detail: '',
      })
    }
    setErrors({})
  }, [project, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = '请输入项目名称'
    if (!formData.goal.trim()) newErrors.goal = '请输入项目目标'
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = '结束日期不能早于开始日期'
    }
    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = '进度需在 0-100 之间'
    }
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

  const addCollaborator = () => {
    if (collaboratorInput.trim() && !formData.collaborators.includes(collaboratorInput.trim())) {
      setFormData({
        ...formData,
        collaborators: [...formData.collaborators, collaboratorInput.trim()],
      })
      setCollaboratorInput('')
    }
  }

  const removeCollaborator = (name: string) => {
    setFormData({
      ...formData,
      collaborators: formData.collaborators.filter((c) => c !== name),
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? '编辑项目' : '新增项目'}
      size='lg'
      footer={
        <>
          <Button variant='secondary' onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit}>保存</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>项目名称 *</label>
          <input
            type='text'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
            placeholder='请输入项目名称'
          />
          {errors.name && <p className='mt-1 text-xs text-red-600'>{errors.name}</p>}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>项目目标 *</label>
          <textarea
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            rows={2}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.goal ? 'border-red-300' : 'border-gray-300'}`}
            placeholder='请输入项目目标'
          />
          {errors.goal && <p className='mt-1 text-xs text-red-600'>{errors.goal}</p>}
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>开始日期</label>
            <input
              type='date'
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>结束日期</label>
            <input
              type='date'
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.endDate ? 'border-red-300' : 'border-gray-300'}`}
            />
            {errors.endDate && <p className='mt-1 text-xs text-red-600'>{errors.endDate}</p>}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>进度 (%)</label>
            <input
              type='number'
              min='0'
              max='100'
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.progress ? 'border-red-300' : 'border-gray-300'}`}
            />
            {errors.progress && <p className='mt-1 text-xs text-red-600'>{errors.progress}</p>}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='not_started'>未开始</option>
              <option value='in_progress'>进行中</option>
              <option value='at_risk'>有风险</option>
              <option value='completed'>已完成</option>
              <option value='paused'>已暂停</option>
            </select>
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>优先级</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='high'>高优先级</option>
            <option value='medium'>中优先级</option>
            <option value='low'>低优先级</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>当前事项</label>
          <input
            type='text'
            value={formData.currentTask}
            onChange={(e) => setFormData({ ...formData, currentTask: e.target.value })}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='请输入当前事项'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>协同人员</label>
          <div className='flex gap-2 mb-2'>
            <input
              type='text'
              value={collaboratorInput}
              onChange={(e) => setCollaboratorInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCollaborator())}
              className='flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='输入姓名后按回车添加'
            />
            <Button type='button' onClick={addCollaborator}>添加</Button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {formData.collaborators.map((c) => (
              <span
                key={c}
                className='inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs'
              >
                {c}
                <button
                  type='button'
                  onClick={() => removeCollaborator(c)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>详情</label>
          <textarea
            value={formData.detail}
            onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
            rows={3}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='请输入项目详情'
          />
        </div>
      </form>
    </Modal>
  )
}

export function ProjectProgressPanel() {
  const [data, setData] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'update' | 'progress'>('update')
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectItem | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<ProjectItem | undefined>()

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(false)
      const res = await getProjects()
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
    fetchData()
  }, [fetchData])

  const handleRefresh = () => {
    fetchData(true)
  }

  const handleCreate = async (formData: ProjectFormData) => {
    const res = await createProject(formData)
    if (res.success) {
      setData([res.data, ...data])
    }
  }

  const handleEdit = async (formData: ProjectFormData) => {
    if (!editingProject) return
    const res = await updateProject(editingProject.id, formData)
    if (res.success) {
      setData(data.map((p) => p.id === editingProject.id ? res.data : p))
    }
    setEditingProject(undefined)
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    const res = await deleteProject(deleteConfirm.id)
    if (res.success) {
      setData(data.filter((p) => p.id !== deleteConfirm.id))
    }
    setDeleteConfirm(undefined)
  }

  const filteredData = filter === 'all' ? data : data.filter((p) => p.status === filter)
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'update') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }
    return b.progress - a.progress
  })

  return (
    <>
      <Card
        title='跟进项目进展'
        action={
          <div className='flex items-center gap-3'>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className='px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>全部状态</option>
              <option value='not_started'>未开始</option>
              <option value='in_progress'>进行中</option>
              <option value='at_risk'>有风险</option>
              <option value='completed'>已完成</option>
              <option value='paused'>已暂停</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className='px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='update'>按更新时间</option>
              <option value='progress'>按进度</option>
            </select>

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
              新增项目
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className='h-72' />
            ))}
          </div>
        ) : error ? (
          <ErrorState onRetry={handleRefresh} />
        ) : sortedData.length === 0 ? (
          <EmptyState
            message='暂无项目'
            description='点击右上角"新增项目"开始添加'
            action={
              <Button onClick={() => setShowForm(true)}>新增项目</Button>
            }
          />
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
            {sortedData.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={(p) => {
                  setEditingProject(p)
                  setShowForm(true)
                }}
                onDelete={setDeleteConfirm}
              />
            ))}
          </div>
        )}
      </Card>

      <ProjectFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingProject(undefined)
        }}
        project={editingProject}
        onSubmit={editingProject ? handleEdit : handleCreate}
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
            确定要删除项目「<span className='font-semibold text-gray-900'>{deleteConfirm.name}</span>」吗？此操作不可恢复。
          </p>
        </Modal>
      )}
    </>
  )
}
