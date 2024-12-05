# 支出管理系统

一个功能完整的支出管理系统，包含前后端实现，支持支出记录管理、分类管理、数据统计和导出等功能。

## 技术栈

### 后端
- Node.js
- Express
- TypeScript
- PostgreSQL
- TypeScript
- express-validator (数据验证)
- cors (跨域处理)
- dotenv (环境变量管理)

### 前端
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Query
- React Router DOM
- Recharts (图表库)
- Headless UI
- Hero Icons
- Axios

## 环境要求
- Node.js >= 14.0.0
- PostgreSQL >= 12.0
- npm >= 6.0.0

## 项目设置

### 1. 克隆项目
```bash
git clone [repository_url]
cd expense-tracker
```

### 2. 后端设置
```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入数据库连接信息

# 运行数据库迁移
npm run db:migrate

# 启动开发服务器
npm run dev
```

### 3. 前端设置
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 API 地址

# 启动开发服务器
npm run dev
```

## 项目结构

### 后端目录结构
```
backend/
├── src/
│   ├── config/         # 配置文件
│   ├── controllers/    # 控制器
│   ├── models/        # 数据模型
│   ├── routes/        # 路由定义
│   ├── types/         # TypeScript 类型定义
│   ├── utils/         # 工具函数
│   └── app.ts         # 应用入口文件
├── database/
│   ├── migrations/    # 数据库迁移文件
│   └── seeds/        # 数据库种子文件
└── package.json
```

### 前端目录结构
```
frontend/
├── src/
│   ├── components/    # React 组件
│   │   ├── ui/       # UI 组件
│   │   ├── expenses/ # 支出相关组件
│   │   └── statistics/# 统计相关组件
│   ├── pages/        # 页面组件
│   ├── services/     # API 服务
│   ├── types/        # TypeScript 类型定义
│   ├── utils/        # 工具函数
│   ├── contexts/     # React Context
│   └── App.tsx       # 应用入口
└── package.json
```

## 功能特性

### 1. 支出记录管理
- **记录支出**
  - 添加新的支出记录
  - 支持金额、日期、描述和分类
  - 实时表单验证
  - 支持编辑和删除记录

- **支出列表**
  - 分页显示支出记录
  - 按日期、分类筛选
  - 支持排序功能
  - 响应式表格设计

- **搜索和筛选**
  - 日期范围筛选
  - 分类筛选
  - 金额范围筛选
  - 支持多条件组合筛选

### 2. 分类管理
- **分类操作**
  - 创建自定义分类
  - 编辑分类名称
  - 删除未使用的分类
  - 分类使用统计

- **分类列表**
  - 显示所有分类
  - 显示每个分类的使用次数
  - 分类排序功能

### 3. 数据统计和分析
- **总览面板**
  - 总支出金额
  - 平均支出金额
  - 最高支出金额
  - 最低支出金额

- **趋势分析**
  - 日支出趋势图
  - 月支出趋势图
  - 支持切换时间范围
  - 支持图表缩放

- **分类统计**
  - 分类支出占比饼图
  - 分类支出排行
  - 分类月度对比
  - 交互式图表

- **数据可视化**
  - 响应式图表
  - 多种图表类型
  - 数据交互功能
  - 自定义图表配置

### 4. 数据导出
- **导出格式**
  - CSV 格式导出
  - JSON 格式导出
  - 自定义导出范围

- **导出选项**
  - 选择日期范围
  - 选择特定分类
  - 选择导出字段
  - 导出数据预览

### 5. 用户界面
- **响应式设计**
  - 适配桌面和移动设备
  - 流畅的交互体验
  - 合理的空间布局
  - 优雅的动画效果

- **主题和样式**
  - 现代化的界面设计
  - 清晰的视觉层次
  - 符合人体工程学的交互设计
  - 支持亮色主题

### 6. 系统功能
- **导航功能**
  - 顶部导航栏
  - 页面加载进度条
  - 面包屑导航
  - 快捷操作按钮

- **提示系统**
  - 操作成功提示
  - 错误信息提示
  - 警告信息提示
  - 加载状态提示

- **错误处理**
  - 全局错误边界
  - 友好的错误提示
  - 网络错误处理
  - 数据验证错误处理

  ## API 接口文档

### 基础信息
- 基础路径: `http://localhost:3000/api`
- 响应格式: JSON
- 认证方式: 待实现

### 通用响应格式
```typescript
{
    "success": boolean,    // 请求是否成功
    "data"?: any,         // 响应数据
    "error"?: string,     // 错误信息
    "message"?: string    // 提示信息
}
```

### 1. 支出记录接口
#### 获取支出列表
- 请求方法：GET
- 路径：`/expenses`
- 查询参数：
  - `page`: 页码
  - `limit`: 每页数量
  - `startDate`: 开始日期
  - `endDate`: 结束日期
  - `categoryId`: 分类ID

#### 创建支出记录
- 请求方法：POST
- 路径：`/expenses`
- 请求体：
  ```typescript
  {
    description: string,
    amount: number,
    category_id?: number,
    date: string
  }
  ```

#### 更新支出记录
- 请求方法：PUT
- 路径：`/expenses/:id`

#### 删除支出记录
- 请求方法：DELETE
- 路径：`/expenses/:id`

### 2. 分类管理接口
#### 获取分类列表
- 请求方法：GET
- 路径：`/categories`

