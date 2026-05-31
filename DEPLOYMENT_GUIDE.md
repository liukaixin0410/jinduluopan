# 部署指南

## 🚀 一键部署到 Vercel

### 方式一：通过 Vercel 网站部署（推荐）

1. **推送代码到 GitHub/GitLab/Bitbucket
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <你的仓库地址>
   git push -u origin main
   ```

2. **登录 [Vercel](https://vercel.com)

3. **导入项目**
   - 点击 "New Project"
   - 选择刚才推送的仓库
   - 点击 "Import"

4. **配置项目**
   - 项目名称：自定义（如：jinduluopan）
   - 框架预设：Vite
   - 根目录：./
   - 构建命令：`npm run build`
   - 输出目录：`dist`

5. **部署！**
   - 点击 "Deploy"
   - 等待几分钟即可完成！

### 方式二：通过 Vercel CLI 部署

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   cd /Users/liukaixin/Documents/trae_projects/jinduluopan
   vercel
   ```

4. **按照提示操作**
   - Set up and deploy? `Y
   - Link to existing project? `N`
   - Project name: 自定义（如：jinduluopan）
   - In which directory is your code located? `./`
   - Want to modify these settings? `N`

5. **生产环境部署**
   ```bash
   vercel --prod
   ```

## 📝 环境变量

部署时需要在 Vercel 项目设置中配置环境变量：

**Settings → Environment Variables

```
（本项目不需要额外的环境变量）
```

## 🎯 项目特性

✅ **自动部署**：每次 Git 推送自动触发部署
✅ **自动缩放**：Vercel 自动处理 Serverless Functions
✅ **实时新闻**：RSS 自动抓取 TechCrunch、The Verge、MIT 等
✅ **自定义域名**：可在 Vercel 设置中添加

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 启动前端开发服务器
npm run dev

# 同时启动前端 + RSS API (真实新闻)
npm run api:rss & npm run dev
```

## 📊 构建状态

- **API 路由**：`/api/news` - RSS 新闻抓取
- **主路由**：`/` - React 应用

## 💡 注意事项

1. 确保你的代码仓库是公开或私有的
2. Vercel 免费版足够个人使用
3. Serverless Functions 自动处理 API 请求
4. 每次 push 到 main 分支会自动部署
