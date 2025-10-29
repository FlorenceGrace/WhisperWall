# WhisperWall 测试指南

## 🔧 问题修复摘要

### ✅ 问题1和2：加密内容显示
- **修复**：改进了 `WhisperCard` 的加密内容检测逻辑
- **检查**：验证 `encryptedContent` 不是零哈希
- **结果**：现在能正确显示加密标志 🔒 和解密按钮

### ✅ 问题3：页面刷新时 Provider 错误
- **修复**：改进了 `fallbackProvider` 的初始化逻辑
- **结果**：页面刷新不再报错 "No provider available"

### ✅ 问题4：私信发件箱数据
- **说明**：`Sent` 标签使用 `getMyWhispers()` 并过滤 `whisperType === 1`
- **要求**：需要连接发送私信的钱包才能看到发件箱

### ✅ 问题5：标签页指示优化
- **修复**：激活的标签使用 `btn-primary` 样式
- **增加**：在激活标签后添加 ✓ 标记
- **结果**：现在 Inbox/Sent 标签状态更加明显

---

## 🚀 测试步骤

### 前置准备

1. **停止并重启 Hardhat Node**（新终端1）
```bash
cd /Users/galaxy/Coding/zama_patch_2/zama_msg_board_0001/fhevm-hardhat-template
npx hardhat node
```

2. **重新部署合约**（新终端2）
```bash
cd /Users/galaxy/Coding/zama_patch_2/zama_msg_board_0001/fhevm-hardhat-template
npx hardhat deploy --network localhost --reset
```

3. **运行种子脚本**
```bash
npx hardhat seed-whispers --network localhost
```

4. **启动前端**（新终端3）
```bash
cd /Users/galaxy/Coding/zama_patch_2/zama_msg_board_0001/whisperwall-frontend
npm run dev:mock
```

---

## 📋 测试用例

### 测试1：公开明文消息
**目的**：验证基本留言功能

1. 访问 http://localhost:3000
2. 点击 "Connect Wallet & Post"
3. 连接钱包
4. 填写表单：
   - Whisper Type: `Public`
   - Content Mode: `Plain Text`
   - Content: "This is a public plain message"
   - Tag: `Random`
5. 点击 "Post Whisper"
6. 等待交易确认
7. 访问 http://localhost:3000/public-wall
8. **预期结果**：
   - ✅ 看到新发布的消息
   - ✅ 内容以明文显示
   - ✅ 卡片底部显示 `🔓 Public`

---

### 测试2：公开加密消息 ⭐
**目的**：验证加密内容和解密功能

1. 访问 http://localhost:3000
2. 点击 "Connect Wallet & Post"（如未连接）
3. 填写表单：
   - Whisper Type: `Public`
   - Content Mode: `Encrypted` ⚠️
   - Content: "This is a secret encrypted message 🔐"
   - Tag: `Secret`
4. 点击 "Post Whisper"
5. 等待交易确认（可能需要30秒-1分钟）
6. 访问 http://localhost:3000/public-wall
7. **预期结果**：
   - ✅ 看到新消息
   - ✅ 显示 `🔒 Encrypted Content`
   - ✅ 显示 "Request Decrypt" 按钮
   - ✅ 卡片底部显示 `🔓 Public` 和 `🔒 Encrypted`
8. 点击 "Request Decrypt"
9. **预期结果**：
   - ✅ 解密后显示明文内容

---

### 测试3：私密明文消息
**目的**：验证点对点私信功能

1. 准备两个钱包地址：
   - **钱包A**（发送者）：你当前连接的钱包
   - **钱包B**（接收者）：另一个测试地址，例如：
     - User1: `0xb9e9a901a78F70c08dbfEAC5F050Dc55431c7d4E`
2. 连接钱包A，访问首页
3. 填写表单：
   - Whisper Type: `Private` ⚠️
   - Content Mode: `Plain Text`
   - Content: "Hi Bob, this is a private message for you!"
   - Recipient: `钱包B的地址`
   - Tag: `Random`
4. 点击 "Post Whisper"
5. 等待交易确认
6. **测试发件箱**：
   - 保持钱包A连接
   - 访问 http://localhost:3000/private-messages
   - 点击 "📤 Sent" 标签
   - **预期结果**：
     - ✅ 看到刚发送的私信
     - ✅ 显示 `🔐 Private`
     - ✅ 显示接收者地址
7. **测试收件箱**：
   - 切换到钱包B
   - 访问 http://localhost:3000/private-messages
   - 确保在 "📥 Inbox" 标签
   - **预期结果**：
     - ✅ 看到收到的私信
     - ✅ 显示发送者地址
     - ✅ 内容以明文显示

---

### 测试4：私密加密消息 🔐⭐
**目的**：验证最高级别隐私保护

1. 连接钱包A
2. 填写表单：
   - Whisper Type: `Private` ⚠️
   - Content Mode: `Encrypted` ⚠️
   - Content: "This is a top secret encrypted private message 🚀"
   - Recipient: `钱包B的地址`
   - Tag: `Secret`
