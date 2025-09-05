<template>
  <transition-group name="notification-fade" tag="div" class="notification-container">
    <div v-for="notification in notifications" :key="notification.id" 
         class="notification" :class="notification.type">
      <div class="notification-icon">
        {{ notification.type === 'praise' ? '🏆' : notification.type === 'criticism' ? '⚠️' : 'ℹ️' }}
      </div>
      <div class="notification-content">
        <div class="notification-title">{{ notification.title }}</div>
        <div class="notification-message">{{ notification.message }}</div>
        <div v-if="notification.time" class="notification-time">{{ notification.time }}</div>
      </div>
      <button class="close-btn" @click="removeNotification(notification.id)">×</button>
    </div>
  </transition-group>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { reportsAPI } from '../utils/api-unified.js'

const notifications = ref([])
let lastReportCount = 0
let lastCheckTime = new Date()
const CHECK_INTERVAL = 30000 // 30秒检查一次
const NOTIFICATION_TIMEOUT = 8000 // 8秒后自动关闭
let checkTimer = null

// 添加通知
function addNotification(notification) {
  const id = Date.now() + Math.random().toString(36).substr(2, 5)
  const notificationWithId = {
    id,
    time: new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    ...notification
  }
  
  // 添加到列表顶部
  notifications.value.unshift(notificationWithId)
  
  // 限制最大显示数量
  if (notifications.value.length > 5) {
    // 移除最老的通知
    notifications.value.pop()
  }
  
  // 自动关闭
  setTimeout(() => {
    removeNotification(id)
  }, NOTIFICATION_TIMEOUT)
  
  // 尝试播放声音(可选)
  playNotificationSound(notification.type)
  
  return id
}

// 移除通知
function removeNotification(id) {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
  }
}

// 播放通知声音(可选)
function playNotificationSound(type) {
  try {
    // 根据通知类型播放不同声音
    const audio = new Audio()
    if (type === 'praise') {
      audio.src = '/sounds/praise.mp3'
    } else if (type === 'criticism') {
      audio.src = '/sounds/criticism.mp3'
    } else {
      audio.src = '/sounds/notification.mp3'
    }
    audio.volume = 0.5
    audio.play().catch(e => console.error('播放通知声音失败:', e))
  } catch (e) {
    console.error('播放通知声音失败:', e)
  }
}

// 检查新通报
async function checkNewReports() {
  try {
    const response = await reportsAPI.getTodayStats()
    
    if (response.success) {
      const newTotal = response.data.summary.total
      
      if (lastReportCount !== null && newTotal > lastReportCount) {
        const newReportsCount = newTotal - lastReportCount
        addNotification({
          type: 'info',
          title: '新通报',
          message: `收到 ${newReportsCount} 条新通报`
        })
      }
      
      lastReportCount = newTotal
    }
  } catch (error) {
    console.error('检查新通报失败:', error)
  }
}

onMounted(() => {
  // 初始化获取当前通报数
  checkNewReports()
  
  // 定时检查新通报
  checkTimer = setInterval(checkNewReports, CHECK_INTERVAL)
})

onUnmounted(() => {
  if (checkTimer) {
    clearInterval(checkTimer)
  }
})

// 暴露方法供其他组件调用
defineExpose({
  addNotification,
  removeNotification
})
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1100;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.notification {
  display: flex;
  align-items: flex-start;
  padding: 12px 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slide-in 0.3s ease forwards;
  pointer-events: auto;
  border-left: 4px solid #4a6cf7;
}

.notification.praise {
  border-left-color: #27ae60;
  background: #f0fff4;
}

.notification.criticism {
  border-left-color: #e74c3c;
  background: #fff5f5;
}

.notification-icon {
  margin-right: 12px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 5px;
  color: #2c3e50;
}

.notification-message {
  font-size: 0.9rem;
  color: #4a5568;
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: #a0aec0;
  margin-top: 5px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #a0aec0;
  cursor: pointer;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 24px;
}

.close-btn:hover {
  color: #4a5568;
}

.notification-fade-enter-active, 
.notification-fade-leave-active {
  transition: all 0.3s;
}

.notification-fade-enter-from, 
.notification-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@keyframes slide-in {
  from {
    transform: translateX(30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .notification-container {
    width: calc(100% - 30px);
    right: 15px;
    top: 10px;
  }
  
  .notification {
    font-size: 0.9rem;
  }
}
</style>