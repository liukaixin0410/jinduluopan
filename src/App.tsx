import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AdsSummary } from './pages/AdsSummary'
import { Projects } from './pages/Projects'
import { News } from './pages/News'
import { Todos } from './pages/Todos'

function App() {
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
