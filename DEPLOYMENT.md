# 项目生产环境部署文档

## 1. 项目概述

本项目是一个基于 React + TypeScript + Vite 的投流数据看板应用，主要功能包括：
- 投流数据播报与分析
- 项目进度管理
- 待办事项管理
- 科技新闻展示

### 技术栈
| 分类 | 技术 | 版本 |
|------|------|------|
| 框架 | React | ^18.2.0 |
| 语言 | TypeScript | ^5.3.3 |
| 构建工具 | Vite | ^5.1.3 |
| 样式 | Tailwind CSS | ^3.4.1 |
| 图标 | Lucide React | ^0.344.0 |
| 路由 | React Router DOM | ^6.22.0 |

---

## 2. 部署环境要求

### 硬件要求
| 环境 | CPU | 内存 | 存储 |
|------|-----|------|------|
| 开发环境 | 2核 | 4GB | 10GB |
| 生产环境（单节点） | 4核 | 8GB | 20GB |

### 软件要求
| 软件 | 版本 | 说明 |
|------|------|------|
| Node.js | >= 18.0.0 | 构建依赖 |
| npm | >= 9.0.0 | 包管理器 |
| Git | >= 2.0.0 | 版本控制 |

---

## 3. 部署前准备

### 3.1 代码获取

```bash
# 克隆代码仓库
git clone <repository-url>
cd jinduluopan

# 安装依赖
npm install

# 验证依赖安装
npm list
```

### 3.2 环境变量配置

创建 `.env` 文件（生产环境建议使用服务器环境变量）：

```env
# 风神API配置（生产环境使用真实接口）
FENGSHEN_API_BASE=https://your-fengshen-api.com/api

# 应用基础路径（部署到子目录时设置）
VITE_APP_BASE=/

# 数据源配置
VITE_USE_MOCK=false
```

### 3.3 构建验证

```bash
# 运行构建命令
npm run build

# 验证构建产物
ls -la dist/
```

构建成功后会生成以下文件：
- `dist/index.html` - 入口HTML文件
- `dist/assets/index-*.css` - 样式文件
- `dist/assets/index-*.js` - 主应用脚本

---

## 4. 部署方式

### 4.1 Nginx 部署（推荐）

#### 4.1.1 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y
```

#### 4.1.2 创建配置文件

```bash
sudo mkdir -p /var/www/jinduluopan
sudo chown -R www-data:www-data /var/www/jinduluopan

# 复制构建产物
sudo cp -r dist/* /var/www/jinduluopan/
```

创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/jinduluopan
```

配置内容：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/jinduluopan;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
    gzip_min_length 1024;

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
}
```

#### 4.1.3 启用站点并重启

```bash
sudo ln -s /etc/nginx/sites-available/jinduluopan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4.2 Vercel 部署

#### 4.2.1 通过 Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

#### 4.2.2 通过 Git 自动部署

1. 推送代码到 GitHub/GitLab
2. 在 Vercel 控制台添加项目
3. 配置构建命令：`npm run build`
4. 配置输出目录：`dist`

### 4.3 Netlify 部署

1. 登录 Netlify 控制台
2. 选择 "New site from Git"
3. 连接 GitHub/GitLab 仓库
4. 配置：
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 点击 "Deploy site"

### 4.4 Docker 容器部署

#### 4.4.1 创建 Dockerfile

```dockerfile
# 使用 Node.js 构建
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 使用 Nginx 作为运行时
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 4.4.2 创建 nginx.conf

```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

#### 4.4.3 构建并运行

```bash
# 构建镜像
docker build -t jinduluopan .

# 运行容器
docker run -d -p 80:80 --name jinduluopan jinduluopan
```

---

## 5. 配置说明

### 5.1 API 数据源配置

修改 `src/services/dashboard.ts` 中的配置：

```typescript
// 是否使用 Mock 数据（生产环境建议设置为 false）
const USE_MOCK = false

// 风神 API 基础路径
const FENGSHEN_API_BASE = 'https://your-fengshen-api.com/api'
```

### 5.2 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| FENGSHEN_API_BASE | 风神API地址 | - |
| VITE_APP_BASE | 应用基础路径 | / |

### 5.3 缓存策略

建议配置以下缓存策略：
- HTML 文件：不缓存或短时间缓存
- CSS/JS 文件：长期缓存（文件名带哈希）
- 静态资源：CDN加速

---

## 6. 启动与验证

### 6.1 启动服务

```bash
# Nginx 启动
sudo systemctl start nginx
sudo systemctl enable nginx

# Docker 启动
docker start jinduluopan
```

### 6.2 服务验证

```bash
# 检查服务状态
curl -I http://localhost

# 验证返回状态码
curl -s -o /dev/null -w "%{http_code}" http://localhost
# 期望输出：200
```

### 6.3 功能验证

访问应用后验证以下功能：
- ✅ 投流数据面板正常显示
- ✅ 项目进度列表正常加载
- ✅ 待办事项功能正常
- ✅ 新闻列表正常显示
- ✅ Pugc 投流项目存在（进度20%）

---

## 7. 运维与监控

### 7.1 日志管理

```bash
# Nginx 访问日志
tail -f /var/log/nginx/access.log

# Nginx 错误日志
tail -f /var/log/nginx/error.log

# Docker 容器日志
docker logs -f jinduluopan
```

### 7.2 性能监控

建议配置以下监控：
- CPU/内存使用率
- 响应时间
- 错误率
- 访问量统计

### 7.3 健康检查

创建健康检查接口或使用外部监控服务：

```bash
# 定期健康检查
curl -f http://your-domain.com/ || echo "Service down"
```

---

## 8. 部署检查清单

- [ ] 代码已拉取到目标服务器
- [ ] 依赖已安装
- [ ] 环境变量已配置
- [ ] 构建已成功完成
- [ ] Nginx/Docker 配置已完成
- [ ] 服务已启动
- [ ] 端口已开放（80/443）
- [ ] SSL证书已配置（生产环境）
- [ ] 功能验证通过

---

## 9. 故障排查

### 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 404 错误 | 路由配置问题 | 检查 Nginx try_files 配置 |
| 空白页面 | JS 加载失败 | 检查资源路径和权限 |
| API 请求失败 | CORS 问题 | 配置反向代理或 CORS |
| 构建失败 | 依赖缺失 | 重新安装依赖 |

---

## 附录：CI/CD 配置示例（GitHub Actions）

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to Server
      uses: easingthemes/ssh-deploy@v5.0.1
      with:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        ARGS: '-avz --delete'
        SOURCE: 'dist/'
        REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
        REMOTE_USER: ${{ secrets.REMOTE_USER }}
        TARGET: '/var/www/jinduluopan'
```

---

**文档版本**: v1.0  
**创建日期**: 2026-05-28  
**适用项目**: jinduluopan