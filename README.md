# 学术研究平台

一个去中心化平台，供学术研究人员存储、共享和访问研究论文及数据集。

## 功能特点

- **去中心化存储**：利用Walrus进行安全、去中心化的研究论文和数据集存储
- **基于区块链**：基于Sui Move构建，实现透明且不可篡改的记录保存
- **现代化前端**：使用React + Vite提供快速、响应式的用户体验
- **学术协作**：引用跟踪、评论和同行评审功能
- **高级搜索**：通过强大的搜索功能找到相关论文和数据集

## 技术栈

### 前端
- React 18
- Vite
- Material UI
- React Router
- React PDF
- Sui Wallet Kit

### 后端
- Sui Move
- Walrus去中心化存储

## 开始使用

### 前提条件
- Node.js (v16+)
- Sui CLI
- Sui钱包

### 安装

1. 克隆仓库：
```
git clone https://github.com/yourusername/academic-research-platform.git
cd academic-research-platform
```

2. 安装前端依赖：
```
cd frontend
npm install
```

3. 安装Sui CLI（如果尚未安装）：
```
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch main sui
```

4. 构建Move模块：
```
cd backend
sui move build
```

### 运行应用

1. 启动前端开发服务器：
```
cd frontend
npm run dev
```

2. 将Move模块部署到Sui测试网：
```
cd backend
sui client publish --gas-budget 100000000
```

3. 更新前端配置中的包ID。

## 项目结构

```
academic-research-platform/
├── frontend/               # React + Vite前端
│   ├── public/             # 静态资源
│   ├── src/                # 源代码
│   │   ├── components/     # 可复用UI组件
│   │   ├── context/        # React上下文提供者
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API和区块链服务
│   │   └── tests/          # 测试文件
│   ├── index.html          # HTML入口点
│   └── vite.config.js      # Vite配置
│
├── backend/                # Sui Move后端
│   ├── sources/            # Move模块
│   │   ├── research_hub.move  # 主模块
│   │   ├── citation.move      # 引用功能
│   │   ├── comment.move       # 评论功能
│   │   ├── access_control.move # 访问控制
│   │   └── storage.move       # 存储集成
│   └── Move.toml           # Move包配置
│
└── README.md               # 项目文档
```

## 贡献

欢迎贡献！请随时提交Pull Request。

## 许可证

本项目采用MIT许可证 - 详情请参阅LICENSE文件。
