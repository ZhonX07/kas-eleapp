<template>
  <div class="review-archive-container">
    <div class="archive-header">
      <h2>审阅过往档案</h2>
      <p>查看和管理历史通报记录</p>
    </div>

    <!-- 查询筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <label>班级：</label>
          <select v-model="filters.classId">
            <option value="all">全部班级</option>
            <option v-for="cls in classes" :key="cls.class" :value="cls.class">
              {{ cls.class }}班 ({{ cls.headteacher }})
            </option>
          </select>
        </div>

        <div class="filter-item">
          <label>开始日期：</label>
          <input type="date" v-model="filters.startDate" />
        </div>

        <div class="filter-item">
          <label>结束日期：</label>
          <input type="date" v-model="filters.endDate" />
        </div>

        <div class="filter-item">
          <label>类型：</label>
          <select v-model="filters.isadd">
            <option value="all">全部</option>
            <option value="true">表彰</option>
            <option value="false">违纪</option>
          </select>
        </div>
      </div>

      <div class="filter-row">
        <div class="filter-item">
          <label>最小分数：</label>
          <input type="number" v-model="filters.minScore" min="1" max="20" />
        </div>

        <div class="filter-item">
          <label>最大分数：</label>
          <input type="number" v-model="filters.maxScore" min="1" max="20" />
        </div>

        <div class="filter-actions">
          <button @click="searchReports" :disabled="loading" class="search-btn">
            {{ loading ? '查询中...' : '查询' }}
          </button>
          <button @click="resetFilters" class="reset-btn">重置</button>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div v-if="stats" class="stats-section">
      <div class="stat-card">
        <div class="stat-number">{{ stats.total }}</div>
        <div class="stat-label">总记录数</div>
      </div>
      <div class="stat-card praise">
        <div class="stat-number">{{ stats.praise }}</div>
        <div class="stat-label">表彰记录</div>
      </div>
      <div class="stat-card criticism">
        <div class="stat-number">{{ stats.criticism }}</div>
        <div class="stat-label">违纪记录</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.classCount }}</div>
        <div class="stat-label">涉及班级</div>
      </div>
    </div>

    <!-- 结果显示区域 -->
    <div class="results-section">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>正在查询历史记录...</p>
      </div>

      <div v-else-if="reports.length === 0 && hasSearched" class="no-results">
        <div class="icon">🔍</div>
        <h3>未找到匹配记录</h3>
        <p>请尝试调整查询条件</p>
      </div>

      <div v-else-if="reports.length > 0" class="reports-table">
        <div class="table-header">
          <h3>查询结果 ({{ reports.length }} 条记录)</h3>
          <button @click="exportReports" class="export-btn">导出数据</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>日期时间</th>
              <th>班级</th>
              <th>班主任</th>
              <th>类型</th>
              <th>分数</th>
              <th>说明</th>
              <th>提交人</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in reports" :key="report.id" 
                :class="{ 'praise-row': report.isadd, 'criticism-row': !report.isadd }">
              <td>{{ formatDateTime(report.submittime) }}</td>
              <td>{{ report.class }}班</td>
              <td>{{ report.headteacher }}</td>
              <td>
                <span :class="['type-badge', report.isadd ? 'praise' : 'criticism']">
                  {{ report.type }}
                </span>
              </td>
              <td>
                <span :class="['score', report.isadd ? 'positive' : 'negative']">
                  {{ report.scoreDisplay }}
                </span>
              </td>
              <td>{{ report.note }}</td>
              <td>{{ report.submitter }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="welcome">
        <div class="icon">📋</div>
        <h3>历史档案查询</h3>
        <p>请设置查询条件，点击"查询"按钮开始查找历史记录</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { reportsAPI } from '../../utils/api-unified.js'

interface Report {
  id: number
  class: number
  headteacher: string
  isadd: boolean
  changescore: number
  note: string
  submitter: string
  submittime: string
  type: string
  scoreDisplay: string
}

interface Stats {
  total: number
  praise: number
  criticism: number
  totalPraiseScore: number
  totalCriticismScore: number
  classCount: number
}

interface ClassInfo {
  class: number
  headteacher: string
}

const reports = ref<Report[]>([])
const stats = ref<Stats | null>(null)
const classes = ref<ClassInfo[]>([])
const loading = ref(false)
const hasSearched = ref(false)

const filters = reactive({
  classId: 'all',
  startDate: '',
  endDate: '',
  isadd: 'all',
  minScore: '',
  maxScore: ''
})

// 设置默认日期范围（最近30天）
const setDefaultDateRange = () => {
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  filters.endDate = today.toISOString().split('T')[0]
  filters.startDate = thirtyDaysAgo.toISOString().split('T')[0]
}

// 获取班级列表
const fetchClasses = async () => {
  try {
    console.log('🔄 正在获取班级列表...')
    const response = await reportsAPI.getAllClasses()
    
    if (response.success) {
      classes.value = response.data
      console.log('✅ 班级列表获取成功:', response.data)
    } else {
      throw new Error(response.message || '获取班级列表失败')
    }
  } catch (error) {
    console.error('❌ 获取班级列表失败:', error)
    
    // 使用备用数据
    classes.value = Array.from({ length: 30 }, (_, i) => ({
      class: i + 1,
      headteacher: `班主任${i + 1}`
    }))
    
    console.log('⚠️ 使用备用班级数据')
  }
}

// 查询报告
const searchReports = async () => {
  if (!filters.startDate || !filters.endDate) {
    alert('请选择查询的日期范围')
    return
  }

  loading.value = true
  hasSearched.value = true

  try {
    console.log('🔍 开始查询历史记录...', filters)
    
    // 构建查询参数
    const queryParams: any = {
      classId: filters.classId,
      startDate: filters.startDate,
      endDate: filters.endDate,
      isadd: filters.isadd,
      minScore: filters.minScore,
      maxScore: filters.maxScore
    }
    
    // 移除空值
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === '' || queryParams[key] === 'all') {
        delete queryParams[key]
      }
    })
    
    console.log('查询参数:', queryParams)
    
    const response = await reportsAPI.getHistory(queryParams)

    if (response.success) {
      reports.value = response.data.reports
      stats.value = response.data.stats
      console.log('✅ 历史记录查询成功:', response.data)
    } else {
      throw new Error(response.message || '查询失败')
    }
  } catch (error: any) {
    console.error('❌ 查询历史记录失败:', error)
    
    // 显示具体错误信息
    let errorMessage = '查询失败'
    if (error.message?.includes('Failed to fetch')) {
      errorMessage = '无法连接到服务器，请检查网络连接'
    } else if (error.message?.includes('500')) {
      errorMessage = '服务器内部错误，可能是数据库字段不匹配。请检查后端日志。'
    } else if (error.message?.includes('404')) {
      errorMessage = 'API接口不存在，请检查后端服务'
    } else {
      errorMessage = error.message || '未知错误'
    }
    
    alert(errorMessage)
    
    // 重置数据
    reports.value = []
    stats.value = null
  } finally {
    loading.value = false
  }
}

