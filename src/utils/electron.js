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
  if (electronAPI && typeof electronAPI.showNotification === 'function') {
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
  if (electronAPI && typeof electronAPI.showMessageBox === 'function') {
    return await electronAPI.showMessageBox(options)
  } else {
    // 浏览器环境回退
    return { response: window.confirm(options.message) ? 0 : 1 }
  }
}

// 获取应用版本
export const getAppVersion = async () => {
  const electronAPI = getElectronAPI()
  if (electronAPI && typeof electronAPI.getVersion === 'function') {
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

// 轻量提示音（Web Audio），避免外部音频依赖
let __audioCtx = null
function ensureAudioContext() {
  if (typeof window === 'undefined') return null
  try {
    __audioCtx = __audioCtx || new (window.AudioContext || window.webkitAudioContext)()
    if (__audioCtx.state === 'suspended') {
      __audioCtx.resume().catch(() => {})
    }
    return __audioCtx
  } catch {
    return null
  }
}

// 播放提示音（频率/时长/音量可调）
export const playBeep = ({ frequency = 880, duration = 160, volume = 0.08, type = 'triangle' } = {}) => {
  const ctx = ensureAudioContext()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration / 1000)
  } catch {
    // 忽略声音失败
  }
}
