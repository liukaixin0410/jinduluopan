# 进度罗盘 - 部署指南

## 🚀 方式一：直接运行（最简单）

```bash
# 1. 安装依赖
npm install

# 2. 构建前端
npm run build

# 3. 启动生产服务器
npm start
# 访问 http://localhost:3000
```

## 🐳 方式二：Docker 部署

```bash
# 构建镜像
docker build -t jinduluopan .

# 运行容器
docker run -d -p 80:3000 --name jinduluopan jinduluopan

# 查看状态
docker ps
docker logs jinduluopan
```

## 📦 方式三：Docker Compose

```bash
docker-compose up -d --build
```

## ☁️ 方式四：Vercel 部署

```bash
npm install -g vercel
vercel --prod
```

（注意：Vercel 的 serverless 函数可能无法访问某些 RSS 源）

## 📊 功能模块

- ✅ **投流数据播报** - 实时风神看板嵌入
- ✅ **项目进展** - Firebase/localStorage 存储
- ✅ **今日 Todo** - Firebase/localStorage 存储
- ✅ **科技新闻动态** - 实时 RSS 抓取（30 条）

## 🔧 生产环境 API

| 接口 | 说明 |
|------|------|
| `GET /api/news?category=all&count=30` | 获取新闻列表 |
| `GET /api/health` | 健康检查 |

## 📝 注意事项

1. **Firebase**：生产环境建议配置 Firebase（见 .env.example），否则使用浏览器 localStorage
2. **RSS API**：服务器端抓取，受网络环境影响
3. **数据持久化**：Todo/项目数据默认存储在用户浏览器 localStorage 中