// 重置筛选条件
const resetFilters = () => {
  filters.classId = 'all'
  filters.isadd = 'all'
  filters.minScore = ''
  filters.maxScore = ''
  setDefaultDateRange()
  reports.value = []
  stats.value = null
  hasSearched.value = false
}

// 格式化日期时间
const formatDateTime = (datetime: string) => {
  return new Date(datetime).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 导出数据
const exportReports = () => {
  if (reports.value.length === 0) {
    alert('没有数据可导出')
    return
  }

  const csvContent = [
    // CSV 头部
    ['日期时间', '班级', '班主任', '类型', '分数', '说明', '提交人'].join(','),
    // 数据行
    ...reports.value.map(report => [
      formatDateTime(report.submittime),
      `${report.class}班`,
      report.headteacher,
      report.type,
      report.scoreDisplay,
      `"${report.note}"`, // 用引号包围以处理可能的逗号
      report.submitter
    ].join(','))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `历史通报记录_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

onMounted(() => {
  setDefaultDateRange()
  fetchClasses()
})
</script>

<style scoped>
.review-archive-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.archive-header {
  text-align: center;
  margin-bottom: 30px;
}

.archive-header h2 {
  font-size: 28px;
  color: #333;
}

.archive-header p {
  font-size: 16px;
  color: #666;
}

.filter-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.filter-item {
  flex: 1;
  min-width: 150px;
  margin-right: 15px;
}

.filter-item label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.filter-item select,
.filter-item input {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.filter-actions {
  display: flex;
  align-items: center;
}

.search-btn,
.reset-btn {
  padding: 10px 20px;
  font-size: 14px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn:disabled {
  background-color: #007bff80;
  cursor: not-allowed;
}

.reset-btn {
  margin-left: 10px;
  background-color: #6c757d;
}

.reset-btn:hover,
.search-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.stats-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.stat-card {
  flex: 1;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-right: 15px;
  text-align: center;
}

.stat-card:last-child {
  margin-right: 0;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.reports-table {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #007bff;
  color: #fff;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
}

.export-btn {
  padding: 8px 16px;
  font-size: 14px;
  color: #007bff;
  background-color: transparent;
  border: 2px solid #007bff;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.export-btn:hover {
  background-color: #007bff;
  color: #fff;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

tr:hover {
  background-color: #f9f9f9;
}

.type-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
}

.type-badge.praise {
  background-color: #28a745;
}

.type-badge.criticism {
  background-color: #dc3545;
}

.score {
  font-weight: bold;
}

.score.positive {
  color: #28a745;
}

.score.negative {
  color: #dc3545;
}

.welcome {
  text-align: center;
  padding: 50px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome .icon {
  font-size: 48px;
  color: #007bff;
  margin-bottom: 20px;
}
</style>