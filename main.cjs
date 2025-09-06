const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

// 更准确的开发环境检测
const isDev = !app.isPackaged

console.log('=== 应用启动调试信息 ===')
console.log('- isPackaged:', app.isPackaged)
console.log('- NODE_ENV:', process.env.NODE_ENV)
console.log('- isDev:', isDev)
console.log('- __dirname:', __dirname)
console.log('- process.cwd():', process.cwd())

// 应用配置
const CONFIG = {
  window: {
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600
  },
  devServer: {
    url: 'http://localhost:5173'
  }
}

let mainWindow = null

// 安全地显示错误信息
function showError(title, message, detail = '') {
  console.error(`${title}: ${message}`)
  if (detail) console.error('详细信息:', detail)
  
  try {
    dialog.showErrorBox(title, `${message}\n\n${detail}`)
  } catch (e) {
    console.error('无法显示错误对话框:', e)
  }
}

function findIndexFile() {
  console.log('=== 查找index.html文件 ===')
  console.log('当前工作目录:', process.cwd())
  console.log('主进程文件目录:', __dirname)
  console.log('应用路径:', app.getAppPath())
  
  const possiblePaths = [
    path.join(__dirname, 'dist', 'index.html'),
    path.join(__dirname, '..', 'dist', 'index.html'),
    path.join(process.resourcesPath, 'app', 'dist', 'index.html'),
    path.join(process.resourcesPath, 'dist', 'index.html'),
    path.join(app.getAppPath(), 'dist', 'index.html'),
    path.join(process.cwd(), 'dist', 'index.html')
  ]
  
  for (const testPath of possiblePaths) {
    console.log('检查:', testPath)
    try {
      if (fs.existsSync(testPath)) {
        console.log('✅ 找到文件:', testPath)
        return testPath
      }
    } catch (e) {
      console.log('❌ 检查失败:', e.message)
    }
  }
  
  // 列出当前目录内容
  console.log('=== 当前目录内容 ===')
  console.log('__dirname 内容:')
  try {
    const currentDir = fs.readdirSync(__dirname)
    currentDir.forEach(item => {
      const fullPath = path.join(__dirname, item)
      const stats = fs.statSync(fullPath)
      console.log(`${stats.isDirectory() ? '[DIR]' : '[FILE]'} ${item}`)
    })
  } catch (e) {
    console.error('无法读取__dirname:', e.message)
  }
  
  // 检查应用路径
  console.log('=== 应用路径内容 ===')
  try {
    const appPath = app.getAppPath()
    const appDir = fs.readdirSync(appPath)
    appDir.forEach(item => {
      const fullPath = path.join(appPath, item)
      const stats = fs.statSync(fullPath)
      console.log(`${stats.isDirectory() ? '[DIR]' : '[FILE]'} ${item}`)
    })
    
    // 如果存在dist目录，列出其内容
    const distPath = path.join(appPath, 'dist')
    if (fs.existsSync(distPath)) {
      console.log('=== dist目录内容 ===')
      const distFiles = fs.readdirSync(distPath)
      distFiles.forEach(file => console.log(`  ${file}`))
    }
  } catch (e) {
    console.error('无法读取应用路径:', e.message)
  }
  
  return null
}

function createWindow() {
  console.log('=== 创建主窗口 ===')
  
  try {
    // 创建浏览器窗口
    mainWindow = new BrowserWindow({
      width: CONFIG.window.width,
      height: CONFIG.window.height,
      minWidth: CONFIG.window.minWidth,
      minHeight: CONFIG.window.minHeight,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        webSecurity: !isDev
        // 暂时注释掉preload，避免路径问题
        // preload: path.join(__dirname, 'preload.js')
      },
      show: false,
      titleBarStyle: 'default',
      frame: true,
      resizable: true,
      maximizable: true
    })

    console.log('窗口创建成功')

    // 窗口准备好显示时再显示
    mainWindow.once('ready-to-show', () => {
      console.log('窗口准备就绪，显示窗口')
      mainWindow.show()
      
      if (isDev) {
        mainWindow.webContents.openDevTools()
      }
    })

    // 错误处理
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('页面加载失败:', {
        errorCode,
        errorDescription,
        validatedURL
      })
      showError('页面加载失败', `错误代码: ${errorCode}\n描述: ${errorDescription}\nURL: ${validatedURL}`)
    })

    // 加载应用
    if (isDev) {
      console.log('开发环境 - 尝试连接:', CONFIG.devServer.url)
      mainWindow.loadURL(CONFIG.devServer.url).catch(err => {
        console.error('开发服务器连接失败:', err)
        showError('开发服务器错误', '无法连接到开发服务器', '请确保运行了 npm run dev')
      })
    } else {
      console.log('生产环境 - 查找本地文件')
      const indexPath = findIndexFile()
      
      if (indexPath) {
        console.log('加载文件:', indexPath)
        mainWindow.loadFile(indexPath).catch(err => {
          console.error('文件加载失败:', err)
          showError('文件加载错误', '无法加载应用文件', err.message)
        })
      } else {
        showError('文件未找到', '无法找到应用的HTML文件', '请重新安装应用或联系技术支持')
      }
    }

    // 窗口关闭事件
    mainWindow.on('closed', () => {
      mainWindow = null
    })

    // 创建简化菜单
    createSimpleMenu()

  } catch (error) {
    console.error('创建窗口失败:', error)
    showError('窗口创建失败', error.message)
  }
}

function createSimpleMenu() {
  const template = [
    {
      label: '应用',
      submenu: [
        {
          label: '重新加载',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload()
            }
          }
        },
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools()
            }
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '调试信息',
          click: () => {
            if (!mainWindow) return
            
            const debugInfo = [
              `应用版本: ${app.getVersion()}`,
              `Electron版本: ${process.versions.electron}`,
              `Node.js版本: ${process.versions.node}`,
              `平台: ${process.platform} ${process.arch}`,
              `打包状态: ${app.isPackaged ? '已打包' : '开发模式'}`,
              `当前目录: ${__dirname}`,
              `应用路径: ${app.getAppPath()}`
            ].join('\n')
            
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '调试信息',
              message: '应用环境信息',
              detail: debugInfo,
              buttons: ['确定']
            })
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// 应用初始化
app.whenReady().then(() => {
  console.log('=== Electron 应用已准备就绪 ===')
  console.log('版本:', app.getVersion())
  
  try {
    createWindow()
  } catch (error) {
    console.error('应用启动失败:', error)
    showError('启动失败', '应用无法启动', error.message)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
}).catch(error => {
  console.error('应用初始化失败:', error)
  showError('初始化失败', '应用无法初始化', error.message)
})

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
  showError('系统错误', '应用遇到未处理的错误', error.message)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason)
  showError('Promise错误', '应用遇到未处理的Promise错误', reason.toString())
})

// 简化的IPC处理
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

console.log('=== main.cjs 加载完成 ===')