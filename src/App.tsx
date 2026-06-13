import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AdsSummary } from './pages/AdsSummary'
import { Projects } from './pages/Projects'
import { News } from './pages/News'
import { Todos } from './pages/Todos'
import { initFirebase } from './config/firebase'

function App() {
  // 应用启动时初始化 Firebase
  useEffect(() => {
    console.log('🚀 应用启动，正在初始化 Firebase...')
    initFirebase().then((db) => {
      if (db) {
        console.log('✅ Firebase 存储连接成功，可以开始保存数据了！')
      } else {
        console.log('⚠️ Firebase 未连接，将使用本地存储')
      }
    }).catch((err) => {
      console.error('❌ Firebase 初始化异常:', err)
    })
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/ads-summary" replace />} />
          <Route path="ads-summary" element={<AdsSummary />} />
          <Route path="projects" element={<Projects />} />
          <Route path="news" element={<News />} />
          <Route path="todos" element={<Todos />} />
          <Route path="*" element={<Navigate to="/ads-summary" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
