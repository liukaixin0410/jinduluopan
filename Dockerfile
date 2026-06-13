# ===== 构建阶段 =====
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖（包括 devDependencies 用于构建）
RUN npm install

# 复制源码
COPY . .

# 构建前端
RUN npm run build

# ===== 生产阶段 =====
FROM node:18-alpine AS production

WORKDIR /app

# 设置生产环境
ENV NODE_ENV=production
ENV PORT=3000

# 复制 package 文件（只安装生产依赖）
COPY package*.json ./

# 只安装生产依赖
RUN npm install --production

# 复制构建产物和生产服务器
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
COPY local-api-server.js ./

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# 启动服务器
CMD ["node", "server.js"]
