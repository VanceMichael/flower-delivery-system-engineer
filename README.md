# Flower Delivery System

鲜花配送管理系统 - 基于 Node.js Express + MongoDB + Vue 3 的全栈应用。

## 工程化特性

- **Monorepo**: 使用 npm workspaces 统一管理前后端依赖
- **ESLint 9**: Flat Config 格式，前后端共享基础规则
- **Prettier**: 统一代码格式化
- **Husky + lint-staged**: Git 提交前自动 lint 和 format
- **GitHub Actions CI**: 自动化测试、构建、Docker 镜像验证

## 项目结构

```
flower-delivery-system/
├── backend/          # Node.js Express 后端
├── frontend/         # Vue 3 + Vite 前端
├── .github/workflows/  # CI Pipeline
├── package.json      # Monorepo 根配置
├── eslint.config.mjs # ESLint 共享基础规则
└── .prettierrc       # Prettier 统一配置
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9
- MongoDB >= 6.0

### 本地开发

1. **安装依赖**（根目录执行，自动安装前后端所有依赖）

```bash
npm install
```

2. **配置环境变量**

复制后端环境变量示例文件并修改：

```bash
cp backend/.env.example backend/.env
```

环境变量说明：

| 变量名      | 说明             | 示例值                                    |
| ----------- | ---------------- | ----------------------------------------- |
| PORT        | 后端服务端口     | 3000                                      |
| MONGODB_URI | MongoDB 连接地址 | mongodb://localhost:27017/flower-delivery |
| JWT_SECRET  | JWT 签名密钥     | your-secret-key-here-change-in-production |
| NODE_ENV    | 运行环境         | development / production                  |

3. **启动 MongoDB**

使用 Docker 启动：

```bash
docker compose up -d mongodb
```

或使用本地 MongoDB 服务。

4. **启动开发服务**

```bash
# 启动后端（端口 3000）
npm run dev --workspace=backend

# 启动前端（端口 5173）
npm run dev --workspace=frontend
```

### 常用脚本

| 命令               | 说明                     |
| ------------------ | ------------------------ |
| `npm run lint`     | 对前后端执行代码检查     |
| `npm run lint:fix` | 自动修复 lint 错误       |
| `npm run test`     | 运行测试                 |
| `npm run build`    | 构建生产版本             |
| `npm run format`   | 使用 Prettier 格式化代码 |

### Docker 部署

```bash
# 构建并启动所有服务
docker compose up -d

# 仅构建镜像
docker compose build
```

## 开发规范

- 提交代码前会自动运行 `lint-staged` 对暂存文件执行 lint 和 format
- 建议使用 VS Code 并安装 ESLint 和 Prettier 插件
- 遵循项目配置的代码风格规范

## CI Pipeline

详见 [ENGINEERING.md](./ENGINEERING.md) 文档。
