<template>
  <div class="excel-generator">
    <div class="page-header">
      <h1>📊 Excel报告生成</h1>
      <p>导出今日违纪表彰通报Excel文件</p>
    </div>

    <!-- 消息提示 -->
    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>

    <!-- 操作区域 -->
    <div class="action-section">
      <div class="preview-info">
        <h3>📅 {{ formattedDate }}</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="label">总通报数</span>
            <span class="value">{{ summary.totalReports || 0 }}</span>
          </div>
          <div class="stat-item violations">
            <span class="label">违纪通报</span>
            <span class="value">{{ summary.totalViolations || 0 }}</span>
          </div>
          <div class="stat-item praises">
            <span class="label">表彰通报</span>
            <span class="value">{{ summary.totalPraises || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="label">活跃班级</span>
            <span class="value">{{ summary.activeClasses || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="button-group">
        <button 
          @click="loadPreviewData" 
          :disabled="loading"
          class="btn btn-secondary"
        >
          {{ loading ? '加载中...' : '🔄 刷新数据' }}
        </button>
        <button 
          @click="generateExcel" 
          :disabled="generating || !hasData"
          class="btn btn-primary"
        >
          {{ generating ? '生成中...' : '📥 生成Excel' }}
        </button>
        <button 
          @click="testFunction" 
          class="btn btn-secondary"
        >
          🔧 测试组件
        </button>
      </div>
    </div>

    <!-- 数据预览 -->
    <div v-if="hasData" class="preview-section">
      <h3>📋 数据预览</h3>
      <div class="class-reports">
        <div 
          v-for="classReport in classReports" 
          :key="classReport.class"
          class="class-group"
        >
          <div class="class-header">
            <h4>{{ classReport.class }}班 - {{ classReport.headteacher }}</h4>
            <span class="class-stats">
              违纪: {{ classReport.violations.length }}, 
              表彰: {{ classReport.praises.length }}
            </span>
          </div>
          
          <!-- 违纪记录 -->
          <div v-if="classReport.violations.length > 0" class="report-group violations">
            <h5>⚠️ 违纪记录</h5>
            <div 
              v-for="report in classReport.violations" 
              :key="report.id"
              class="report-item violation"
            >
              <span class="type">{{ report.reduceTypeText }}</span>
              <span class="note">{{ report.note }}</span>
              <span class="score">{{ report.scoreDisplay }}</span>
              <span class="submitter">{{ report.submitter }}</span>
              <span class="time">{{ report.timeDisplay }}</span>
            </div>
          </div>

          <!-- 表彰记录 -->
          <div v-if="classReport.praises.length > 0" class="report-group praises">
            <h5>🏆 表彰记录</h5>
            <div 
              v-for="report in classReport.praises" 
              :key="report.id"
              class="report-item praise"
            >
              <span class="type">表彰</span>
              <span class="note">{{ report.note }}</span>
              <span class="score">{{ report.scoreDisplay }}</span>
              <span class="submitter">{{ report.submitter }}</span>
              <span class="time">{{ report.timeDisplay }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="empty-state">
      <div class="icon">📄</div>
      <h3>暂无数据</h3>
      <p>今日还没有违纪表彰通报记录</p>
      <button @click="loadPreviewData" class="btn btn-secondary">
        重新加载
      </button>
    </div>

    <!-- 开发状态显示 -->
    <div class="dev-info">
      <p>🕒 当前时间: {{ currentTime }}</p>
      <p>🔧 组件状态: {{ componentStatus }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { reportsAPI } from '../../utils/api.js'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const generating = ref(false)
const message = ref('')
const messageType = ref('')
const summary = ref({})
const classReports = ref([])
const reports = ref([])
const metadata = ref({})
const currentTime = ref('')
const componentStatus = ref('已加载')

// 计算属性
const hasData = computed(() => reports.value.length > 0)
const formattedDate = computed(() => {
  const today = new Date()
  return today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 测试功能
function testFunction() {
  console.log('📊 Excel生成组件测试按钮被点击')
  alert('Excel生成组件工作正常！当前有 ' + reports.value.length + ' 条记录')
}

// 更新时间
function updateTime() {
  currentTime.value = new Date().toLocaleString('zh-CN')
}

// 显示消息
function showMessage(text, type = 'info') {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// 加载预览数据
async function loadPreviewData() {
  try {
    loading.value = true
    message.value = ''
    componentStatus.value = '加载数据中...'

    console.log('🔄 正在加载Excel报告数据...')

    const response = await reportsAPI.getTodayExcelData()

    if (response.success) {
      summary.value = response.data.summary
      classReports.value = response.data.classReports
      reports.value = response.data.reports
      metadata.value = response.data.metadata

      console.log('✅ Excel报告数据加载成功:', response.data)
      
      if (reports.value.length === 0) {
        showMessage('今日暂无通报记录', 'info')
        componentStatus.value = '暂无数据'
      } else {
        showMessage(`数据加载成功，共 ${reports.value.length} 条记录`, 'success')
        componentStatus.value = `已加载 ${reports.value.length} 条记录`
      }
    } else {
      throw new Error(response.message || '加载数据失败')
    }

  } catch (error) {
    console.error('❌ 加载Excel报告数据失败:', error)
    showMessage(`加载失败: ${error.message}`, 'error')
    componentStatus.value = '加载失败'
  } finally {
    loading.value = false
  }
}

// 生成Excel文件（暂时使用简单的CSV格式）
async function generateExcel() {
  if (!hasData.value) {
    showMessage('没有数据可导出', 'error')
    return
  }

  try {
    generating.value = true
    showMessage('正在生成文件...', 'info')

    // 构建CSV内容
    const headers = ['班级', '班主任', '通报类型', '违纪类型', '原因', '分数变动', '通报提交人', '时间']
    let csvContent = headers.join(',') + '\n'

    // 添加数据行
    classReports.value.forEach(classReport => {
      // 违纪记录
      classReport.violations.forEach(report => {
        const row = [
          report.class,
          report.headteacher,
          report.typeText,
          report.reduceTypeText,
          `"${report.note}"`, // 用引号包围以处理逗号
          report.scoreDisplay,
          report.submitter,
          report.timeDisplay
        ]
        csvContent += row.join(',') + '\n'
      })

      // 表彰记录
      classReport.praises.forEach(report => {
        const row = [
          report.class,
          report.headteacher,
          report.typeText,
          '', // 表彰没有违纪类型
          `"${report.note}"`,
          report.scoreDisplay,
          report.submitter,
          report.timeDisplay
        ]
        csvContent += row.join(',') + '\n'
      })
    })

    // 生成文件名
    const today = new Date()
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
    const fileName = `违纪表彰通报_${dateStr}.csv`

    // 创建和下载文件
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    showMessage(`文件生成成功: ${fileName}`, 'success')

  } catch (error) {
    console.error('❌ 生成文件失败:', error)
    showMessage(`生成失败: ${error.message}`, 'error')
  } finally {
    generating.value = false
  }
}

// 页面加载时初始化
onMounted(() => {
  console.log('📊 Excel生成组件已挂载')
  console.log('📍 当前路由信息:', {
    path: route.path,
    name: route.name,
    params: route.params,
    query: route.query
  })
  
  updateTime()
  
  // 每秒更新时间
  setInterval(updateTime, 1000)
  
  // 加载数据
  loadPreviewData()
})
</script>

<style scoped>
.excel-generator {
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
}

.message {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-weight: 500;
}

.message.success {
  background: #f0f9ff;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.message.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.message.info {
  background: #f0f9ff;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.action-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.preview-info h3 {
  margin: 0 0 16px;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.stat-item.violations {
  background: #fef2f2;
  border-color: #fecaca;
}

.stat-item.praises {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.stat-item .label {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 4px;
}

.stat-item .value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
}

.button-group {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.preview-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.preview-section h3 {
  margin: 0 0 20px;
  color: #333;
}

.class-reports {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.class-group {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.class-header h4 {
  margin: 0;
  color: #1e293b;
}

.class-stats {
  font-size: 0.9rem;
  color: #64748b;
}

.report-group {
  padding: 16px;
}

.report-group h5 {
  margin: 0 0 12px;
  color: #374151;
  font-size: 0.9rem;
}

.report-group.violations {
  background: #fef2f2;
}

.report-group.praises {
  background: #f0fdf4;
}

.report-item {
  display: grid;
  grid-template-columns: 80px 1fr 80px 100px 60px;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.report-item.violation {
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
}

.report-item.praise {
  background: rgba(34, 197, 94, 0.1);
  border-left: 3px solid #22c55e;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.empty-state .icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px;
  color: #374151;
}

.empty-state p {
  margin: 0 0 20px;
  color: #6b7280;
}

.dev-info {
  margin-top: 20px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #64748b;
}

.dev-info p {
  margin: 4px 0;
}

@media (max-width: 768px) {
  .excel-generator {
    padding: 10px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .report-item {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
