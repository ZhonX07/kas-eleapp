import { inject } from 'vue'

// 统一的通知接口
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