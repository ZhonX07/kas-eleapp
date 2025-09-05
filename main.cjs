const { app, BrowserWindow } = require('electron')
const path = require('path')
const isDev = !app.isPackaged || process.env.NODE_ENV === 'development'

// 从环境变量获取配置
const CONFIG = {
  window: {
    width: parseInt(process.env.ELECTRON_WINDOW_WIDTH || '1200'),
    height: parseInt(process.env.ELECTRON_WINDOW_HEIGHT || '800')
  },
  devServer: {
    url: process.env.ELECTRON_DEV_SERVER_URL || 'http://localhost:5173',
    openDevTools: process.env.ELECTRON_SHOW_DEV_TOOLS === 'true'
  }
}

function createWindow() {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: CONFIG.window.width,
    height: CONFIG.window.height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: !isDev, // 开发环境禁用，生产环境启用
      preload: path.join(__dirname, 'preload.js')
    },
    show: false // 先隐藏窗口，等待ready-to-show事件
  })

  // 窗口准备好显示时再显示，避免闪烁
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 配置CSP以允许跨域请求（仅开发环境）
  if (isDev) {
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Access-Control-Allow-Origin': ['*'],
          'Access-Control-Allow-Methods': ['GET, POST, OPTIONS, PUT, DELETE'],
          'Access-Control-Allow-Headers': ['Content-Type, Authorization']
        }
      });
    });
  }

  // 加载应用
  if (isDev) {
    // 开发环境加载本地服务器
    console.log('加载开发服务器URL:', CONFIG.devServer.url)
    mainWindow.loadURL(CONFIG.devServer.url)
    
    // 开发环境下打开开发者工具
    if (CONFIG.devServer.openDevTools) {
      mainWindow.webContents.openDevTools()
    }
  } else {
    // 生产环境加载打包后的文件
    console.log('加载生产环境文件')
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'))
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow()

  console.log('Electron 应用已启动')
  console.log('开发模式:', isDev)
  console.log('窗口配置:', CONFIG.window)
})

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