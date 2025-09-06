<template>
  <div class="overview-container">
    <div class="header-section">
      <h1>📊 今日概览</h1>
      <button @click="refreshData" :disabled="loading" class="refresh-btn">
        {{ loading ? '刷新中...' : '🔄 刷新数据' }}
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      ⚠️ {{ error }}
    </div>

    <div v-if="loading" class="loading-message">
      📊 正在加载今日数据...
    </div>

    <div v-else class="content-grid">
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>总通报数</h3>
            <div class="stat-number">{{ todayReports.total }}</div>
          </div>
        </div>

        <div class="stat-card positive">
          <div class="stat-icon">👍</div>
          <div class="stat-content">
            <h3>表扬通报</h3>
            <div class="stat-number">{{ todayReports.positive }}</div>
          </div>
        </div>

        <div class="stat-card negative">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <h3>违纪通报</h3>
            <div class="stat-number">{{ todayReports.negative }}</div>
          </div>
        </div>

        <div class="stat-card classes">
          <div class="stat-icon">🏫</div>
          <div class="stat-content">
            <h3>活跃班级</h3>
            <div class="stat-number">{{ activeClasses }}</div>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 左侧：通报类型分布 -->
        <div class="chart-section">
          <div class="section-header">
            <h2>📈 通报类型分布</h2>
          </div>
          <div class="chart-container">
            <canvas id="pieChart" width="300" height="300"></canvas>
          </div>
          <div class="chart-legend">
            <div
              v-for="type in reportTypes"
              :key="type.type"
              class="legend-item"
            >
              <span
                class="legend-color"
                :style="{ backgroundColor: type.color }"
              ></span>
              <span class="legend-text">{{ type.type }} ({{ type.count }})</span>
            </div>
          </div>
        </div>

        <!-- 右侧：班级排行榜 -->
        <div class="ranking-section">
          <div class="section-header">
            <h2>🏆 班级排行榜</h2>
            <span class="ranking-subtitle">今日得分排行</span>
          </div>
          <div class="ranking-list">
            <div
              v-for="item in classRanking"
              :key="item.class"
              class="ranking-item"
              :class="{ top: item.rank <= 3 }"
            >
              <div class="rank-number">{{ item.rank }}</div>
              <div class="class-info">
                <div class="class-name">{{ item.class }}</div>
                <div class="class-teacher">{{ item.headteacher }}</div>
              </div>
              <div class="score-info">
                <div class="score" :class="item.trend">{{ item.score }}</div>
                <div class="trend-icon">
                  <span v-if="item.trend === 'up'">📈</span>
                  <span v-else-if="item.trend === 'down'">📉</span>
                  <span v-else>➖</span>
                </div>
              </div>
            </div>
            
            <!-- 空状态 -->
            <div v-if="classRanking.length === 0" class="empty-state">
              <p>今日暂无班级数据</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 最新通报 -->
      <div class="recent-reports" v-if="recentReports.length > 0">
        <div class="section-header">
          <h2>📝 最新通报</h2>
        </div>
        <div class="reports-list">
          <div
            v-for="report in recentReports"
            :key="report.id"
            class="report-item"
          >
            <div class="report-badge" :class="report.type === '加分' ? 'positive' : 'negative'">
              {{ report.type }}
            </div>
            <div class="report-content">
              <div class="report-info">
                <span class="report-class">{{ report.class }}班</span>
                <span class="report-score">{{ report.score }}分</span>
              </div>
              <div class="report-note">{{ report.note }}</div>
              <div class="report-meta">
                <span class="report-submitter">{{ report.submitter }}</span>
                <span class="report-time">{{ formatTime(report.time) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { reportsAPI, utils } from '../utils/api.js'

// 响应式数据
const currentDate = ref('')
const loading = ref(true)
const error = ref('')

// 统计数据
const todayReports = ref({
  total: 0,
  negative: 0,
  positive: 0
})
const activeClasses = ref(0)
const reportTypes = ref([])
const classRanking = ref([])
const recentReports = ref([])

// 预定义颜色方案
const typeColors = {
  '重大表扬': '#27ae60',
  '表扬': '#2ecc71',
  '小表扬': '#58d68d',
  '重大违纪': '#e74c3c',
  '违纪': '#ec7063',
  '小违纪': '#f1948a'
}

// 刷新间隔定时器
let refreshInterval = null

// 获取今日数据
async function fetchTodayData() {
  try {
    loading.value = true
    error.value = ''
    
    console.log('🔄 正在获取今日数据...')
    
    const response = await reportsAPI.getTodayStats()
    
    if (response.success) {
      todayData.value = response.data
      console.log('✅ 今日数据获取成功:', response.data)
    } else {
      throw new Error(response.message || '获取数据失败')
    }
    
  } catch (err) {
    console.error('❌ 获取今日数据失败:', err)
    
    // 根据错误类型提供更具体的错误信息
    if (err.message.includes('Failed to fetch')) {
      error.value = '无法连接到后端服务器，请检查网络连接和服务器状态'
    } else if (err.message.includes('CORS')) {
      error.value = 'CORS跨域错误，请检查后端服务器配置'
    } else {
      error.value = `获取数据失败: ${err.message}`
    }
    
    // 使用备用数据
    todayData.value = {
      summary: { total: 0, positive: 0, negative: 0, activeClasses: 0 },
      typeStats: {},
      classRanking: [],
      recentReports: []
    }
  } finally {
    loading.value = false
  }
}

// 绘制饼图
function drawPieChart() {
  const canvas = document.getElementById('pieChart')
  if (!canvas || reportTypes.value.length === 0) return
  
  const ctx = canvas.getContext('2d')
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = Math.min(centerX, centerY) - 10
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 计算总数
  const total = reportTypes.value.reduce((sum, item) => sum + item.count, 0)
  if (total === 0) {
    // 绘制空状态
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fillStyle = '#ecf0f1'
    ctx.fill()
    ctx.strokeStyle = '#bdc3c7'
    ctx.stroke()
    
    ctx.fillStyle = '#7f8c8d'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('暂无数据', centerX, centerY)
    return
  }
  
  let currentAngle = 0
  
  // 绘制扇形
  reportTypes.value.forEach(item => {
    const sliceAngle = (item.count / total) * 2 * Math.PI
    
    // 绘制扇形
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.closePath()
    ctx.fillStyle = item.color
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // 绘制标签
    const labelAngle = currentAngle + sliceAngle / 2
    const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7)
    const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(item.count.toString(), labelX, labelY)
    
    currentAngle += sliceAngle
  })
}

// 格式化时间
function formatTime(timeString) {
  const date = new Date(timeString)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 组件挂载时初始化
onMounted(async () => {
  currentDate.value = utils.getChineseDateString()
  await fetchTodayData()
  
  // 设置自动刷新 - 每30秒刷新一次数据
  refreshInterval = setInterval(() => {
    fetchTodayData()
  }, 30000) // 30秒
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

// 手动刷新数据的方法
const refreshData = () => {
  fetchTodayData()
}
</script>

<style scoped>
.overview-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-container {
  text-align: center;
  padding: 40px;
}

.error-message {
  color: #e74c3c;
  font-size: 16px;
  margin-bottom: 20px;
  background: #fef0f0;
  color: #f56c6c;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #fbc4c4;
}

.retry-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.retry-button:hover {
  background: #2980b9;
}

/* 头部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin: 0;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.current-date {
  color: #7f8c8d;
  font-size: 16px;
}

.refresh-button {
  background: none;
  border: 1px solid #bdc3c7;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 16px;
}

.refresh-button:hover {
  background: #ecf0f1;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card.total { border-left: 4px solid #3498db; }
.stat-card.positive { border-left: 4px solid #27ae60; }
.stat-card.negative { border-left: 4px solid #e74c3c; }
.stat-card.classes { border-left: 4px solid #f39c12; }

.stat-icon {
  font-size: 2em;
  margin-right: 15px;
}

.stat-content h3 {
  margin: 0 0 5px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.stat-number {
  font-size: 2em;
  font-weight: bold;
  color: #2c3e50;
}

/* 主要内容区域 */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

/* 图表区域 */
.chart-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.chart-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-text {
  font-size: 14px;
  color: #2c3e50;
}

/* 排行榜区域 */
.ranking-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.ranking-subtitle {
  color: #7f8c8d;
  font-size: 14px;
}

.ranking-list {
  max-height: 400px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #ecf0f1;
  transition: background 0.2s;
}

.ranking-item:hover {
  background: #f8f9fa;
}

.ranking-item.top {
  background: linear-gradient(90deg, #fff8e1, #ffffff);
}

.rank-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ecf0f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #2c3e50;
  margin-right: 15px;
}

.ranking-item.top .rank-number {
  background: linear-gradient(45deg, #f39c12, #e67e22);
  color: white;
}

.class-info {
  flex: 1;
}

.class-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.class-teacher {
  color: #7f8c8d;
  font-size: 14px;
}

.score-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.score {
  font-size: 18px;
  font-weight: bold;
}

.score.up { color: #27ae60; }
.score.down { color: #e74c3c; }
.score.stable { color: #7f8c8d; }

.trend-icon {
  font-size: 14px;
}

/* 最新通报 */
.recent-reports {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.report-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.report-item:hover {
  border-color: #bdc3c7;
}

.report-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  white-space: nowrap;
}

.report-badge.positive {
  background: #27ae60;
}

.report-badge.negative {
  background: #e74c3c;
}

.report-content {
  flex: 1;
}

.report-info {
  display: flex;
  gap: 15px;
  margin-bottom: 8px;
}

.report-class {
  font-weight: bold;
  color: #2c3e50;
}

.report-score {
  color: #7f8c8d;
}

.report-note {
  color: #2c3e50;
  margin-bottom: 8px;
  line-height: 1.4;
}

.report-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #7f8c8d;
}

.empty-state {
  text-align: center;
  color: #7f8c8d;
  padding: 40px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}
</style>