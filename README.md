# AI 站点后端服务 (ai-site-be)

基于 Next.js 开发的 AI 站点后端服务，提供 API 接口和服务端功能。

## 项目特点

- 使用 Next.js API 路由功能构建后端服务
- TypeScript 支持类型安全
- 高性能 RESTful API
- 数据库集成
- 身份验证与授权
- 部署简单

## 环境要求

- Node.js 18.x 或更高版本
- npm 或 yarn 包管理器
- (可选) PostgreSQL/MongoDB 等数据库

## 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/ai-site-be.git
cd ai-site-be

# 安装依赖
npm install
# 或
yarn install
```

### 开发环境配置

1. 复制环境变量模板并进行配置

```bash
cp .env.example .env.local
```

2. 根据需求修改 `.env.local` 文件中的配置

### 运行开发服务器

```bash
npm run dev
# 或
yarn dev
```

开发服务器将在 [http://localhost:3000](http://localhost:3000) 启动

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

### 启动生产服务器

```bash
npm start
# 或
yarn start
```

## 项目结构

```
ai-site-be/
├── app/            # 应用主目录
│   ├── api/        # API 路由目录
│   │   └── ...     # 各种 API 端点
├── lib/            # 工具函数和公共逻辑
├── models/         # 数据模型定义
├── config/         # 配置文件
├── middleware.ts   # 全局中间件
├── public/         # 静态资源
└── ...
```

## API 文档

服务运行后，API 文档可在 `/api/docs` 路径查看。

### 模型 API 示例

#### 发送对话请求

```bash
curl -X POST http://localhost:3000/api/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "介绍一下你自己"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 500
  }'
```

可选查询参数:
- `model`: 指定要使用的模型（默认: Qwen/QwQ-32B）

请求主体参数:
- `messages`: 消息数组，包含用户和助手的对话历史
- `temperature`: 温度参数，控制随机性（默认: 0.7）
- `max_tokens`: 最大生成令牌数（默认: 512）
- `top_p`: 核采样概率（默认: 0.7）
- `top_k`: 限制考虑的最高概率标记数量（默认: 50）
- `frequency_penalty`: 频率惩罚系数（默认: 0.5）

## 部署

### 使用 Vercel 部署

```bash
npm install -g vercel
vercel
```

### 其他部署选项

- Docker 容器化部署
- 传统服务器部署

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 许可证

[MIT](LICENSE)
