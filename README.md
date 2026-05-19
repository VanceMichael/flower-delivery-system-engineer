# 鲜花配送管理系统

## 项目结构

```
├── backend/          # Node.js Express 后端 (CommonJS)
├── frontend/         # Vue 3 + Vant 前端 (ESM)
├── .github/          # GitHub Actions CI
├── package.json      # Monorepo 根 (npm workspaces)
├── eslint.config.mjs # 共享 ESLint 基础规则
└── .prettierrc       # Prettier 统一配置
```

## 本地开发环境配置

### 前置要求

- Node.js >= 18
- npm >= 9
- MongoDB >= 6.0 (或使用 Docker Compose)

### 1. 安装依赖

```bash
# 在根目录一次性安装前后端所有依赖
npm install
```

### 2. 配置后端环境变量

```bash
cd backend
cp .env.example .env
```

编辑 `backend/.env`，填入实际值：

| 变量名        | 说明                             | 示例值                                      |
| ------------- | -------------------------------- | ------------------------------------------- |
| `PORT`        | 后端服务端口                     | `3000`                                      |
| `MONGODB_URI` | MongoDB 连接地址                 | `mongodb://localhost:27017/flower-delivery` |
| `JWT_SECRET`  | JWT 签名密钥（生产环境务必更换） | `your-secret-key-here`                      |
| `NODE_ENV`    | 运行环境                         | `development`                               |

### 3. 启动服务

```bash
# 使用 Docker Compose 启动 MongoDB + 后端 + 前端
docker compose up -d

# 或者分别启动开发服务器
npm run dev --workspace=backend   # 后端 http://localhost:3000
npm run dev --workspace=frontend  # 前端 http://localhost:5173
```

## 常用脚本

| 命令                               | 说明                     |
| ---------------------------------- | ------------------------ |
| `npm run lint`                     | 对前后端执行 ESLint 检查 |
| `npm run test`                     | 对前后端执行测试         |
| `npm run build`                    | 构建前端 (vite build)    |
| `npm run dev --workspace=backend`  | 启动后端开发服务器       |
| `npm run dev --workspace=frontend` | 启动前端开发服务器       |

## CI Pipeline

项目使用 GitHub Actions 自动化 CI，详见 `.github/workflows/ci.yml`。
