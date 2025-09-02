const { app, BrowserWindow } = require('electron')
const path = require('path')
const isDev = !app.isPackaged || process.env.NODE_ENV === 'development'

function createWindow() {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // 允许跨域请求
      preload: path.join(__dirname, 'preload.js')
    },
    show: false // 先隐藏窗口，等待ready-to-show事件
  })

  // 窗口准备好显示时再显示，避免闪烁
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 配置CSP以允许跨域请求
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

  // 加载应用
  if (isDev) {
    // 开发环境加载本地服务器
    console.log('加载开发服务器URL: http://localhost:5173')
    mainWindow.loadURL('http://localhost:5173')
    // 开发环境下打开开发者工具
    mainWindow.webContents.openDevTools()
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