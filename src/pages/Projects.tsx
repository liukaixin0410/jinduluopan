import { ProjectProgressPanel } from '../components/dashboard/ProjectProgressPanel'

export function Projects() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">跟进项目进展</h1>
          <p className="text-gray-500 mt-1">项目全生命周期管理，进度一目了然</p>
        </div>
        <ProjectProgressPanel />
      </div>
    </div>
  )
}
