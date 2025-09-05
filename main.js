import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const isDev = process.env.NODE_ENV === 'development'

// 从环境变量获取窗口配置
const WINDOW_CONFIG = {
  width: parseInt(process.env.ELECTRON_WINDOW_WIDTH || '1200'),
  height: parseInt(process.env.ELECTRON_WINDOW_HEIGHT || '800'),
  devServerUrl: process.env.ELECTRON_DEV_SERVER_URL || 'http://localhost:5173'
}

function createWindow() {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: WINDOW_CONFIG.width,
    height: WINDOW_CONFIG.height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: !isDev // 开发环境禁用webSecurity，生产环境启用
    },
    show: false // 先隐藏窗口，等待ready-to-show事件
  })

  // 窗口准备好显示时再显示，避免闪烁
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 加载应用
  if (isDev) {
    // 开发环境加载本地服务器
    mainWindow.loadURL(WINDOW_CONFIG.devServerUrl)
    if (process.env.ELECTRON_SHOW_DEV_TOOLS === 'true') {
      mainWindow.webContents.openDevTools()
    }
  } else {
    // 生产环境加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'))
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window when the dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})