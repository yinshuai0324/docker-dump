# 多阶段构建：前端构建+后端部署

# 1. 构建前端
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 2. 构建后端
FROM node:18 AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# 3. 生产镜像，使用 nginx 服务前端，node 服务后端
FROM node:18 AS prod
WORKDIR /app

# 拷贝后端
COPY --from=backend-build /app/backend ./backend

# 拷贝前端静态文件到 nginx
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# 安装 nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# 安装 docker CLI
RUN apt-get update && apt-get install -y docker.io && rm -rf /var/lib/apt/lists/*

# 配置 nginx 静态服务
RUN rm -rf /var/www/html && ln -s /app/frontend/dist /var/www/html
COPY nginx.conf /etc/nginx/nginx.conf

# 启动脚本
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8080 8081
ENTRYPOINT ["/docker-entrypoint.sh"]
