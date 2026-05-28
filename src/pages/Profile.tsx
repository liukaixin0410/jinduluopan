import { useState } from 'react'
import { Bell, Shield, Database, HelpCircle, LogOut, Upload, FileText, FolderOpen, Edit2, Save, X } from 'lucide-react'
import { useUser } from '../context/UserContext'

export function Profile() {
  const { user, updateUser } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ ...user })

  const handleEdit = () => {
    setEditForm({ ...user })
    setIsEditing(true)
  }

  const handleSave = () => {
    updateUser(editForm)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({ ...user })
  }

  const handleUploadDocs = () => {
    alert('上传文档功能已触发！\n（这是演示功能，实际的文件上传功能可以进一步扩展')
  }

  const handleMeetingNotes = () => {
    alert('会议纪要功能已触发！\n（这是演示功能，实际的会议纪要功能可以进一步扩展')
  }

  const handleBatchImport = () => {
    alert('批量导入功能已触发！\n（这是演示功能，实际的批量导入功能可以进一步扩展')
  }

  const handleNotifications = () => {
    alert('通知设置功能已触发！\n（这是演示功能，实际的通知设置功能可以进一步扩展')
  }

  const handlePrivacy = () => {
    alert('隐私设置功能已触发！\n（这是演示功能，实际的隐私设置功能可以进一步扩展')
  }

  const handleDataManagement = () => {
    alert('数据管理功能已触发！\n（这是演示功能，实际的数据管理功能可以进一步扩展')
  }

  const handleHelp = () => {
    alert('帮助与反馈功能已触发！\n（这是演示功能，实际的帮助功能可以进一步扩展')
  }

  const handleLogout = () => {
    alert('退出登录功能已触发！\n（这是演示功能，实际的退出登录功能可以进一步扩展')
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] p-8 pb-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">我的</h1>
            <p className="text-[#6B7280] mt-1">管理你的个人信息和偏好设置</p>
          </div>
          {!isEditing ? (
            <button 
              onClick={handleEdit}
              className="px-6 py-3 bg-[#5B6CFF] text-white rounded-2xl font-medium hover:bg-[#4A5CE8] transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-lg shadow-[#5B6CFF]/25"
            >
              <Edit2 className="w-5 h-5" />
              编辑资料
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={handleCancel}
                className="px-6 py-3 bg-[#F7F8FC] text-[#6B7280] rounded-2xl font-medium hover:bg-[#E5E7EB] transition-all duration-200 flex items-center gap-2 cursor-pointer border border-[#E5E7EB]"
              >
                <X className="w-5 h-5" />
                取消
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-3 bg-[#10B981] text-white rounded-2xl font-medium hover:bg-[#0DA270] transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-lg shadow-[#10B981]/25"
              >
                <Save className="w-5 h-5" />
                保存
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-8 border border-[#E5E7EB] shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[#5B6CFF] to-[#8B5CF6] rounded-full flex items-center justify-center text-4xl shadow-lg shadow-[#5B6CFF]/20">
              {isEditing ? (
                <div className="relative group">
                  <span>{user.avatar}</span>
                  <button 
                    onClick={() => alert('头像上传功能已触发！')}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg border border-[#E5E7EB]"
                  >
                    <Upload className="w-5 h-5 text-[#5B6CFF]" />
                  </button>
                </div>
              ) : (
                <span>{user.avatar}</span>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-2xl font-bold text-[#111827] bg-[#F7F8FC] border border-[#E5E7EB] rounded-xl px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30"
                  placeholder="姓名"
                />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={editForm.position}
                      onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                      className="text-[#6B7280] bg-[#F7F8FC] border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30"
                      placeholder="职位"
                    />
                    <input
                      type="text"
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      className="text-[#6B7280] bg-[#F7F8FC] border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30"
                      placeholder="部门"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-[#111827]">{user.name}</h2>
                  <p className="text-[#6B7280]">{user.position} · {user.department}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-[#9CA3AF]">📧</div>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="text-[#6B7280] bg-[#F7F8FC] border border-[#E5E7EB] rounded-xl px-4 py-2.5 flex-1 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30"
                    placeholder="邮箱"
                  />
                ) : (
                  <span className="text-[#6B7280]">{user.email}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-[#9CA3AF]">📱</div>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="text-[#6B7280] bg-[#F7F8FC] border border-[#E5E7EB] rounded-xl px-4 py-2.5 flex-1 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30"
                    placeholder="电话"
                  />
                ) : (
                  <span className="text-[#6B7280]">{user.phone}</span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[#111827] mb-3">个人简介</h3>
            {isEditing ? (
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full min-h-[100px] text-[#6B7280] bg-[#F7F8FC] border border-[#E5E7EB] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF]/30"
                placeholder="个人简介"
              />
            ) : (
              <p className="text-[#6B7280] leading-relaxed">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <button 
            onClick={handleUploadDocs}
            className="p-7 bg-white border border-[#E5E7EB] rounded-3xl hover:border-[#5B6CFF]/20 hover:bg-[#5B6CFF]/5 transition-all cursor-pointer flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="w-14 h-14 bg-[#5B6CFF]/10 rounded-2xl flex items-center justify-center">
              <Upload className="w-7 h-7 text-[#5B6CFF]" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[#111827]">上传文档</h3>
              <p className="text-[#6B7280] text-sm mt-1">上传和管理你的文档</p>
            </div>
          </button>

          <button 
            onClick={handleMeetingNotes}
            className="p-7 bg-white border border-[#E5E7EB] rounded-3xl hover:border-[#10B981]/20 hover:bg-[#10B981]/5 transition-all cursor-pointer flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="w-14 h-14 bg-[#10B981]/10 rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-[#10B981]" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[#111827]">会议纪要</h3>
              <p className="text-[#6B7280] text-sm mt-1">查看和管理会议记录</p>
            </div>
          </button>

          <button 
            onClick={handleBatchImport}
            className="p-7 bg-white border border-[#E5E7EB] rounded-3xl hover:border-[#8B5CF6]/20 hover:bg-[#8B5CF6]/5 transition-all cursor-pointer flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="w-14 h-14 bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center">
              <FolderOpen className="w-7 h-7 text-[#8B5CF6]" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[#111827]">批量导入</h3>
              <p className="text-[#6B7280] text-sm mt-1">批量导入数据和内容</p>
            </div>
          </button>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-3xl p-8 border border-[#E5E7EB] shadow-sm">
          <h2 className="text-xl font-bold text-[#111827] mb-6">设置</h2>
          <div className="space-y-2">
            <button 
              onClick={handleNotifications}
              className="w-full p-5 hover:bg-[#F7F8FC] rounded-2xl flex items-center justify-between cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#5B6CFF]/10 rounded-2xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-[#5B6CFF]" />
                </div>
                <span className="text-[#111827] font-medium">通知设置</span>
              </div>
              <div className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#5B6CFF] transition-colors">→</div>
            </button>

            <button 
              onClick={handlePrivacy}
              className="w-full p-5 hover:bg-[#F7F8FC] rounded-2xl flex items-center justify-between cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <span className="text-[#111827] font-medium">隐私设置</span>
              </div>
              <div className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#8B5CF6] transition-colors">→</div>
            </button>

            <button 
              onClick={handleDataManagement}
              className="w-full p-5 hover:bg-[#F7F8FC] rounded-2xl flex items-center justify-between cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-2xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <span className="text-[#111827] font-medium">数据管理</span>
              </div>
              <div className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#F59E0B] transition-colors">→</div>
            </button>

            <button 
              onClick={handleHelp}
              className="w-full p-5 hover:bg-[#F7F8FC] rounded-2xl flex items-center justify-between cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#10B981]/10 rounded-2xl flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-[#10B981]" />
                </div>
                <span className="text-[#111827] font-medium">帮助与反馈</span>
              </div>
              <div className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#10B981] transition-colors">→</div>
            </button>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full px-6 py-5 bg-[#EF4444]/5 text-[#EF4444] rounded-3xl hover:bg-[#EF4444]/10 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#EF4444]/20 font-medium"
        >
          <LogOut className="w-5 h-5" />
          退出登录
        </button>
      </div>
    </div>
  )
}
