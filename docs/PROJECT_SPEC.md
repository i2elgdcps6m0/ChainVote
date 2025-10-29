# ChainVote - 链上投票系统

## 📋 项目概述

**项目类型**: 🗳️ 投票治理  
**核心技术**: Zama FHE (完全同态加密)  
**合约语言**: Solidity ^0.8.24  
**网络**: Sepolia测试网

---

## 🎯 项目简介

ChainVote 是一个基于 FHE 技术的链上投票 DAO 系统。该系统允许用户创建提案并进行投票，所有投票内容在投票期间完全加密，只有在投票结束后才能解密查看结果。

### 核心特点

- ✅ **完全隐私**: 投票过程中所有票数都是加密的
- ✅ **防重复投票**: 每个地址只能投一次票
- ✅ **时间控制**: 支持灵活的投票时间窗口
- ✅ **公开解密**: 投票结束后任何人都可以请求解密结果
- ✅ **防spam**: 创建提案需要支付少量费用

---

## 📊 功能模块

### 1. 提案管理

#### 创建提案 (`createProposal`)
- **权限**: 任何人（需支付费用）
- **参数**:
  - `name`: 提案名称
  - `details`: 提案详情
  - `choices`: 投票选项数组（2-10个选项）
  - `votingStart`: 投票开始时间戳
  - `votingEnd`: 投票结束时间戳
- **费用**: 0.001 ETH（可调整）
- **返回**: 提案ID

#### 查询提案信息 (`getProposalInfo`)
- **参数**: `proposalId`
- **返回**: 提案的所有基本信息

#### 查询提案总数 (`getProposalCount`)
- **返回**: 当前提案总数

---

### 2. 投票功能

#### 投票 (`castVote`)
- **权限**: 在投票期间，任何未投票的地址
- **参数**:
  - `proposalId`: 提案ID
  - `choiceId`: 选择的选项ID
  - `encryptedVote`: 加密的投票（值为1的euint64）
  - `proof`: 零知识证明
- **限制**:
  - 只能在投票期间投票
  - 每个地址只能投一次票
  - 选项ID必须有效

#### 检查投票状态 (`hasVoted`)
- **参数**: `proposalId`, `voter`
- **返回**: 布尔值，表示该地址是否已投票

---

### 3. 结果管理

#### 请求解密结果 (`requestResultsDecryption`)
- **权限**: 投票结束后，任何人
- **参数**: `proposalId`
- **流程**:
  1. 将所有加密票数打包
  2. 请求 FHE Gateway 解密
  3. 等待回调

#### 解密回调 (`decryptionCallback`)
- **权限**: 仅 FHE Gateway
- **参数**:
  - `requestId`: 解密请求ID
  - `decryptedData`: 解密后的数据
  - `decryptionProof`: 解密证明
- **功能**: 接收解密结果并公开

#### 查询结果 (`getProposalResults`)
- **权限**: 结果公开后
- **参数**: `proposalId`
- **返回**: 各选项的票数数组

---

### 4. 管理功能

#### 更新提案费用 (`updateProposalFee`)
- **权限**: 仅管理员
- **参数**: `newFee`

#### 提取合约余额 (`withdrawFunds`)
- **权限**: 仅管理员
- **功能**: 提取所有提案费用

---

## 🔐 隐私模型

### 加密过程

1. **投票时**:
   - 用户在前端加密选择（值为1）
   - 生成零知识证明
   - 提交加密投票到链上

2. **累加票数**:
   - 使用 FHE 同态加法：`newVotes = oldVotes + encryptedVote`
   - 所有运算都在加密域进行
   - 没有任何中间结果被解密

3. **解密结果**:
   - 投票结束后请求解密
   - FHE Gateway 验证并解密
   - 通过回调函数返回明文结果

### 隐私保证

- ✅ **投票内容隐私**: 个人投票选择永远不会暴露
- ✅ **中间状态隐私**: 投票期间看不到任何票数
- ✅ **最终结果公开**: 只有最终总票数会被公开

---

