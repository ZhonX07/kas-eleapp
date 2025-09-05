<template>
  <div class="report-live-card" :class="{ expanded: isExpanded, minimized: isMinimized }">
    <!-- 最小化状态只显示图标和数字 -->
    <div v-if="isMinimized" class="minimized-view" @click="toggleMinimize">
      <div class="bubble-icon">📊</div>
      <div class="bubble-count">{{ summary.total || 0 }}</div>
    </div>
    
    <!-- 正常卡片视图 -->
    <template v-else>
      <div class="card-header">
        <div class="title" @click="toggleExpand">
          <span class="icon">📊</span>
          <span>今日通报: {{ summary.total || 0 }}</span>
          <span class="connection-status" :class="connectionStatus" :title="getConnectionStatusText()">
            ●
          </span>
        </div>
        <div class="actions">
          <button class="action-btn minimize-btn" @click="toggleMinimize" title="最小化">_</button>
          <button class="action-btn toggle-btn" @click="toggleExpand" title="展开/收起">
            {{ isExpanded ? '↑' : '↓' }}
          </button>
        </div>
      </div>
      
      <div class="card-summary">
        <div class="summary-item praise">
          <span class="label">表扬</span>
          <span class="value">+{{ summary.positive || 0 }}</span>
        </div>
        <div class="summary-item criticism">
          <span class="label">违纪</span>
          <span class="value">-{{ summary.negative || 0 }}</span>
        </div>
        <button class="refresh-btn" @click="fetchData" :disabled="loading" title="刷新数据">
          <span class="refresh-icon" :class="{ rotating: loading }">🔄</span>
        </button>
      </div>
      
      <transition name="slide">
        <div v-if="isExpanded" class="card-content">
          <div v-if="loading && !reports.length" class="loading">
            <div class="loading-spinner"></div>
            <span>加载中...</span>
          </div>
          <div v-else-if="error" class="error">
            <span class="error-icon">⚠️</span>
            <span>{{ error }}</span>
            <div class="error-actions">
              <button class="retry-btn" @click="fetchData">重试</button>
              <button class="check-server-btn" @click="checkServerStatus">检查服务状态</button>
            </div>
            <div class="error-help">
              <small>后端服务应运行在: <code>{{ apiBaseUrl }}</code></small>
              <details class="server-help">
                <summary>启动后端服务器帮助</summary>
                <div class="help-content">
                  <p>在 Rocky Linux 上启动后端:</p>
                  <code>cd /path/to/kas-dev/backend && npm start</code>
                  <p>或检查服务状态:</p>
                  <code>curl {{ apiBaseUrl }}/health</code>
                </div>
              </details>
            </div>
          </div>
          <div v-else-if="!reports.length" class="empty">今日暂无通报</div>
          <div v-else class="reports-list">
            <div v-for="report in reports" :key="report.id" 
                class="report-item" :class="{'praise': report.isadd, 'criticism': !report.isadd}">
              <div class="item-header">
                <span class="class-name">{{ report.class }}班</span>
                <span class="score-change" :class="{'positive': report.isadd, 'negative': !report.isadd}">
                  {{ report.isadd ? '+' : '-' }}{{ report.changescore }}
                </span>
              </div>
              <div class="item-body">{{ report.note }}</div>
              <div class="item-meta">
                <span class="submitter">{{ report.submitter || '系统' }}</span>
                <span class="time">{{ formatTime(report.submittime) }}</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <span class="update-time">更新: {{ lastUpdate }}</span>
            <button v-if="reports.length > 5" class="view-all-btn" @click="navigateToReports">
              查看全部
            </button>
          </div>
        </div>
      </transition>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { reportsAPI } from '../utils/api-updated.js'
import { useWebSocket } from '../utils/websocket'

const router = useRouter()
const { connectionStatus } = useWebSocket()
const isExpanded = ref(false)
const isMinimized = ref(false)
const reports = ref([])
const loading = ref(false)
const error = ref('')
const lastUpdate = ref('--:--')
const summary = ref({
  total: 0,
  positive: 0,
  negative: 0
})

// 环境变量
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// 本地存储键名
const STORAGE_KEY = 'report-card-state'

// 刷新间隔(毫秒)
const REFRESH_INTERVAL = 60000 // 60秒
let refreshTimer = null

