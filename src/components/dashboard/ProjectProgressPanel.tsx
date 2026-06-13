import { useCallback, useEffect, useState } from 'react'
import {
  Pencil,
  Trash2,
  Calendar,
  Users,
  ChevronDown,
  FolderKanban,
  Target,
  Flame,
} from 'lucide-react'
import { getProjects, createProject, updateProject, deleteProject } from '../../services/dashboard'
import type { ProjectItem, ProjectStatus, ProjectFormData } from '../../types/dashboard'
import { Card, ErrorState, EmptyState, Skeleton, Button, Badge } from './shared/Card'
import { Modal } from './shared/Modal'

/* ===========================================================
   Status & Priority Tags
   =========================================================== */
interface StatusTagProps {
  status: ProjectStatus
}

function StatusTag({ status }: StatusTagProps) {
  const config: Record<ProjectStatus, { color: 'gray' | 'blue' | 'green' | 'orange' | 'purple'; label: string }> = {
    not_started: { color: 'gray', label: '未开始' },
    in_progress: { color: 'blue', label: '进行中' },
    at_risk: { color: 'orange', label: '有风险' },
    completed: { color: 'green', label: '已完成' },
    paused: { color: 'purple', label: '已暂停' },
  }
  const { color, label } = config[status]
  return <Badge color={color}>{label}</Badge>
}

function PriorityTag({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const config: Record<'high' | 'medium' | 'low', { color: 'red' | 'orange' | 'gray'; label: string; icon: React.ReactNode }> = {
    high: { color: 'red', label: '高优先级', icon: <Flame className="w-3 h-3" strokeWidth={2.5} /> },
    medium: { color: 'orange', label: '中优先级', icon: <Target className="w-3 h-3" strokeWidth={2.5} /> },
    low: { color: 'gray', label: '低优先级', icon: <Target className="w-3 h-3" strokeWidth={2.5} /> },
  }
  const { color, label, icon } = config[priority]
  return <Badge color={color}><span className="inline-flex items-center gap-1">{icon}{label}</span></Badge>
}

/* ===========================================================
   Project Card
   =========================================================== */
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
    return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  const progressColor =
    project.progress >= 80
      ? 'from-success-500 to-success-400'
      : project.progress >= 50
      ? 'from-primary-500 to-primary-400'
      : project.progress >= 20
      ? 'from-warning-500 to-warning-400'
      : 'from-slate-300 to-slate-200'

  const renderDetail = (text: string) => {
    const lines = text.split('\n')
    return (
      <div className="space-y-1.5">
        {lines.map((line, idx) => {
          const trimmedLine = line.trim()
          if (!trimmedLine) return null

          const orderedMatch = trimmedLine.match(/^(\d+)\.\s*(.*)$/)
          const unorderedMatch = trimmedLine.match(/^[-*]\s*(.*)$/)

          if (orderedMatch) {
            return (
              <div key={idx} className="flex gap-2">
                <span className="text-slate-500 font-medium min-w-[20px]">{orderedMatch[1]}.</span>
                <span className="text-slate-700">{orderedMatch[2]}</span>
              </div>
            )
          } else if (unorderedMatch) {
            return (
              <div key={idx} className="flex gap-2">
                <span className="text-slate-400 min-w-[20px]">•</span>
                <span className="text-slate-700">{unorderedMatch[1]}</span>
              </div>
            )
          } else {
            return <p key={idx} className="text-slate-700">{trimmedLine}</p>
          }
        })}
      </div>
    )
  }

  return (
    <div className="card-container animate-fade-in hover:shadow-card transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-semibold text-slate-900 truncate leading-tight">{project.name}</h4>
            <StatusTag status={project.status} />
            <PriorityTag priority={project.priority} />
          </div>
          <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed">{project.goal}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(project)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
            title="编辑"
          >
            <Pencil className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </button>
          <button
            onClick={() => onDelete(project)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            title="删除"
          >
            <Trash2 className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Meta info */}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.8} />
          {formatDate(project.startDate)} → {formatDate(project.endDate)}
        </span>
        {project.collaborators.length > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.8} />
            {project.collaborators.length > 2
              ? `${project.collaborators.slice(0, 2).join('、')} 等 ${project.collaborators.length} 人`
              : project.collaborators.join('、')}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
          <span className="font-medium text-slate-700">项目进度</span>
          <span className="font-semibold text-slate-900 tabular-nums">{project.progress}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${progressColor} transition-all duration-700 ease-out`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Current Task */}
      {project.currentTask && (
        <div className="mt-4 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
          <p className="text-xs text-slate-500 mb-1 font-medium">当前事项</p>
          <p className="text-sm text-slate-700 leading-relaxed">{project.currentTask}</p>
        </div>
      )}

      {/* Detail expandable */}
      {project.detail && (
        <div className="mt-3">
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="text-xs text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 font-medium transition-colors"
          >
            {showDetail ? '收起详情' : '查看详情'}
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showDetail ? 'rotate-180' : ''}`} strokeWidth={2.2} />
          </button>
          {showDetail && (
            <div className="mt-2 p-3 rounded-xl bg-slate-50/70 border border-slate-100 animate-fade-in text-sm">
              {renderDetail(project.detail)}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>最后更新 · {formatUpdateTime(project.updatedAt)}</span>
      </div>
    </div>
  )
}

