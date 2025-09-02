<template>
  <div class="overview-container">
    <div class="overview-header">
      <h2>今日总览</h2>
      <p class="date">{{ currentDate }}</p>
    </div>

    <div class="stats-grid">
      <!-- 今日通报统计 -->
      <div class="stat-card">
        <h3>今日通报总数</h3>
        <div class="stat-value">{{ todayReports.total }}</div>
      </div>

      <div class="stat-card">
        <h3>扣分通报</h3>
        <div class="stat-value negative">{{ todayReports.negative }}</div>
      </div>

      <div class="stat-card">
        <h3>加分通报</h3>
        <div class="stat-value positive">{{ todayReports.positive }}</div>
      </div>

      <div class="stat-card">
        <h3>活跃班级</h3>
        <div class="stat-value">{{ activeClasses }}</div>
      </div>
    </div>

    <div class="charts-section">
      <!-- 通报类型饼图 -->
      <div class="chart-card">
        <h3>通报类型分布</h3>
        <div class="pie-chart">
          <canvas ref="pieChartCanvas" width="300" height="300"></canvas>
        </div>
        <div class="chart-legend">
          <div v-for="item in reportTypes" :key="item.type" class="legend-item">
            <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
            <span class="legend-text">{{ item.type }} ({{ item.count }})</span>
          </div>
        </div>
      </div>

      <!-- 班级得分排行 -->
      <div class="chart-card">
        <h3>班级得分排行</h3>
        <div class="class-ranking">
          <div 
            v-for="(classItem, index) in classRanking" 
            :key="classItem.class"
            class="ranking-item"
            :class="{ 'top-three': index < 3 }"
          >
            <div class="rank">{{ index + 1 }}</div>
            <div class="class-info">
              <div class="class-name">{{ classItem.class }}班</div>
              <div class="teacher-name">{{ classItem.headteacher }}</div>
            </div>
            <div class="score" :class="{ 
              'positive': classItem.score > 0, 
              'negative': classItem.score < 0 
            }">
              {{ classItem.score > 0 ? '+' : '' }}{{ classItem.score }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 当前日期
const currentDate = ref('')

// 今日通报统计
const todayReports = ref({
  total: 42,
  negative: 28,
  positive: 14
})

// 活跃班级数
const activeClasses = ref(15)

// 通报类型数据
const reportTypes = ref([
  { type: '违纪扣分', count: 18, color: '#e74c3c' },
  { type: '卫生扣分', count: 10, color: '#f39c12' },
  { type: '表现加分', count: 8, color: '#27ae60' },
  { type: '活动加分', count: 6, color: '#3498db' }
])

// 班级排行数据（基于class.json生成示例数据）
const classRanking = ref([
  { class: 1, headteacher: "王振宽", score: 12 },
  { class: 15, headteacher: "谢媛", score: 8 },
  { class: 7, headteacher: "刘磊磊", score: 5 },
  { class: 21, headteacher: "王树琦", score: 3 },
  { class: 9, headteacher: "陈常锋", score: 1 },
  { class: 16, headteacher: "刘世彬", score: 0 },
  { class: 2, headteacher: "郭宝伟", score: -2 },
  { class: 18, headteacher: "顾明立", score: -3 },
  { class: 4, headteacher: "孙华义", score: -5 },
  { class: 22, headteacher: "袁义国", score: -8 },
  { class: 3, headteacher: "张春水", score: -10 },
  { class: 24, headteacher: "王思程", score: -12 }
])

const pieChartCanvas = ref<HTMLCanvasElement>()

// 初始化
onMounted(() => {
  // 设置当前日期
  const now = new Date()
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  // 绘制饼图
  drawPieChart()
})

// 绘制简单饼图
const drawPieChart = () => {
  if (!pieChartCanvas.value) return

  const canvas = pieChartCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = 100

  let currentAngle = -Math.PI / 2
  const total = reportTypes.value.reduce((sum, item) => sum + item.count, 0)

  reportTypes.value.forEach(item => {
    const sliceAngle = (item.count / total) * 2 * Math.PI

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.closePath()
    ctx.fillStyle = item.color
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()

    currentAngle += sliceAngle
  })
}
</script>

<style scoped>
.overview-container {
  padding: 1rem;
}

.overview-header {
  margin-bottom: 2rem;
  text-align: center;
}

.overview-header h2 {
  color: #333;
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.date {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card h3 {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  font-family: 'JetBrains Mono', monospace;
}

.stat-value.positive {
  color: #27ae60;
}

.stat-value.negative {
  color: #e74c3c;
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.chart-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  color: #333;
  margin: 0 0 1.5rem 0;
  text-align: center;
  font-size: 1.2rem;
}

.pie-chart {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.legend-text {
  font-size: 0.9rem;
  color: #666;
}

.class-ranking {
  max-height: 400px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.ranking-item:hover {
  background-color: #f8f9fa;
}

.ranking-item.top-three {
  background-color: #fff8dc;
}

.rank {
  font-size: 1.2rem;
  font-weight: 700;
  color: #666;
  width: 40px;
  text-align: center;
}

.class-info {
  flex: 1;
  margin-left: 1rem;
}

.class-name {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.teacher-name {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.2rem;
}

.score {
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  min-width: 60px;
  text-align: right;
}

.score.positive {
  color: #27ae60;
}

.score.negative {
  color: #e74c3c;
}

@media (max-width: 768px) {
  .charts-section {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-value {
    font-size: 2rem;
  }
}
</style>