// 展开/收起卡片
function toggleExpand() {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value && reports.value.length === 0) {
    fetchData()
  }
  saveCardState()
}

// 最小化/恢复卡片
function toggleMinimize() {
  isMinimized.value = !isMinimized.value
  saveCardState()
}

// 保存卡片状态到本地存储
function saveCardState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      isExpanded: isExpanded.value,
      isMinimized: isMinimized.value
    }))
  } catch (e) {
    console.error('保存卡片状态失败:', e)
  }
}

// 从本地存储加载卡片状态
function loadCardState() {
  try {
    const state = localStorage.getItem(STORAGE_KEY)
    if (state) {
      const { isExpanded: expanded, isMinimized: minimized } = JSON.parse(state)
      isExpanded.value = expanded
      isMinimized.value = minimized
    }
  } catch (e) {
    console.error('加载卡片状态失败:', e)
  }
}

// 格式化时间
function formatTime(timeString) {
  if (!timeString) return '--:--'
  
  try {
    const date = new Date(timeString)
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return '--:--'
  }
}

// 获取数据
async function fetchData() {
  if (loading.value) return
  
  try {
    loading.value = true
    error.value = ''
    
    const response = await reportsAPI.getTodayDetails()
    
    if (!response.success) {
      throw new Error(response.message || '获取数据失败')
    }
    
    // 排序并限制数量
    reports.value = (response.data.allReports || [])
      .sort((a, b) => new Date(b.submittime) - new Date(a.submittime))
      .slice(0, 5)
    
    summary.value = {
      total: response.data.summary.total || 0,
      positive: response.data.summary.praise || 0, 
      negative: response.data.summary.criticism || 0
    }
    
    lastUpdate.value = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
    
    console.log('实时数据刷新成功')
  } catch (err) {
    console.error('获取实时数据失败:', err)
    if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
      error.value = `无法连接到后端服务器 (${apiBaseUrl})。请先启动后端服务器。`
    } else {
      error.value = err.message || '获取数据失败'
    }
  } finally {
    loading.value = false
  }
}

// 导航到完整报告页面
function navigateToReports() {
  router.push('/reports')
}

// 设置WebSocket消息监听器
function setupWebSocketListener() {
  // 监听新通报事件
  window.addEventListener('new-report', handleNewReport)
  
  // 监听WebSocket消息
  window.addEventListener('websocket-message', handleWebSocketMessage)
}

// 处理WebSocket消息
function handleWebSocketMessage(event) {
  const message = event.detail
  
  if (message.type === 'new-report') {
    handleNewReport({ detail: message.data })
  }
}

// 处理新通报
function handleNewReport(event) {
  const newReport = event.detail
  
  // 如果是今天的通报，添加到列表并更新统计
  if (newReport) {
    console.log('收到新通报:', newReport)
    
    // 更新统计数据
    summary.value.total += 1
    if (newReport.isadd) {
      summary.value.positive += 1
    } else {
      summary.value.negative += 1
    }
    
    // 添加到列表顶部
    reports.value.unshift(newReport)
    
    // 保持列表不超过5条
    if (reports.value.length > 5) {
      reports.value.pop()
    }
    
    // 更新最后更新时间
    lastUpdate.value = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
    
    console.log('实时通报列表已更新')
  }
}

// 获取连接状态文本
function getConnectionStatusText() {
  switch (connectionStatus.value) {
    case 'connected':
      return 'WebSocket已连接'
    case 'connecting':
      return 'WebSocket连接中...'
    case 'disconnected':
    default:
      return 'WebSocket未连接'
  }
}

// 检查服务器状态
async function checkServerStatus() {
  try {
    const response = await fetch(`${apiBaseUrl}/health`)
    if (response.ok) {
      const data = await response.json()
      error.value = `服务器运行正常 (${data.status}) - ${data.timestamp}`
      setTimeout(() => {
        error.value = ''
        fetchData()
      }, 2000)
    } else {
      error.value = `服务器响应异常 (状态码: ${response.status})`
    }
  } catch (err) {
    console.error('检查服务器状态失败:', err)
    error.value = '无法连接到服务器，请确保后端服务已在 Rocky Linux 上启动'
  }
}