3. 点击 "Post Whisper"
4. 等待交易确认（加密需要更长时间）
5. **测试发件箱**：
   - 访问 http://localhost:3000/private-messages
   - 点击 "📤 Sent"
   - **预期结果**：
     - ✅ 看到消息
     - ✅ 显示 `🔐 Private` 和 `🔒 Encrypted`
     - ✅ 显示解密按钮
6. **测试收件箱**：
   - 切换到钱包B
   - 访问 http://localhost:3000/private-messages
   - 确保在 "📥 Inbox"
   - **预期结果**：
     - ✅ 看到消息
     - ✅ 可以解密查看内容

---

### 测试5：我的留言管理
**目的**：验证用户自己的留言列表

1. 连接你的钱包
2. 发布2-3条不同类型的留言（公开/私密/明文/加密）
3. 访问 http://localhost:3000/my-whispers
4. **预期结果**：
   - ✅ 只显示你自己发布的留言
   - ✅ 不显示其他用户的留言
   - ✅ 包含公开和私密留言
5. 点击某条留言的 "Delete" 按钮
6. 确认删除
7. **预期结果**：
   - ✅ 消息从列表中消失
   - ✅ 在 Public Wall 也不再显示

---

### 测试6：匿名发布
**目的**：验证匿名功能

1. 连接钱包
2. 填写表单：
   - Whisper Type: `Public`
   - Content Mode: `Plain Text`
   - Content: "Can you guess who I am? 👻"
   - Tag: `Confession`
   - **勾选** `Post Anonymously` ⚠️
3. 点击 "Post Whisper"
4. 访问 http://localhost:3000/public-wall
5. **预期结果**：
   - ✅ 作者显示为 "Anonymous"
   - ✅ 不显示钱包地址

---

### 测试7：页面刷新稳定性
**目的**：验证修复后的 provider 问题

1. 访问 http://localhost:3000/public-wall
2. 等待数据加载完成
3. 按 `F5` 刷新页面
4. **预期结果**：
   - ✅ 不报错 "No provider available"
   - ✅ 数据正常重新加载
5. 连接钱包后，访问 http://localhost:3000/my-whispers
6. 按 `F5` 刷新
7. **预期结果**：
   - ✅ 钱包保持连接状态
   - ✅ 我的留言正常显示

---

## 🐛 调试技巧

### 查看控制台日志
打开浏览器控制台（F12），查看：
- 🔍 `useWhisperWall: Detecting chain` - Provider 检测
- ✅ `Detected chainId: 31337` - 链ID确认
- 📍 `Contract address for chain 31337` - 合约地址
- 🔄 `Loading whispers...` - 数据加载
- `WhisperCard Debug:` - 留言卡片渲染信息

### 验证链上数据
```bash
cd /Users/galaxy/Coding/zama_patch_2/zama_msg_board_0001/fhevm-hardhat-template

# 查看特定留言详情
npx hardhat debug-whisper --id 0 --network localhost

# 查询公开留言
npx hardhat query-whispers --limit 10 --network localhost
```

### 常见问题

**Q: 加密消息发布失败**
- A: 检查是否连接钱包
- A: 等待更长时间（加密需要30秒-1分钟）
- A: 查看控制台错误信息

**Q: 解密按钮不出现**
- A: 确认消息是 `Encrypted` 模式
- A: 检查 `encryptedContent` 不是零哈希
- A: 查看 `WhisperCard Debug` 日志

**Q: 私信收件箱看不到消息**
- A: 确认连接的是接收者钱包
- A: 确认发送时填写了正确的接收者地址
- A: 检查是否在 "Inbox" 标签而不是 "Sent"

**Q: 发件箱没有数据**
- A: 确认连接的是发送者钱包
- A: 确认发送的是 `Private` 类型留言
- A: 切换到 "Sent" 标签

---

## 📊 测试清单

- [ ] 公开明文消息
- [ ] 公开加密消息
- [ ] 公开加密消息解密
- [ ] 私密明文消息（发送&接收）
- [ ] 私密加密消息（发送&接收）
- [ ] 私密加密消息解密
- [ ] 我的留言列表（仅显示自己的）
- [ ] 匿名发布
- [ ] 删除留言
- [ ] 点赞/点踩
- [ ] 页面刷新（Public Wall）
- [ ] 页面刷新（My Whispers）
- [ ] 页面刷新（Private Messages）
- [ ] 钱包连接持久化
- [ ] 标签页切换（Inbox/Sent）
- [ ] 标签页状态指示明确

---

## 🎯 验收标准

✅ **所有15项测试清单通过**
✅ **没有控制台错误（除了预期的警告）**
✅ **UI 响应流畅，加载状态清晰**
✅ **加密/解密功能正常工作**
✅ **私信功能正常工作（发送&接收）**
✅ **页面刷新不报错**
✅ **钱包连接持久化**

---

完成测试后，告诉我结果！🎉


