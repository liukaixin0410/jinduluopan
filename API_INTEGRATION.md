# 个人工作台 Dashboard - API 集成指南

## 📋 目录

1. [项目概述](#项目概述)
2. [快速开始](#快速开始)
3. [切换真实接口](#切换真实接口)
4. [接口规范](#接口规范)
5. [模块说明](#模块说明)
6. [常见问题](#常见问题)

---

## 项目概述

这是一个基于 React + TypeScript 的个人工作台 Dashboard，包含四个核心模块：

- 投流数据播报
- 项目进展跟踪
- 科技新闻动态
- 今日 Todo 管理

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 即可看到页面。

---

## 切换真实接口

### 步骤 1: 修改配置

打开 `/src/services/dashboard.ts`，找到第 36 行：

```typescript
// 将 true 改为 false
const USE_MOCK = false
```

### 步骤 2: 配置 API 路径

修改第 39 行的 API_BASE 为真实的后端地址：

```typescript
const API_BASE = 'https://your-api-domain.com/api/dashboard'
```

### 步骤 3: 完成！

就是这么简单！组件层无需任何修改，因为：

- Service 层与组件层完全解耦
- 统一的接口格式契约
- 类型安全的 TypeScript 定义

---

## 接口规范

### 通用响应格式

所有接口必须遵循以下响应格式：

```typescript
{
  success: boolean      // 请求是否成功
  data?: T             // 数据内容（success=true 时返回）
  message?: string     // 错误信息（success=false 时返回）
}
```

### 状态码建议

| 状态码 | 说明 |
|--------|------|
| 200    | 成功 |
| 400    | 请求参数错误 |
| 401    | 未授权 |
| 403    | 禁止访问 |
| 404    | 资源不存在 |
| 500    | 服务器错误 |

---

## 模块说明

### 1. 投流数据模块

#### 获取投流数据概览
```
GET /api/dashboard/ads-summary
```

响应数据结构：
```typescript
{
  success: true,
  data: {
    date: string,
    sourceName: string,
    metrics: Array<{
      name: string,
      value: string | number,
      trend: 'up' | 'down' | 'flat',
      change: string
    }>,
    summary: string,
    attributions: string[],
    updatedAt: string
  }
}
```

#### 获取投流配置
```
GET /api/dashboard/ads-summary/config
```

---

### 2. 项目进展模块

#### 获取项目列表
```
GET /api/dashboard/projects
```

#### 创建新项目
```
POST /api/dashboard/projects
Content-Type: application/json

{
  name: string,
  goal: string,
  startDate: string,
  endDate: string,
  progress: number,
  status: 'not_started' | 'in_progress' | 'at_risk' | 'completed' | 'paused',
  currentTask?: string,
  collaborators: string[],
  detail?: string
}
```

#### 更新项目
```
PUT /api/dashboard/projects/:id
Content-Type: application/json

{
  // 同创建接口的字段
}
```

#### 删除项目
```
DELETE /api/dashboard/projects/:id
```

---

### 3. 科技新闻模块

#### 获取新闻列表
```
GET /api/dashboard/news?category=:category
```

category 可选值：`all` | `ai` | `tech` | `finance`

响应数据结构：
```typescript
{
  success: true,
  data: Array<{
    id: string,
    title: string,
    summary: string,
    category: string,
    sourceName: string,
    sourceUrl: string,
    imageUrl: string,
    publishedAt: string,
    createdAt: string
  }>
}
```

---

### 4. 今日 Todo 模块

#### 获取 Todo 列表
```
GET /api/dashboard/todos?date=:date
```

date 格式：`YYYY-MM-DD`

#### 创建 Todo
```
POST /api/dashboard/todos
Content-Type: application/json

{
  date: string,
  content: string,
  priority: 'high' | 'medium' | 'low',
  status: 'todo' | 'doing' | 'done',
  remark?: string
}
```

#### 更新 Todo
```
PUT /api/dashboard/todos/:id
Content-Type: application/json

{
  // 同创建接口的字段
}
```

#### 更新 Todo 状态
```
PATCH /api/dashboard/todos/:id/status
Content-Type: application/json

{
  status: 'todo' | 'doing' | 'done'
}
```

#### 删除 Todo
```
DELETE /api/dashboard/todos/:id
```

---

## 常见问题

### Q: 如何自定义 mock 数据？

A: 编辑 `/src/mock/dashboard.ts` 文件即可。

### Q: 接口请求需要认证怎么办？

A: 在 service 层的 fetch 请求中添加认证 headers，例如：

```typescript
const res = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Q: 需要使用 axios 替代 fetch 吗？

A: 可以！在 service 层替换请求库即可，组件层无需修改。

### Q: 如何添加错误处理？

A: 可以在 service 层统一添加 try-catch，或者在组件层处理。

---

## 文件结构说明

```
src/
├── components/
│   ├── Layout.tsx                    # 布局组件
│   └── dashboard/
│       ├── shared/                   # 通用组件
│       │   ├── Card.tsx
│       │   └── Modal.tsx
│       ├── AdsSummaryPanel.tsx       # 投流数据模块
│       ├── ProjectProgressPanel.tsx  # 项目进展模块
│       ├── NewsPanel.tsx             # 新闻模块
│       └── TodoPanel.tsx             # Todo 模块
├── types/
│   └── dashboard.ts                  # TypeScript 类型定义
├── mock/
│   └── dashboard.ts                  # Mock 数据
├── services/
│   └── dashboard.ts                  # API 服务层
├── pages/
│   ├── Dashboard.tsx                 # 主页面
│   ├── AdsSummary.tsx                # 投流数据页面
│   ├── Projects.tsx                  # 项目页面
│   ├── News.tsx                      # 新闻页面
│   └── Todos.tsx                     # Todo 页面
└── App.tsx                           # 路由配置
```

---

## 技术栈

- React 18
- TypeScript
- React Router 6
- Tailwind CSS
- Vite

---

## 联系方式

如有问题，请联系开发团队。
