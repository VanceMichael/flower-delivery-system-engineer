# 鲜花配送管理系统

鲜花配送管理系统 - Monorepo 版本

## 技术栈

- **后端**: Node.js + Express + MongoDB (Mongoose)
- **前端**: Vue 3 + Vant + Vite
- **数据库**: MongoDB 6.0

## 项目结构

```
flower-delivery-system/
├── backend/           # 后端服务
│   └── src/
│       ├── config/    # 数据库配置
│       ├── controllers/ # 控制器
│       ├── middlewares/ # 中间件
│       ├── models/    # 数据模型
│       ├── routes/    # 路由
│       ├── services/  # 服务
│       ├── utils/     # 工具
│       └── app.js     # 入口
├── frontend/          # 前端应用
│   └── src/
│       ├── api/       # API 封装
│       ├── components/ # 组件
│       ├── router/    # 路由
│       ├── store/     # 状态管理
│       ├── styles/    # 样式
│       ├── views/     # 页面
│       └── main.js    # 入口
├── docker-compose.yml # Docker 编排
└── package.json       # Monorepo 根配置
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9
- Docker & Docker Compose (可选)

### 1. 安装依赖

```bash
npm install
```

Monorepo 使用 npm workspaces，执行根目录的 `npm install` 会自动为 `backend` 和 `frontend` 两个子包安装依赖并建立软链接。

### 2. 配置环境变量 (后端)

后端使用 `.env` 文件管理环境变量，`.env.example` 中列出了所有需要的变量但不含真实值。

```bash
cp backend/.env.example backend/.env
```

然后根据你的本地环境修改 `backend/.env` 文件。

#### 环境变量说明

| 变量名        | 必填 | 说明                                             | 默认值                                      |
| ------------- | ---- | ------------------------------------------------ | ------------------------------------------- |
| `PORT`        | 否   | 后端服务监听端口                                 | `3000`                                      |
| `MONGODB_URI` | 是   | MongoDB 连接地址                                 | `mongodb://localhost:27017/flower-delivery` |
| `JWT_SECRET`  | 是   | JWT 签名密钥，生产环境务必修改为强随机值         | `change-me-to-a-strong-random-secret`       |
| `NODE_ENV`    | 否   | 运行环境 (`development` / `production` / `test`) | `development`                               |

### 3. 启动服务

#### Docker Compose 方式 (推荐)

```bash
docker compose up -d
```

访问地址:

- 前端: http://localhost
- 后端 API: http://localhost:3000/api

#### 本地开发方式

1. 启动 MongoDB (需本地已安装 MongoDB 或使用 Docker):

```bash
docker run -d --name mongodb -p 27017:27017 mongo:6.0
```

2. 启动后端:

```bash
npm run dev -w backend
```

3. 启动前端:

```bash
npm run dev -w frontend
```

### 4. 种子数据

后端首次启动时会自动初始化以下演示数据:

- 管理员 / 普通用户 / 配送员账号
- 商品数据 (玫瑰、康乃馨、向日葵等)
- 贺卡模板
- 节日营销活动
- 配送员信息

默认用户密码均为 `123456`。

## 常用脚本

| 命令                      | 说明                               |
| ------------------------- | ---------------------------------- |
| `npm run lint`            | 对前后端执行 ESLint 检查           |
| `npm run lint:backend`    | 仅对后端执行 ESLint 检查           |
| `npm run lint:frontend`   | 仅对前端执行 ESLint 检查           |
| `npm run test`            | 运行前后端测试                     |
| `npm run build`           | 构建前端并验证后端 (无 build 步骤) |
| `npm run format`          | Prettier 格式化所有文件            |
| `npm run format:check`    | Prettier 检查格式                  |
| `npm run dev -w backend`  | 启动后端开发服务器                 |
| `npm run dev -w frontend` | 启动前端开发服务器                 |

## API 接口

| 模块     | 路径前缀                  |
| -------- | ------------------------- |
| 认证     | `/api/auth`               |
| 商品     | `/api/products`           |
| 订单     | `/api/orders`             |
| 购物车   | `/api/carts`              |
| 配送     | `/api/delivery`           |
| 贺卡     | `/api/greeting-cards`     |
| 节日营销 | `/api/holiday-promotions` |

## CI/CD

项目使用 GitHub Actions 作为 CI Pipeline，流程如下:

- **install-and-lint**: 安装依赖 + 前后端 lint 检查 (并行)
- **backend-test**: 运行后端单测 (依赖 lint 通过)
- **frontend-build**: 前端构建验证 (依赖 lint 通过)
- **docker-build**: Docker 镜像构建验证 (依赖 test + build 通过)
