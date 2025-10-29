# ChainVote - 前端已集成

## ✅ 前端代码已拉取完成

**来源**: https://github.com/0xsongsu/green-vault-vote.git  
**集成时间**: 2025年10月29日  
**状态**: ✅ 已清理Git信息

---

## 📁 项目结构

```
01-ChainVote/
├── contracts/              # 智能合约
│   └── ChainVote.sol      # 主合约 (432行)
├── docs/                   # 文档
│   └── PROJECT_SPEC.md    # 项目规格文档
├── src/                    # 前端源码
│   ├── components/        # React组件
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── VoteCard.tsx
│   │   └── ui/           # shadcn/ui组件库
│   ├── pages/            # 页面
│   │   ├── Index.tsx     # 首页
│   │   ├── CreateVote.tsx # 创建投票页
│   │   ├── VoteDetail.tsx # 投票详情页
│   │   ├── About.tsx     # 关于页面
│   │   └── NotFound.tsx  # 404页面
│   ├── hooks/            # React Hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/              # 工具库
│   │   ├── utils.ts
│   │   └── wagmi.ts      # Web3配置
│   ├── App.tsx           # 主应用
│   ├── main.tsx          # 入口文件
│   └── index.css         # 全局样式
├── public/               # 静态资源
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── package.json          # 项目依赖
├── vite.config.ts        # Vite配置
├── tailwind.config.ts    # Tailwind配置
├── tsconfig.json         # TypeScript配置
└── README.md             # 项目说明
```

---

## 🛠️ 技术栈

### 前端框架
- **React** 18.3.1
- **TypeScript** 5.8.3
- **Vite** 5.4.19

### UI组件库
- **shadcn/ui** - 完整的UI组件集
- **Radix UI** - 无障碍组件原语
- **Tailwind CSS** 3.4.17
- **Lucide React** - 图标库

### Web3集成
- **wagmi** 2.19.1 - React Hooks for Ethereum
- **viem** 2.38.5 - TypeScript Ethereum库
- **RainbowKit** 2.2.9 - 钱包连接UI

### 路由和状态管理
- **React Router DOM** 6.30.1
- **TanStack Query** 5.90.5

### 表单和验证
- **React Hook Form** 7.61.1
- **Zod** 3.25.76

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd /Users/songsu/Desktop/zama/fhe-projects-collection/01-ChainVote
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
VITE_CONTRACT_ADDRESS=0x...  # ChainVote合约地址
VITE_CHAIN_ID=11155111       # Sepolia测试网
```

### 3. 启动开发服务器

```bash
npm run dev
```

服务器将运行在 `http://localhost:5173`

### 4. 构建生产版本

```bash
npm run build
```

### 5. 预览生产构建

```bash
npm run preview
```

---

## 📄 页面说明

### 首页 (/)
- 展示所有投票提案
- 提案列表展示
- 筛选和搜索功能

### 创建投票 (/create-vote)
- 创建新的投票提案
- 设置投票选项
- 设置投票时间
- 支付创建费用

### 投票详情 (/vote/:id)
- 查看提案详情
- 投票选项展示
- 实时投票统计
- 解密和查看结果

### 关于页面 (/about)
- 项目介绍
- 使用说明

---

## 🎨 UI组件

已集成完整的 shadcn/ui 组件库，包括：

- **Button** - 按钮
- **Card** - 卡片
- **Dialog** - 对话框
- **Form** - 表单
- **Input** - 输入框
- **Select** - 下拉选择
- **Tabs** - 标签页
- **Toast** - 提示消息
- **Progress** - 进度条
- **Badge** - 徽章
- **Avatar** - 头像
- **Accordion** - 手风琴
- **Alert** - 警告框
- 等50+个组件...

---

## 🔌 Web3集成

### Wagmi配置

文件: `src/lib/wagmi.ts`

