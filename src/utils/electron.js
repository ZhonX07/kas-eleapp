// 检测是否在Electron环境中运行
export const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI
}

// 获取Electron API
export const getElectronAPI = () => {
  if (isElectron()) {
    return window.electronAPI
  }
  return null
}

// 显示系统通知
export const showNotification = (title, body, options = {}) => {
  const electronAPI = getElectronAPI()
  if (electronAPI) {
    electronAPI.showNotification(title, body, options)
  } else {
    // 浏览器环境回退
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body, ...options })
        }
      })
    }
  }
}

// 显示消息框
export const showMessageBox = async (options) => {
  const electronAPI = getElectronAPI()
  if (electronAPI) {
    return await electronAPI.showMessageBox(options)
  } else {
    // 浏览器环境回退
    return { response: window.confirm(options.message) ? 0 : 1 }
  }
}

// 获取应用版本
export const getAppVersion = async () => {
  const electronAPI = getElectronAPI()
  if (electronAPI) {
    return await electronAPI.getVersion()
  }
  return 'Web版本'
}

// 获取平台信息
export const getPlatformInfo = () => {
  const electronAPI = getElectronAPI()
  if (electronAPI) {
    return {
      platform: electronAPI.platform,
      arch: electronAPI.arch,
      isDev: electronAPI.isDev
    }
  }
  return {
    platform: 'web',
    arch: 'unknown',
    isDev: false
  }
}
