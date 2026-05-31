# Firebase 配置指南

## 概述

本项目已集成 Firebase Firestore 作为可选的数据存储方案，支持多设备数据同步。

## 当前状态

- 默认使用 localStorage 模式（`DATA_STORAGE_MODE = 'local'`）
- Firebase 已集成但需要配置才能使用

## 配置步骤

### 1. 创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击「添加项目」或选择现有项目
3. 按照提示完成项目创建

### 2. 添加 Web 应用

1. 在 Firebase 控制台中，进入项目设置
2. 向下滚动到「您的应用」部分
3. 点击 `</>` 图标添加 Web 应用
4. 输入应用名称（例如：jinduluopan）
5. 点击「注册应用」
6. **复制** Firebase 配置对象（类似下面的格式）：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

### 3. 配置 Firestore 数据库

1. 在 Firebase 控制台左侧菜单中，选择「Firestore Database」
2. 点击「创建数据库」
3. 选择「以测试模式启动」（注意：测试模式30天后会过期）
4. 选择数据库位置（建议选择离您近的地区）
5. 点击「启用」

#### 设置安全规则（重要）

在「规则」选项卡中，设置适当的安全规则。对于个人使用，可以先使用：

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **注意**：以上规则允许任何人读写您的数据库，仅适用于开发测试。生产环境请添加认证。

### 4. 更新项目配置

编辑 `src/config/firebase.ts`，将刚才复制的配置替换进去：

```typescript
const firebaseConfig = {
  apiKey: "这里粘贴您的 apiKey",
  authDomain: "这里粘贴您的 authDomain",
  projectId: "这里粘贴您的 projectId",
  storageBucket: "这里粘贴您的 storageBucket",
  messagingSenderId: "这里粘贴您的 messagingSenderId",
  appId: "这里粘贴您的 appId"
};
```

### 5. 启用 Firebase 模式

编辑 `src/services/dashboard.ts`，将：

```typescript
const DATA_STORAGE_MODE: 'local' | 'firebase' = 'local';
```

改为：

```typescript
const DATA_STORAGE_MODE: 'local' | 'firebase' = 'firebase';
```

### 6. 重新构建和部署

```bash
npm run build
# 然后部署到您的服务器
```

## 数据迁移

如果您之前在 localStorage 中有数据，可以按以下步骤迁移：

1. 在启用 Firebase 模式前，导出您的数据（如果需要）
2. 启用 Firebase 模式后，手动重新输入数据，或者编写迁移脚本

## 切换回 localStorage 模式

只需将 `DATA_STORAGE_MODE` 改回 `'local'` 即可。

## 注意事项

- Firebase 免费额度有限制，请关注使用量
- 测试模式下的安全规则30天后会自动失效
- 生产环境建议添加 Firebase Authentication
- 定期备份您的数据

## 故障排除

### 问题：Firebase 初始化失败

- 检查 `firebase.ts` 中的配置是否正确
- 确保浏览器可以访问 Firebase 服务
- 查看控制台错误信息

### 问题：数据无法保存

- 检查 Firestore 安全规则
- 确认数据库已正确创建
- 查看网络请求是否成功