## 💻 前端集成指南

### 1. 安装依赖

```bash
npm install @zama-fhe/relayer-sdk ethers
```

### 2. 初始化 FHE SDK

```typescript
import { initSDK, createInstance } from '@zama-fhe/relayer-sdk';

// 初始化 SDK
await initSDK();

// 创建 FHE 实例
const fheInstance = await createInstance({
  chainId: 11155111, // Sepolia
  networkUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
  gatewayUrl: 'https://gateway.zama.ai',
});
```

### 3. 创建提案

```typescript
const tx = await contract.createProposal(
  "提案标题",
  "提案详情",
  ["选项1", "选项2", "选项3"],
  startTimestamp,
  endTimestamp,
  { value: ethers.parseEther("0.001") }
);
```

### 4. 加密并投票

```typescript
// 创建加密输入
const input = fheInstance.createEncryptedInput(
  contractAddress,
  userAddress
);

// 加密值为1的投票
input.add64(1);

// 获取加密数据
const { handles, inputProof } = await input.encrypt();

// 提交投票
const tx = await contract.castVote(
  proposalId,
  choiceId,
  handles[0],
  inputProof
);
```

### 5. 解密结果

```typescript
// 请求解密
const tx = await contract.requestResultsDecryption(proposalId);

// 等待解密完成
await tx.wait();

// 获取结果
const results = await contract.getProposalResults(proposalId);
console.log("投票结果:", results);
```

---

## 🎨 推荐的前端功能

### 页面结构

1. **首页**
   - 显示所有提案列表
   - 按状态过滤（进行中/已结束）
   - 显示投票统计

2. **创建提案页面**
   - 提案信息表单
   - 选项动态添加
   - 时间选择器
   - 费用显示

3. **提案详情页面**
   - 提案信息展示
   - 投票选项列表
   - 投票按钮（带FHE加密）
   - 倒计时显示
   - 结果展示（投票结束后）

4. **个人中心**
   - 我创建的提案
   - 我参与的投票
   - 投票历史

### UI组件建议

- 📊 **票数可视化**: 使用图表展示结果
- ⏱️ **倒计时器**: 显示投票剩余时间
- 🔄 **实时更新**: 使用 WebSocket 或轮询更新状态
- 📱 **响应式设计**: 支持移动端访问

---

## 🔧 技术细节

### 合约地址
- **Sepolia**: 待部署后填写

### FHE 数据类型
- `euint64`: 存储加密的票数

### Gas 消耗估算
- 创建提案: ~500,000 gas
- 投票: ~200,000 gas
- 请求解密: ~300,000 gas

### 安全考虑
1. ✅ 防重复投票
2. ✅ 时间窗口验证
3. ✅ 选项范围检查
4. ✅ 解密签名验证
5. ✅ 防spam费用机制

---

## 📝 开发建议

### 必须实现的功能
1. ✅ FHE SDK 集成
2. ✅ 钱包连接（推荐 RainbowKit）
3. ✅ 提案创建表单
4. ✅ 加密投票流程
5. ✅ 结果展示

### 可选功能
- 📧 邮件/推送通知
- 🔍 提案搜索功能
- 🏷️ 提案标签分类
- 💬 评论讨论区
- 📈 数据分析面板

---

## 🚀 部署指南

### 1. 编译合约

```bash
npx hardhat compile
```

### 2. 部署到 Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 3. 验证合约

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

---

## 📚 参考资源

- [Zama FHE 文档](https://docs.zama.ai/)
- [fhEVM Solidity 库](https://github.com/zama-ai/fhevm)
- [FHE 示例代码](https://github.com/zama-ai/fhevm-hardhat-template)

---

## 🎯 项目检查清单

前端开发前请确认：

- [ ] 理解 FHE 加密投票的工作原理
- [ ] 熟悉合约的所有公开函数
- [ ] 准备好测试网的测试币
- [ ] 安装并配置好 FHE SDK
- [ ] 设计好 UI/UX 流程

---

**祝你开发顺利！如有问题随时联系。** 🎉

