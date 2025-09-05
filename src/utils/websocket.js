/**
 * WebSocket 客户端工具
 */

import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useNotification } from './notification'

// WebSocket连接状态
export const connectionStatus = ref('disconnected') // 'disconnected', 'connecting', 'connected'
export const wsMessages = reactive([])
export const wsStats = reactive({
  connected: false,
  messagesReceived: 0,
  lastMessageTime: null,
  reconnectAttempts: 0
})

let socket = null
let reconnectTimer = null
const RECONNECT_INTERVAL = 5000 // 5秒后重连
const MAX_RECONNECT_ATTEMPTS = 5 // 最大重连次数
const MAX_MESSAGES = 50 // 最大保存消息数量

// API基础URL（从环境变量获取）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://117.72.79.92:8080'
const WS_URL = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://')

// 消息处理器映射表
const messageHandlers = {}

// 注册消息处理器
export function registerMessageHandler(type, handler) {
  messageHandlers[type] = handler
  return () => {
    delete messageHandlers[type]
  }
}

// 连接到WebSocket服务器
export function connect() {
  if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
    console.log('WebSocket已连接，无需重复连接')
    return
  }
  
  connectionStatus.value = 'connecting'
  
  console.log('尝试连接WebSocket:', WS_URL)
  
  try {
    socket = new WebSocket(WS_URL)
    
    socket.onopen = () => {
      console.log('WebSocket已连接')
      connectionStatus.value = 'connected'
      wsStats.connected = true
      wsStats.reconnectAttempts = 0
      
      // 发送订阅消息
      socket.send(JSON.stringify({
        type: 'subscribe',
        channels: ['reports']
      }))
      
      // 清除重连定时器
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
    }
    
    // 处理收到的消息
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        console.log('收到WebSocket消息:', message)
        
        // 发送自定义事件到应用程序
        if (message.type === 'new-report') {
          // 触发新通报事件
          window.dispatchEvent(new CustomEvent('new-report', {
            detail: message.data
          }))
        }
        
        // 发送通用WebSocket消息事件
        window.dispatchEvent(new CustomEvent('websocket-message', {
          detail: message
        }))
        
      } catch (error) {
        console.error('解析WebSocket消息失败:', error)
      }
    }
    
    socket.onclose = (event) => {
      console.log(`WebSocket连接已关闭，代码: ${event.code}, 原因: ${event.reason}`)
      connectionStatus.value = 'disconnected'
      wsStats.connected = false
      
      // 自动重连逻辑
      if (wsStats.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        wsStats.reconnectAttempts++
        console.log(`尝试重新连接 (${wsStats.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`)
        
        // 设置重连定时器
        reconnectTimer = setTimeout(() => {
          console.log('尝试重新连接WebSocket...')
          connect()
        }, RECONNECT_INTERVAL)
      } else {
        console.warn(`达到最大重连次数 (${MAX_RECONNECT_ATTEMPTS})，不再尝试重连`)
      }
    }
    
    socket.onerror = (error) => {
      console.error('WebSocket错误:', error)
      connectionStatus.value = 'disconnected'
    }
  } catch (error) {
    console.error('创建WebSocket连接失败:', error)
    connectionStatus.value = 'disconnected'
  }
}

// 断开连接
export function disconnect() {
  if (socket) {
    socket.close()
    socket = null
  }
  
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  
  connectionStatus.value = 'disconnected'
  wsStats.connected = false
}

// 发送消息
export function sendMessage(message) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket未连接，无法发送消息')
    return false
  }
  
  try {
    socket.send(JSON.stringify(message))
    return true
  } catch (error) {
    console.error('发送WebSocket消息失败:', error)
    return false
  }
}

// 使用组合式API的WebSocket钩子
export function useWebSocket() {
  const notification = useNotification()
  
  // 处理新通报消息
  function handleNewReport(message) {
    if (message.type === 'newReport' && message.data) {
      const report = message.data
      
      // 显示通知
      notification.show({
        type: report.isadd ? 'praise' : 'criticism',
        title: `${report.class}班 ${report.isadd ? '表扬' : '违纪'}通报`,
        message: report.note
      })
      
      // 触发自定义事件，让组件可以响应
      const reportEvent = new CustomEvent('new-report', { detail: report })
      window.dispatchEvent(reportEvent)
    }
  }
  
  onMounted(() => {
    // 注册消息处理器
    const unregister = registerMessageHandler('newReport', handleNewReport)
    
    // 连接WebSocket
    connect()
    
    // 清理函数
    onUnmounted(() => {
      unregister()
    })
  })
  
  return {
    connectionStatus,
    wsMessages,
    wsStats,
    connect,
    disconnect,
    sendMessage
  }
}

// 初始化WebSocket
export function initWebSocket() {
  // 注册全局消息处理器
  registerMessageHandler('newReport', (message) => {
    if (message.type === 'newReport' && message.data) {
      console.log('收到新通报:', message.data)
      
      // 触发自定义事件
      const reportEvent = new CustomEvent('new-report', { detail: message.data })
      window.dispatchEvent(reportEvent)
    }
  })
  
  // 连接
  connect()
  
  // 监听页面可见性变化，优化连接管理
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      connect()
    } else {
      // 可选：当页面不可见时断开连接以节省资源
      // disconnect()
    }
  })
  
  // 在页面卸载前断开连接
  window.addEventListener('beforeunload', () => {
    disconnect()
  })
}

// 自动连接（仅在启用WebSocket时）
if (import.meta.env.VITE_ENABLE_WEBSOCKET === 'true') {
  connect()
}