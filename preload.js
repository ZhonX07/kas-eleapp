// 预加载脚本用于在渲染进程中安全地暴露Node.js API

const { contextBridge, ipcRenderer } = require('electron')

// 向渲染进程暴露安全的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 应用信息
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // 系统信息
  platform: process.platform,
  arch: process.arch,
  
  // 通知功能
  showNotification: (title, body, options = {}) => {
    if ('Notification' in window) {
      new Notification(title, { body, ...options })
    }
  },
  
  // 消息框
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  
  // 环境检测
  isDev: process.env.NODE_ENV === 'development',
  
  // 文件系统访问（如果需要）
  // openFile: () => ipcRenderer.invoke('dialog:openFile'),
  // saveFile: (data) => ipcRenderer.invoke('dialog:saveFile', data),
})

// DOM加载完成后的处理
window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Electron 预加载脚本已执行')
  console.log('📱 平台:', process.platform)
  console.log('🏗️ 架构:', process.arch)
})
