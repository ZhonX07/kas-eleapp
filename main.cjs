const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const { pathToFileURL } = require('url')

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
        webSecurity: !isDev,
        preload: path.join(__dirname, 'preload.js')
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
      // 直接进入登录页
      mainWindow.loadURL(`${CONFIG.devServer.url}#/login`).catch(err => {
        console.error('开发服务器连接失败:', err)
        showError('开发服务器错误', '无法连接到开发服务器', '请确保运行了 npm run dev')
      })
    } else {
      console.log('生产环境 - 查找本地文件')
      const indexPath = path.join(__dirname, 'dist/index.html')
      
      if (fs.existsSync(indexPath)) {
        console.log('加载文件:', indexPath)
        // 使用 file:// URL 并追加 #/login
        const fileUrl = `${pathToFileURL(indexPath).toString()}#/login`
        mainWindow.loadURL(fileUrl).catch(err => {
          console.error('文件加载失败:', err)
          showError('文件加载错误', '无法加载应用文件', err.message)
        })
      } else {
        showError('文件未找到', '无法找到应用的HTML文件 (dist/index.html)', `路径 ${indexPath} 不存在。请检查打包配置。`)
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

// 所有窗口关闭时退出应用 - 修复进程残留问题
app.on('window-all-closed', () => {
  console.log('所有窗口已关闭，准备退出应用')
  if (process.platform !== 'darwin') {
    const quitTimer = setTimeout(() => {
      console.log('强制退出以清理残留进程')
      app.exit(0)
    }, 2000)
    app.once('will-quit', () => clearTimeout(quitTimer))
    app.quit()
  }
})

// 应用退出前的清理
app.on('before-quit', (event) => {
  console.log('应用准备退出，进行清理...')
  
  // 关闭所有窗口
  BrowserWindow.getAllWindows().forEach(window => {
    if (!window.isDestroyed()) {
      window.destroy()
    }
  })
})

// 添加应用退出事件
app.on('will-quit', (event) => {
  console.log('应用即将退出')
})

// 错误处理 - 防止未捕获异常导致进程残留
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
  showError('系统错误', '应用遇到未处理的错误', error.message)
  
  // 优雅退出
  setTimeout(() => {
    process.exit(1)
  }, 2000)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason)
  showError('Promise错误', '应用遇到未处理的Promise错误', reason.toString())
})

// 监听系统关闭信号
process.on('SIGINT', () => {
  console.log('收到SIGINT信号，退出应用')
  app.quit()
})

process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，退出应用')
  app.quit()
})

// 简化的IPC处理
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

// 新增：供渲染进程调用的消息框
ipcMain.handle('show-message-box', (event, options) => {
  const win = BrowserWindow.getFocusedWindow() || null
  return dialog.showMessageBox(win, options)
})

console.log('=== main.cjs 加载完成 ===')