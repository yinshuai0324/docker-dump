# Docker 镜像管理系统

本项目为基于 Vue3 + Element Plus + Node.js + Docker 的 Web 镜像管理平台，支持镜像搜索、拉取、推送到私有仓库，支持用户登录和私有仓库认证。

---

## 功能简介
- Web 界面搜索 DockerHub 镜像
- 一键拉取并推送到自定义私有仓库
- 支持私有仓库用户名/密码配置与登录校验
- 用户登录鉴权
- 一键 Docker 部署

---

## 一键 Docker 部署

### 1. 构建镜像
在项目根目录下执行：

```sh
docker build -t docker-dump-app .
```

### 2. 运行容器

```sh
docker run -d -p 8080:8080 -p 8081:8081 --name docker-dump \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e ADMIN_USER=admin \
  -e ADMIN_PASS=admin123 \
  docker-dump-app
```

- 访问 http://localhost:8080 即可打开 Web 界面
- 默认登录账号和密码可通过环境变量 `ADMIN_USER` 和 `ADMIN_PASS` 配置（如未设置，默认为 admin / admin123）
- **注意：容器已集成 Docker CLI，需挂载宿主机的 `/var/run/docker.sock`，否则无法执行镜像拉取/推送等操作**

---

## 本地开发（可选）

### 1. 安装依赖
分别进入 frontend 和 backend 目录执行：

```sh
cd frontend && npm install
cd ../backend && npm install
```

### 2. 启动后端

```sh
cd backend
npm start
```

### 3. 启动前端

```sh
cd ../frontend
npm run dev
```

前端默认端口 8080，后端 8081。

---

## 目录结构

```
docker-dump/
├── backend/           # Node.js 后端
├── frontend/          # Vue3 前端
├── Dockerfile         # Docker 构建文件
├── nginx.conf         # Nginx 配置
├── docker-entrypoint.sh # 容器启动脚本
└── README.md
```

---

## 常见问题
- 如需自定义端口，请修改 Dockerfile/启动命令及 nginx.conf
- 容器内 Node 版本为 18，前端/后端均已自动构建
- 镜像推送需保证私有仓库地址、用户名、密码正确
- 默认登录账号密码可通过 Docker 环境变量 `ADMIN_USER` 和 `ADMIN_PASS` 配置

---

如有更多需求或问题，欢迎反馈！