onMounted(() => {
  // 加载卡片状态
  loadCardState()
  
  // 获取初始数据
  fetchData()
  
  // 设置定时刷新
  refreshTimer = setInterval(fetchData, REFRESH_INTERVAL)
  
  // 设置WebSocket监听
  setupWebSocketListener()
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  // 移除WebSocket监听
  window.removeEventListener('new-report', handleNewReport)
  window.removeEventListener('websocket-message', handleWebSocketMessage)
})
</script>

<style scoped>
.report-live-card {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  transition: all 0.3s ease;
  max-height: 80vh;
}

.report-live-card.expanded {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.report-live-card.minimized {
  width: auto;
  height: auto;
  background: transparent;
  box-shadow: none;
}

.minimized-view {
  display: flex;
  cursor: pointer;
  position: relative;
}

.bubble-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: #4a6cf7;
  color: white;
  border-radius: 50%;
  font-size: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.bubble-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #eaecef;
}

.title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  cursor: pointer;
  flex: 1;
}

.icon {
  font-size: 1.2rem;
}

.connection-status {
  font-size: 0.8rem;
  margin-left: auto;
}

.connection-status.connected {
  color: #27ae60;
}

.connection-status.connecting {
  color: #f39c12;
  animation: pulse 1s infinite;
}

.connection-status.disconnected {
  color: #e74c3c;
}

.actions {
  display: flex;
  gap: 5px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #7f8c8d;
  font-size: 0.9rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.card-summary {
  display: flex;
  padding: 10px 15px;
  background: #fff;
  border-bottom: 1px solid #eaecef;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 0 10px;
}

.summary-item.praise {
  border-right: 1px solid #eaecef;
}

.summary-item .label {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 3px;
}

.summary-item .value {
  font-size: 1.2rem;
  font-weight: 600;
}

.summary-item.praise .value {
  color: #27ae60;
}

.summary-item.criticism .value {
  color: #e74c3c;
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.refresh-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.refresh-icon {
  display: inline-block;
}

.refresh-icon.rotating {
  animation: rotate 1s linear infinite;
}

.card-content {
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
  background: #f8f9fa;
}

.loading, .error, .empty {
  padding: 20px 0;
  text-align: center;
  color: #7f8c8d;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e6e6e6;
  border-top: 3px solid #4a6cf7;
  border-radius: 50%;
  animation: rotate 1s linear infinite;
}

.error {
  color: #e74c3c;
}

.error-icon {
  font-size: 1.5rem;
}

.retry-btn {
  background: #f1f2f6;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 5px;
}

.error-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.check-server-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.check-server-btn:hover {
  background: #2980b9;
}

.error-help {
  margin-top: 8px;
  font-size: 0.75rem;
  color: #95a5a6;
}

.error-help code {
  background: #f1f2f6;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.server-help {
  margin-top: 8px;
}

.server-help summary {
  cursor: pointer;
  color: #3498db;
  font-size: 0.8rem;
}

.server-help summary:hover {
  text-decoration: underline;
}

.help-content {
  margin-top: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #3498db;
}

.help-content p {
  margin: 4px 0;
  font-size: 0.75rem;
}

.help-content code {
  display: block;
  background: #2c3e50;
  color: #ecf0f1;
  padding: 4px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  margin: 4px 0;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-item {
  padding: 12px;
  border-radius: 6px;
  background: white;
  border-left: 3px solid #95a5a6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.report-item.praise {
  border-left-color: #27ae60;
}

.report-item.criticism {
  border-left-color: #e74c3c;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.class-name {
  font-weight: 600;
  color: #2c3e50;
}

.score-change {
  font-weight: 600;
}

.score-change.positive {
  color: #27ae60;
}

.score-change.negative {
  color: #e74c3c;
}

.item-body {
  font-size: 0.9rem;
  color: #2c3e50;
  line-height: 1.4;
  margin-bottom: 8px;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #95a5a6;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #eaecef;
  font-size: 0.8rem;
  color: #7f8c8d;
}

.view-all-btn {
  background: none;
  border: none;
  color: #4a6cf7;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 3px 6px;
}

.view-all-btn:hover {
  text-decoration: underline;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding: 0 15px;
  overflow: hidden;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  .report-live-card {
    width: calc(100% - 40px);
    max-width: 350px;
    bottom: 10px;
    right: 10px;
  }
}
</style>