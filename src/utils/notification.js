import { inject, ref } from 'vue'

// 通知设置
const settings = ref({
  enabled: true,
  sound: false, // 默认关闭声音，避免文件缺失报错
  desktop: true,
  toast: true
})

// 获取通知设置
export function getNotificationSettings() {
  // 尝试从本地存储加载设置
  try {
    const savedSettings = localStorage.getItem('notification-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      settings.value = { ...settings.value, ...parsed }
    }
  } catch (e) {
    console.warn('加载通知设置失败:', e)
  }
  
  return settings
}

// 保存通知设置
export function saveNotificationSettings(newSettings) {
  settings.value = { ...settings.value, ...newSettings }
  
  try {
    localStorage.setItem('notification-settings', JSON.stringify(settings.value))
  } catch (e) {
    console.warn('保存通知设置失败:', e)
  }
}

// 内联音频播放，不依赖外部文件
function playInlineSound() {
  try {
    if (!settings.value.sound) return;
    
    // 使用 Web Audio API 创建简单音调，不需要外部文件
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.1;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 200);
  } catch (e) {
    console.warn('播放内联通知声音失败:', e);
  }
}

// 显示通知
export function showNotification(title, body, options = {}) {
  if (!settings.value.enabled) return;
  
  // 播放声音
  if (settings.value.sound) {
    playInlineSound();
  }
  
  // 桌面通知
  if (settings.value.desktop && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, ...options });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body, ...options });
        }
      });
    }
  }
  
  // 可以在此添加更多通知方式（如页面内toast）
}

// 组合式API钩子
export function useNotification() {
  const notification = inject('notification')
  
  if (!notification) {
    console.warn('notification provider not found, notifications will be disabled')
    
    // 返回无操作的通知接口
    return {
      show: () => { console.warn('通知系统未初始化') },
      success: () => { console.warn('通知系统未初始化') },
      error: () => { console.warn('通知系统未初始化') },
      info: () => { console.warn('通知系统未初始化') }
    }
  }
  
  // 扩展通知接口，增加便捷方法
  return {
    // 基本通知
    show: notification.show,
    
    // 成功通知
    success: (title, message) => {
      notification.show({
        type: 'praise',
        title,
        message
      })
    },
    
    // 错误通知
    error: (title, message) => {
      notification.show({
        type: 'criticism',
        title,
        message
      })
    },
    
    // 信息通知
    info: (title, message) => {
      notification.show({
        type: 'info',
        title,
        message
      })
    }
  }
}