/* ===========================================================
   Project Form Modal
   =========================================================== */
interface ProjectFormModalProps {
  isOpen: boolean
  onClose: () => void
  project?: ProjectItem
  onSubmit: (data: ProjectFormData) => void
}

function ProjectFormModal({ isOpen, onClose, project, onSubmit }: ProjectFormModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '', goal: '', startDate: '', endDate: '', progress: 0,
    status: 'not_started', priority: 'medium', currentTask: '',
    collaborators: [], detail: '',
  })
  const [collaboratorInput, setCollaboratorInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name, goal: project.goal, startDate: project.startDate,
        endDate: project.endDate, progress: project.progress, status: project.status,
        priority: project.priority, currentTask: project.currentTask,
        collaborators: [...project.collaborators], detail: project.detail,
      })
    } else {
      const today = new Date().toISOString().split('T')[0]
      setFormData({
        name: '', goal: '', startDate: today, endDate: '', progress: 0,
        status: 'not_started', priority: 'medium', currentTask: '',
        collaborators: [], detail: '',
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
    if (formData.progress < 0 || formData.progress > 100) newErrors.progress = '进度需在 0-100 之间'
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
      setFormData({ ...formData, collaborators: [...formData.collaborators, collaboratorInput.trim()] })
      setCollaboratorInput('')
    }
  }

  const removeCollaborator = (name: string) => {
    setFormData({ ...formData, collaborators: formData.collaborators.filter((c) => c !== name) })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? '编辑项目' : '新增项目'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit}>保存</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">项目名称 *</label>
          <input
            type="text" value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            placeholder="请输入项目名称"
          />
          {errors.name && <p className="mt-1 text-xs text-danger-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">项目目标 *</label>
          <textarea
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            rows={2}
            className="textarea-field"
            placeholder="请输入项目目标"
          />
          {errors.goal && <p className="mt-1 text-xs text-danger-600">{errors.goal}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">开始日期</label>
            <input
              type="date" value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">结束日期</label>
            <input
              type="date" value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="input-field"
            />
            {errors.endDate && <p className="mt-1 text-xs text-danger-600">{errors.endDate}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">进度 (%)</label>
            <input
              type="number" min="0" max="100" value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
              className="input-field"
            />
            {errors.progress && <p className="mt-1 text-xs text-danger-600">{errors.progress}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              className="select-field"
            >
              <option value="not_started">未开始</option>
              <option value="in_progress">进行中</option>
              <option value="at_risk">有风险</option>
              <option value="completed">已完成</option>
              <option value="paused">已暂停</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">优先级</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
            className="select-field"
          >
            <option value="high">高优先级</option>
            <option value="medium">中优先级</option>
            <option value="low">低优先级</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">协作人</label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={collaboratorInput}
              onChange={(e) => setCollaboratorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCollaborator()
                }
              }}
              className="input-field"
              placeholder="输入成员名称后回车添加"
            />
            <Button size="sm" onClick={addCollaborator}>添加</Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {formData.collaborators.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs"
              >
                <Users className="w-3 h-3" strokeWidth={2} />
                {name}
                <button
                  type="button"
                  onClick={() => removeCollaborator(name)}
                  className="ml-1 text-slate-400 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
            {formData.collaborators.length === 0 && (
              <span className="text-xs text-slate-400">暂无协作人</span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">项目详情 / 备注</label>
          <textarea
            value={formData.detail}
            onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
            rows={4}
            className="textarea-field"
            placeholder="支持换行、无序清单（- 文本）、有序清单（1. 文本）"
          />
        </div>

        {/* Hidden submit to support Enter key submit */}
        <button type="submit" className="hidden" aria-label="submit" />
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
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(false)
      const res = await getProjects()
      if (res.success) setData(res.data)
      else setError(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleRefresh = () => { fetchData(true) }

  const handleCreate = async (formData: ProjectFormData) => {
    const res = await createProject(formData)
    if (res.success) setData([res.data, ...data])
  }

  const handleEdit = async (formData: ProjectFormData) => {
    if (!editingProject) return
    const res = await updateProject(editingProject.id, formData)
    if (res.success) setData(data.map((p) => (p.id === editingProject.id ? res.data : p)))
    setEditingProject(undefined)
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    const res = await deleteProject(deleteConfirm.id)
    if (res.success) setData(data.filter((p) => p.id !== deleteConfirm.id))
    setDeleteConfirm(undefined)
  }

  const filteredData = filter === 'all' ? data : data.filter((p) => p.status === filter)
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'update') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    return b.progress - a.progress
  })

  return (
    <>
      <Card
        title="跟进项目进展"
        subtitle="统一管理你的项目状态、进度与协同人员"
        action={
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ProjectStatus | 'all')}
              className="select-field !py-1.5 !text-xs !min-w-0"
            >
              <option value="all">全部状态</option>
              <option value="not_started">未开始</option>
              <option value="in_progress">进行中</option>
              <option value="at_risk">有风险</option>
              <option value="completed">已完成</option>
              <option value="paused">已暂停</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'update' | 'progress')}
              className="select-field !py-1.5 !text-xs !min-w-0"
            >
              <option value="update">按更新时间</option>
              <option value="progress">按进度</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 transition-all duration-200"
              title="刷新"
            >
              <svg className={`w-[18px] h-[18px] ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 6.239A9 9 0 004 12c0-1.263.23-2.479.659-3.603M4.582 9H4m11.418 7H20m-1.582 0a9 9 0 01-15.356-2.761M9.582 9H4m15.356 2.239L20 9h.582M11.418 16H4m1.582 0A9 9 0 0020 12c0-1.263-.23-2.479-.659-3.603" />
              </svg>
            </button>

            <Button onClick={() => setShowForm(true)} size="sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增项目
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        ) : error ? (
          <ErrorState onRetry={handleRefresh} />
        ) : sortedData.length === 0 ? (
          <EmptyState
            message="暂无项目"
            description="点击右上角新增项目，开始追踪你的第一个项目进展"
            icon={<FolderKanban className="w-8 h-8 text-slate-300" strokeWidth={1.5} />}
            action={<Button onClick={() => setShowForm(true)}>新增项目</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sortedData.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={(p) => { setEditingProject(p); setShowForm(true) }}
                onDelete={setDeleteConfirm}
              />
            ))}
          </div>
        )}
      </Card>

      <ProjectFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingProject(undefined) }}
        project={editingProject}
        onSubmit={editingProject ? handleEdit : handleCreate}
      />

      {deleteConfirm && (
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(undefined)}
          title="确认删除"
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteConfirm(undefined)}>取消</Button>
              <Button variant="danger" onClick={handleDelete}>删除</Button>
            </>
          }
        >
          <p className="text-slate-600 leading-relaxed">
            确定要删除项目「<span className="font-semibold text-slate-900">{deleteConfirm.name}</span>」吗？此操作不可恢复。
          </p>
        </Modal>
      )}
    </>
  )
}