#### 创建分类
- 请求方法：POST
- 路径：`/categories`
- 请求体：
  ```typescript
  {
    name: string
  }
  ```

### 3. 统计分析接口
#### 获取支出概览
- 请求方法：GET
- 路径：`/statistics/overview`

#### 获取分类统计
- 请求方法：GET
- 路径：`/statistics/category`

#### 获取趋势数据
- 请求方法：GET
- 路径：`/statistics/trend`

### 4. 数据导出接口
#### 导出CSV
- 请求方法：GET
- 路径：`/export/csv`

#### 导出JSON
- 请求方法：GET
- 路径：`/export/json`

## 开发指南

### 后端开发

#### 添加新路由
1. 在 `src/routes` 创建路由文件
2. 在 `src/controllers` 创建对应控制器
3. 在 `app.ts` 中注册路由

#### 数据库操作
1. 创建迁移文件：
```bash
cd backend
npm run migration:create
```

2. 运行迁移：
```bash
npm run db:migrate
```

### 前端开发

#### 添加新组件
1. 在 `src/components` 创建组件文件
2. 使用 TypeScript 类型定义
3. 添加必要的测试

#### 添加新页面
1. 在 `src/pages` 创建页面组件
2. 在 `App.tsx` 中添加路由
3. 更新导航菜单

#### 状态管理
- 使用 React Query 管理服务器状态
- 使用 Context 管理全局状态
- 使用 local state 管理组件状态

#### 样式开发
- 使用 Tailwind CSS 工具类
- 遵循项目预设主题
- 保持响应式设计

## 开发规范

### 命名规范
- 文件名：使用 PascalCase
- 组件名：使用 PascalCase
- 变量和函数：使用 camelCase
- 常量：使用 UPPER_SNAKE_CASE
- 类型和接口：使用 PascalCase

### 代码格式化
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 提交前运行 lint 检查

### Git 提交规范
```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

## 部署指南

### 生产环境要求
- Node.js 生产环境
- PostgreSQL 数据库服务器
- NGINX 或其他 Web 服务器（可选）
- PM2 进程管理器（推荐）

### 后端部署步骤

1. 准备环境
```bash
# 安装 PM2
npm install -g pm2
```

2. 构建项目
```bash
cd backend
npm install
npm run build
```

3. 配置环境变量
```bash
# 创建生产环境配置
cp .env.example .env.production

# 编辑生产环境配置
vim .env.production
```

4. 数据库迁移
```bash
NODE_ENV=production npm run db:migrate
```

5. 启动服务
```bash
# 使用 PM2 启动
pm2 start dist/app.js --name expense-tracker-backend

# 设置开机自启
pm2 startup
pm2 save
```

### 前端部署步骤

1. 构建项目
```bash
cd frontend
npm install
npm run build
```

2. 配置 NGINX
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker 部署（可选）

1. 构建镜像
```bash
# 后端
docker build -t expense-tracker-backend ./backend

# 前端
docker build -t expense-tracker-frontend ./frontend
```

2. 使用 Docker Compose 部署
```yaml
version: '3'
services:
  backend:
    image: expense-tracker-backend
    environment:
      - NODE_ENV=production
    ports:
      - "3000:3000"
    depends_on:
      - db
  
  frontend:
    image: expense-tracker-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: expense_tracker
      POSTGRES_USER: your_user
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 测试指南

### 运行测试

1. 后端测试
```bash
cd backend
npm test                 # 运行所有测试
npm run test:watch      # 监视模式
npm run test:coverage   # 生成覆盖率报告
```

2. 前端测试
```bash
cd frontend
npm test                # 运行所有测试
npm run test:watch     # 监视模式
npm run test:coverage  # 生成覆盖率报告
```

### 测试范围
- 单元测试
- 集成测试
- E2E 测试（待实现）
- API 测试
- 组件测试

## 常见问题解答

### 1. 数据库连接问题
Q: 无法连接到数据库？
A: 检查以下几点：
- 数据库服务是否运行
- 环境变量配置是否正确
- 数据库用户权限是否正确
- 防火墙设置是否允许连接

### 2. 前端构建问题
Q: 前端构建失败？
A: 常见解决方案：
- 清除 node_modules 并重新安装
- 检查 Node.js 版本兼容性
- 检查依赖版本冲突

### 3. API 调用问题
Q: API 请求返回 CORS 错误？
A: 确保：
- 后端 CORS 配置正确
- API 地址配置正确
- 检查网络请求格式

## 维护和更新

### 版本更新流程
1. 检查依赖更新
```bash
npm outdated
```

2. 更新依赖
```bash
npm update
```

3. 运行测试确保兼容性
4. 更新版本号
5. 生成更新日志
6. 提交代码并标记版本

### 性能监控
- 使用 PM2 监控后端性能
- 使用浏览器开发工具监控前端性能
- 定期检查数据库性能
- 监控 API 响应时间

### 数据备份
1. 数据库备份
```bash
pg_dump expense_tracker > backup.sql
```

2. 定期备份计划
```bash
# 添加到 crontab
0 0 * * * pg_dump expense_tracker > /path/to/backup/expense_tracker_$(date +\%Y\%m\%d).sql
```

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

### Pull Request 规范
- 清晰的标题和描述
- 相关的单元测试
- 符合代码规范
- 更新相关文档

## 证书
MIT License

## 联系方式
- 项目维护者：[名字]
- 邮箱：[邮箱地址]
- 问题反馈：使用 GitHub Issues