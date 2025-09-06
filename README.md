# 学生违纪表彰通报系统

基于 Electron 与 Vue.js 开发的桌面应用程序，用于垦利校区高三学部的学生违纪表彰管理。

## 功能特色

- 📊 实时数据统计和展示
- 📝 违纪表彰通报提交
- 📈 Excel报告生成和导出
- 🔔 实时WebSocket通知
- 💻 跨平台桌面应用

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **桌面应用**: Electron
- **构建工具**: Vite
- **UI组件**: 自定义组件
- **数据处理**: ExcelJS
- **实时通信**: WebSocket

## 开发环境

### 安装依赖

```bash
npm install
```

### 开发模式

启动Vue开发服务器和Electron应用：

```bash
npm run electron:dev
```

或使用批处理文件：

```bash
dev.bat
```

### 构建应用

#### 仅构建Vue应用

```bash
npm run build
```

#### 构建并打包Electron应用

```bash
npm run electron:build
```

#### 平台特定构建

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

#### 使用构建脚本

```bash
build.bat
```

## 生产部署

### 打包步骤

1. 确保所有依赖已安装
2. 运行构建命令
3. 在 `dist_electron` 目录中找到安装包

### 安装包类型

- **Windows**: `.exe` 安装程序和便携版
- **macOS**: `.dmg` 安装包
- **Linux**: `.AppImage` 和 `.deb` 包

## 项目结构

```
kas-eleapp/
├── src/                    # Vue应用源码
│   ├── components/        # 组件
│   ├── views/            # 页面
│   ├── utils/            # 工具函数
│   └── main.ts          # 应用入口
├── public/               # 静态资源
├── dist/                # Vue构建输出
├── dist_electron/       # Electron打包输出
├── main.cjs             # Electron主进程
├── preload.js           # 预加载脚本
└── package.json         # 项目配置
```

## 环境变量

创建 `.env.local` 文件配置开发环境：

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_ENABLE_WEBSOCKET=true
ELECTRON_SHOW_DEV_TOOLS=true
```

## 常见问题

### 1. 构建失败

- 检查 Node.js 版本 (推荐 16+)
- 清除缓存: `npm cache clean --force`
- 重新安装依赖: `rm -rf node_modules && npm install`

### 2. Electron 启动失败

- 确保已运行 `npm run build`
- 检查主进程文件路径
- 查看控制台错误信息

### 3. 跨域问题

- 开发环境已配置 CORS
- 生产环境需要后端配置 CORS

## 许可证

本项目仅供垦利校区高三学部内部使用。

## 联系方式

如有问题或建议，请联系开发团队。
