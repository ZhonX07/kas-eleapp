<template>
  <div class="overview">
    <div class="page-header">
      <h1>今日概览</h1>
      <p>{{ formatDate(new Date()) }}</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载今日数据...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="fetchTodayData" class="retry-btn">重试</button>
    </div>

    <!-- 数据展示 -->
    <div v-else class="overview-content">
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>今日通报总数</h3>
            <p class="stat-number">{{ todayData.summary.total }}</p>
          </div>
        </div>

        <div class="stat-card positive">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <h3>表彰通报</h3>
            <p class="stat-number">{{ todayData.summary.positive }}</p>
          </div>
        </div>

        <div class="stat-card negative">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <h3>违纪通报</h3>
            <p class="stat-number">{{ todayData.summary.negative }}</p>
          </div>
        </div>

        <div class="stat-card active">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <h3>活跃班级</h3>
            <p class="stat-number">{{ todayData.summary.activeClasses }}</p>
          </div>
        </div>
      </div>

      <!-- 通报类型统计 -->
      <div class="section-grid">
        <div class="chart-section">
          <h2>通报类型分布</h2>
          <div v-if="Object.keys(todayData.typeStats).length > 0" class="type-stats">
            <div 
              v-for="(count, type) in todayData.typeStats" 
              :key="type"
              class="type-item"
              :class="getTypeClass(type)"
            >
              <span class="type-name">{{ type }}</span>
              <span class="type-count">{{ count }}</span>
            </div>
          </div>
          <div v-else class="no-data">
            <p>暂无通报类型数据</p>
          </div>
        </div>

        <!-- 班级排行榜 -->
        <div class="ranking-section">
          <h2>班级排行榜</h2>
          <div v-if="todayData.classRanking.length > 0" class="class-ranking">
            <div 
              v-for="(classItem, index) in todayData.classRanking.slice(0, 10)" 
              :key="classItem.class"
              class="ranking-item"
              :class="{ 'top-three': index < 3 }"
            >
              <div class="rank">
                <span class="rank-number">{{ index + 1 }}</span>
                <span v-if="index === 0" class="rank-medal">🥇</span>
                <span v-else-if="index === 1" class="rank-medal">🥈</span>
                <span v-else-if="index === 2" class="rank-medal">🥉</span>
              </div>
              <div class="class-info">
                <span class="class-name">{{ classItem.class }}班</span>
                <span class="headteacher">{{ classItem.headteacher }}</span>
              </div>
              <div class="score-info">
                <span class="total-score" :class="{ 'positive': classItem.totalScore > 0, 'negative': classItem.totalScore < 0 }">
                  {{ classItem.totalScore > 0 ? '+' : '' }}{{ classItem.totalScore }}
                </span>
                <span class="report-count">{{ classItem.reportCount }}次</span>
              </div>
            </div>
          </div>
          <div v-else class="no-data">
            <p>暂无班级排行数据</p>
          </div>
        </div>
      </div>

      <!-- 最新通报 -->
      <div class="recent-section">
        <h2>最新通报</h2>
        <div v-if="todayData.recentReports.length > 0" class="recent-reports">
          <div 
            v-for="report in todayData.recentReports" 
            :key="report.id"
            class="report-item"
            :class="report.type === '加分' ? 'praise' : 'criticism'"
          >
            <div class="report-header">
              <span class="class-name">{{ report.class }}班</span>
              <span class="report-type">{{ report.type }}</span>
              <span class="score">{{ report.type === '加分' ? '+' : '-' }}{{ report.score }}</span>
            </div>
            <div class="report-content">{{ report.note }}</div>
            <div class="report-meta">
              <span class="submitter">{{ report.submitter }}</span>
              <span class="time">{{ formatTime(report.time) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="no-data">
          <p>今日暂无通报</p>
        </div>
      </div>
    </div>

    <!-- 刷新按钮 -->
    <div class="refresh-section">
      <button @click="fetchTodayData" class="refresh-btn" :disabled="loading">
        <span class="refresh-icon" :class="{ rotating: loading }">🔄</span>
        {{ loading ? '刷新中...' : '刷新数据' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { reportsAPI } from '../../utils/api-unified.js'

// 数据状态
const loading = ref(false)
const error = ref('')
const todayData = ref({
  summary: { total: 0, positive: 0, negative: 0, activeClasses: 0 },
  typeStats: {},
  classRanking: [],
  recentReports: []
})

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
    error.value = `获取数据失败: ${err.message}`
    
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

// 工具函数
function formatDate(date) {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

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

function getTypeClass(type) {
  if (type.includes('表扬') || type.includes('表彰')) {
    return 'praise'
  } else if (type.includes('违纪')) {
    return 'criticism'
  }
  return 'neutral'
}

// 页面加载时获取数据
onMounted(() => {
  fetchTodayData()
})
</script>

<style scoped>
.overview {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0;
  color: #333;
  font-size: 2rem;
}

.page-header p {
  margin: 8px 0 0;
  color: #666;
  font-size: 1.1rem;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: rotate 1s linear infinite;
  margin-bottom: 20px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.retry-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 16px;
}

.retry-btn:hover {
  background: #2563eb;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
}

.stat-card.total .stat-icon {
  background: #f0f9ff;
}

.stat-card.positive .stat-icon {
  background: #f0fdf4;
}

.stat-card.negative .stat-icon {
  background: #fef2f2;
}

.stat-card.active .stat-icon {
  background: #fefce8;
}

.stat-content h3 {
  margin: 0 0 8px;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-number {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: #111827;
}

.section-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.chart-section,
.ranking-section,
.recent-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chart-section h2,
.ranking-section h2,
.recent-section h2 {
  margin: 0 0 20px;
  color: #333;
  font-size: 1.3rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
}

.type-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.type-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  border-left: 4px solid #e5e7eb;
}

.type-item.praise {
  background: #f0fdf4;
  border-left-color: #22c55e;
}

.type-item.criticism {
  background: #fef2f2;
  border-left-color: #ef4444;
}

.type-item.neutral {
  background: #f8fafc;
  border-left-color: #64748b;
}

.type-count {
  font-weight: bold;
  color: #374151;
}

.class-ranking {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.ranking-item.top-three {
  background: linear-gradient(135deg, #fef7cd 0%, #fef3c7 100%);
  border-color: #f59e0b;
}

.rank {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 60px;
}

.rank-number {
  font-weight: bold;
  font-size: 1.1rem;
  color: #374151;
}

.class-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.class-name {
  font-weight: 600;
  color: #111827;
}

.headteacher {
  font-size: 0.9rem;
  color: #6b7280;
}

.score-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.total-score {
  font-weight: bold;
  font-size: 1.1rem;
}

.total-score.positive {
  color: #059669;
}

.total-score.negative {
  color: #dc2626;
}

.report-count {
  font-size: 0.8rem;
  color: #6b7280;
}

.recent-reports {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.report-item {
  padding: 16px;
  border-radius: 6px;
  border-left: 4px solid #e5e7eb;
  background: #f8fafc;
}

.report-item.praise {
  border-left-color: #22c55e;
  background: #f0fdf4;
}

.report-item.criticism {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.report-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.report-type {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.report-item.praise .report-type {
  background: #dcfce7;
  color: #166534;
}

.report-item.criticism .report-type {
  background: #fee2e2;
  color: #991b1b;
}

.score {
  font-weight: bold;
  margin-left: auto;
}

.report-content {
  color: #374151;
  line-height: 1.5;
  margin-bottom: 8px;
}

.report-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #6b7280;
}

.no-data {
  text-align: center;
  color: #6b7280;
  padding: 40px 20px;
}

.refresh-section {
  text-align: center;
  margin-top: 30px;
}

.refresh-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
}

.refresh-btn:hover:not(:disabled) {
  background: #2563eb;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  display: inline-block;
}

.refresh-icon.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .overview {
    padding: 10px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .section-grid {
    grid-template-columns: 1fr;
  }
  
  .ranking-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .score-info {
    align-items: flex-start;
    flex-direction: row;
    gap: 12px;
  }
}
</style>