已配置：
- RainbowKit钱包连接
- Sepolia测试网支持
- 合约ABI导入
- 自动钱包检测

### 使用示例

```typescript
import { useAccount, useReadContract, useWriteContract } from 'wagmi';

// 连接钱包
const { address, isConnected } = useAccount();

// 读取合约
const { data } = useReadContract({
  address: contractAddress,
  abi: ChainVoteABI,
  functionName: 'getProposalCount',
});

// 写入合约
const { writeContract } = useWriteContract();
await writeContract({
  address: contractAddress,
  abi: ChainVoteABI,
  functionName: 'createProposal',
  args: [name, details, choices, startTime, endTime],
  value: proposalFee,
});
```

---

## 🎯 核心功能实现

### 1. 创建提案
- 表单验证
- FHE加密集成（待实现）
- 交易提交
- 成功/失败处理

### 2. 投票
- 选项选择
- 加密投票数据
- 提交投票交易
- 防重复投票检查

### 3. 解密结果
- 请求解密
- 等待Oracle回调
- 展示解密结果
- 投票统计可视化

---

## 📦 可用脚本

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 开发环境构建
npm run build:dev

# 代码检查
npm run lint

# 预览构建
npm run preview
```

---

## 🔧 配置文件

### Vite配置 (vite.config.ts)
- React SWC插件
- 路径别名配置
- 开发服务器设置

### Tailwind配置 (tailwind.config.ts)
- 主题定制
- 颜色方案
- 动画配置
- 响应式断点

### TypeScript配置 (tsconfig.json)
- 严格模式
- 路径映射
- 编译选项

---

## 🎨 样式系统

### Tailwind CSS
- 实用优先的CSS框架
- 自定义主题
- 暗色模式支持
- 响应式设计

### CSS变量
文件: `src/index.css`

已定义：
- 颜色系统
- 字体大小
- 间距
- 圆角
- 阴影

---

## 🔐 安全注意事项

1. **永远不要提交私钥**
2. **使用环境变量存储敏感信息**
3. **验证所有用户输入**
4. **检查合约地址**
5. **测试网测试后再上主网**

---

## 📚 相关资源

### 官方文档
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [wagmi](https://wagmi.sh/)
- [RainbowKit](https://www.rainbowkit.com/)

### 项目文档
- `docs/PROJECT_SPEC.md` - 完整项目规格
- `contracts/ChainVote.sol` - 智能合约
- `README.md` - 项目概述

---

## 🐛 常见问题

### 1. 钱包连接失败
- 确保安装了MetaMask或其他Web3钱包
- 切换到Sepolia测试网
- 检查网络配置

### 2. 合约调用失败
- 检查合约地址是否正确
- 确保钱包有足够的测试币
- 查看浏览器控制台错误

### 3. FHE加密问题
- 确保正确导入FHE SDK
- 检查加密参数
- 参考项目文档

---

## 🔄 开发流程

1. **本地开发**
   ```bash
   npm run dev
   ```

2. **代码检查**
   ```bash
   npm run lint
   ```

3. **构建测试**
   ```bash
   npm run build:dev
   npm run preview
   ```

4. **生产部署**
   ```bash
   npm run build
   # 部署 dist/ 目录
   ```

---

## 📝 待办事项

- [ ] 集成FHE SDK (@zama-fhe/relayer-sdk)
- [ ] 实现投票加密逻辑
- [ ] 添加解密结果展示
- [ ] 优化移动端体验
- [ ] 添加加载状态动画
- [ ] 实现错误边界
- [ ] 添加单元测试
- [ ] 优化SEO
- [ ] 添加PWA支持

---

## ✅ 已完成

- [x] 前端代码拉取
- [x] Git信息清理
- [x] 项目结构整理
- [x] UI组件集成
- [x] Web3基础配置
- [x] 路由配置
- [x] 响应式设计

---

**前端已准备就绪，可以开始开发FHE功能集成！** 🚀

