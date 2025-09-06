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
import * as ExcelJS from 'exceljs'

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

// 生成Excel文件
async function generateExcel() {
  if (!hasData.value) {
    showMessage('没有数据可导出', 'error')
    return
  }

  try {
    generating.value = true
    showMessage('正在生成Excel文件...', 'info')

    // 创建工作簿
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('今日通报')

    // 获取当前日期
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()

    // 设置标题行
    const titleRow = worksheet.getRow(1)
    titleRow.getCell(1).value = `垦利校区高三学部${year}年${month}月${day}日违纪表彰通报`
    worksheet.mergeCells('A1:K1')
    titleRow.height = 25
    titleRow.getCell(1).font = { size: 16, bold: true }
    titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }

    // 设置表头
    const headerRow = worksheet.getRow(2)
    headerRow.values = ['班级', '班主任', '通报类型', '违纪类型', '原因', '', '', '', '分数变动', '通报提交人', '时间']
    worksheet.mergeCells('E2:H2')
    headerRow.getCell(5).value = '原因'
    headerRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' }

    // 设置表头样式 - 只对前11列（A-K）应用样式
    const headerFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9D9D9' }
    }
    const headerFont = { bold: true }
    const headerAlignment = { horizontal: 'center', vertical: 'middle' }
    
    // 只对前11列（A-K）应用表头样式
    for (let colIndex = 1; colIndex <= 11; colIndex++) {
      const cell = headerRow.getCell(colIndex)
      cell.fill = headerFill
      cell.font = headerFont
      cell.alignment = headerAlignment
    }
    
    headerRow.height = 20

    // 设置列宽
    worksheet.columns = [
      { width: 8 },   // 班级
      { width: 10 },  // 班主任
      { width: 10 },  // 通报类型
      { width: 10 },  // 违纪类型
      { width: 15 },  // 原因 (部分)
      { width: 15 },  // 原因 (部分)
      { width: 15 },  // 原因 (部分)
      { width: 15 },  // 原因 (部分)
      { width: 10 },  // 分数变动
      { width: 12 },  // 通报提交人
      { width: 20 }   // 时间
    ]

    // 添加数据行
    let rowIndex = 3

    classReports.value.forEach(classReport => {
      // 先添加违纪记录
      classReport.violations.forEach(report => {
        const row = worksheet.getRow(rowIndex)
        
        row.getCell(1).value = report.class
        row.getCell(2).value = report.headteacher
        row.getCell(3).value = '违纪'
        row.getCell(4).value = report.reduceTypeText || '违纪'
        
        // 合并原因单元格
        worksheet.mergeCells(`E${rowIndex}:H${rowIndex}`)
        row.getCell(5).value = report.note
        row.getCell(5).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
        
        row.getCell(9).value = report.scoreDisplay
        row.getCell(10).value = report.submitter
        row.getCell(11).value = report.timeDisplay
        
        // 违纪样式 - 橙色背景，白色加粗字体 (只应用到A-K列)
        const violationFill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF5608' }
        }
        const violationFont = { bold: true, color: { argb: 'FFFFFFFF' } }
        
        // 只对前11列（A-K）应用样式
        for (let colIndex = 1; colIndex <= 11; colIndex++) {
          const cell = row.getCell(colIndex)
          cell.fill = violationFill
          cell.font = violationFont
        }
        
        row.height = 20
        row.alignment = { vertical: 'middle' }
        
        rowIndex++
      })

      // 再添加表彰记录
      classReport.praises.forEach(report => {
        const row = worksheet.getRow(rowIndex)
        
        row.getCell(1).value = report.class
        row.getCell(2).value = report.headteacher
        row.getCell(3).value = '表彰'
        row.getCell(4).value = ''
        
        // 合并原因单元格
        worksheet.mergeCells(`E${rowIndex}:H${rowIndex}`)
        row.getCell(5).value = report.note
        row.getCell(5).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
        
        row.getCell(9).value = report.scoreDisplay
        row.getCell(10).value = report.submitter
        row.getCell(11).value = report.timeDisplay
        
        // 表彰样式 - 绿色背景，黑色加粗字体 (只应用到A-K列)
        const praiseFill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF99E02E' }
        }
        const praiseFont = { bold: true, color: { argb: 'FF000000' } }
        
        // 只对前11列（A-K）应用样式
        for (let colIndex = 1; colIndex <= 11; colIndex++) {
          const cell = row.getCell(colIndex)
          cell.fill = praiseFill
          cell.font = praiseFont
        }
        
        row.height = 20
        row.alignment = { vertical: 'middle' }
        
        rowIndex++
      })
    })

    // 添加边框 (只给前11列添加边框)
    for (let i = 1; i <= 11; i++) {
      for (let j = 2; j < rowIndex; j++) {
        worksheet.getCell(j, i).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      }
    }

    // 生成Excel文件
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `垦利校区高三学部${year}年${month}月${day}日违纪表彰通报.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    showMessage(`Excel文件生成成功！共${reports.value.length}条记录`, 'success')

  } catch (error) {
    console.error('❌ 生成Excel文件失败:', error)
    showMessage(`生成失败: ${error.message}`, 'error')
  } finally {
    generating.value = false
  }
}

// 页面加载时初始化
onMounted(() => {
  console.log('📊 Excel生成组件已挂载')
  updateTime()
  setInterval(updateTime, 1000)
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
