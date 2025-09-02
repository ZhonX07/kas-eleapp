<template>
  <div class="submit-report-container">
    <div class="submit-header">
      <h2>提交通报</h2>
      <p>请填写通报信息，所有字段均为必填</p>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit" class="report-form">
        <div class="form-row">
          <!-- 班级选择 -->
          <div class="form-group">
            <label for="class">班级</label>
            <select 
              id="class" 
              v-model="formData.class" 
              required
              :disabled="submitting"
            >
              <option value="">请选择班级</option>
              <option 
                v-for="classItem in classList" 
                :key="classItem.class" 
                :value="classItem.class"
              >
                {{ classItem.class }}班 - {{ classItem.headteacher }}
              </option>
            </select>
          </div>

          <!-- 通报类型 -->
          <div class="form-group">
            <label for="reportType">通报类型</label>
            <input 
              id="reportType" 
              v-model="formData.reportType" 
              type="text"
              placeholder="请输入通报类型，如：违纪扣分、表现加分等"
              required
              :disabled="submitting"
            />
            <small class="field-hint">
              请简要描述通报类型
            </small>
          </div>
        </div>

        <div class="form-row">
          <!-- 通报性质 -->
          <div class="form-group">
            <label for="reportNature">通报性质</label>
            <select
              id="reportNature"
              v-model="formData.reportNature"
              required
              :disabled="submitting"
            >
              <option value="">请选择通报性质</option>
              <option value="praise">表彰</option>
              <option value="criticism">批评</option>
            </select>
            <small class="field-hint">
              表彰一般用于加分，批评一般用于扣分
            </small>
          </div>
          
          <!-- 分数变动 -->
          <div class="form-group">
            <label for="scoreChange">分数变动</label>
            <input 
              id="scoreChange" 
              v-model.number="formData.scoreChange" 
              type="number" 
              :min="formData.reportNature === 'praise' ? '0' : '-20'"
              :max="formData.reportNature === 'praise' ? '20' : '0'"
              step="1"
              :placeholder="formData.reportNature === 'praise' ? '输入加分分数(0-20)' : '输入扣分分数(-20-0)'"
              required
              :disabled="submitting"
            />
            <small class="field-hint">
              {{ formData.reportNature === 'praise' ? '正数表示加分' : '负数表示扣分' }}
            </small>
          </div>
        </div>

        <!-- 备注 -->
        <div class="form-group full-width">
          <label for="remark">备注</label>
          <textarea 
            id="remark" 
            v-model="formData.remark" 
            rows="4"
            placeholder="请详细描述通报事由..."
            required
            :disabled="submitting"
          ></textarea>
          <small class="field-hint">
            {{ formData.remark.length }}/500 字符
          </small>
        </div>

        <!-- 表单预览 -->
        <div v-if="showPreview" class="form-preview">
          <h4>通报预览</h4>
          <div class="preview-content">
            <div class="preview-item">
              <strong>班级：</strong>{{ getClassDisplay() }}
            </div>
            <div class="preview-item">
              <strong>通报类型：</strong>{{ formData.reportType }}
            </div>
            <div class="preview-item">
              <strong>通报性质：</strong>{{ formData.reportNature === 'praise' ? '表彰' : '批评' }}
            </div>
            <div class="preview-item" :class="{ 
              'score-positive': formData.scoreChange > 0,
              'score-negative': formData.scoreChange < 0 
            }">
              <strong>分数变动：</strong>
              {{ formData.scoreChange > 0 ? '+' : '' }}{{ formData.scoreChange }}
            </div>
            <div class="preview-item">
              <strong>备注：</strong>{{ formData.remark }}
            </div>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <button 
            type="button" 
            @click="togglePreview" 
            class="preview-btn"
            :disabled="!isFormValid || submitting"
          >
            {{ showPreview ? '隐藏预览' : '预览通报' }}
          </button>
          
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="!isFormValid || submitting"
          >
            {{ submitting ? '提交中...' : '提交通报' }}
          </button>
        </div>

        <!-- 成功/错误消息 -->
        <div v-if="message" class="message" :class="messageType">
          {{ message }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getUserInfo } from '@/utils/auth' // 假设有这个函数来获取用户信息
import { SUBMIT_REPORT_API, API_CONFIG } from '@/config/api'

// 表单数据
const formData = ref({
  class: '',
  reportType: '',
  reportNature: '', // 新增通报性质字段
  scoreChange: 0,
  remark: ''
})

// 状态管理
const submitting = ref(false)
const showPreview = ref(false)
const message = ref('')   
const messageType = ref<'success' | 'error'>('success')

// 班级列表（基于class.json）
const classList = ref([
  { class: 1, headteacher: "王振宽" },
  { class: 2, headteacher: "郭宝伟" },
  { class: 3, headteacher: "张春水" },
  { class: 4, headteacher: "孙华义" },
  { class: 5, headteacher: "边海根" },
  { class: 6, headteacher: "王国华" },
  { class: 7, headteacher: "刘磊磊" },
  { class: 8, headteacher: "刘鹏欣" },
  { class: 9, headteacher: "陈常锋" },
  { class: 10, headteacher: "程猛猛" },
  { class: 15, headteacher: "谢媛" },
  { class: 16, headteacher: "刘世彬" },
  { class: 17, headteacher: "刘东良" },
  { class: 18, headteacher: "顾明立" },
  { class: 19, headteacher: "周殿勋" },
  { class: 21, headteacher: "王树琦" },
  { class: 22, headteacher: "袁义国" },
  { class: 24, headteacher: "王思程" }
])

// 表单验证
const isFormValid = computed(() => {
  return formData.value.class !== '' &&
         formData.value.reportType.trim() !== '' &&
         formData.value.reportNature !== '' && // 检查通报性质是否已选择
         (
           (formData.value.reportNature === 'praise' && formData.value.scoreChange > 0) || 
           (formData.value.reportNature === 'criticism' && formData.value.scoreChange < 0)
         ) &&
         formData.value.remark.trim().length > 0 &&
         formData.value.remark.length <= 500
})

// 初始化
onMounted(() => {
  // 移除时间相关的初始化代码
})

// 获取班级显示名称
const getClassDisplay = () => {
  const classItem = classList.value.find(c => c.class === Number(formData.value.class))
  return classItem ? `${classItem.class}班 - ${classItem.headteacher}` : ''
}

// 切换预览
const togglePreview = () => {
  showPreview.value = !showPreview.value
}

// 监听通报性质变化，自动调整分数
watch(() => formData.value.reportNature, (newValue) => {
  if (newValue === 'praise' && formData.value.scoreChange <= 0) {
    formData.value.scoreChange = 1
  } else if (newValue === 'criticism' && formData.value.scoreChange >= 0) {
    formData.value.scoreChange = -1
  }
})

// 提交表单
const handleSubmit = async () => {
  if (!isFormValid.value) return

  submitting.value = true
  message.value = ''

  try {
    // 获取当前登录用户信息
    const userInfo = getUserInfo() || { name: '系统用户' }
    
    // 构建符合后端要求的数据格式
    const submitData = {
      class: parseInt(formData.value.class),
      isadd: formData.value.reportNature === 'praise', // 使用通报性质而不是分数判断
      changescore: Math.abs(formData.value.scoreChange),
      note: `${formData.value.reportType} - ${formData.value.remark}`,
      submitter: userInfo.name
    }
    
    console.log('提交通报数据:', submitData)
    
    // 使用配置的 API URL
    const response = await fetch(SUBMIT_REPORT_API, {
      method: 'POST',
      headers: {
        ...API_CONFIG.headers,
        'Authorization': `Bearer ${localStorage.getItem('token')}` // 添加认证 token
      },
      body: JSON.stringify(submitData),
    })

    // 检查 HTTP 状态码
    if (!response.ok) {
      // 尝试获取错误信息
      let errorMessage = '服务器错误，请稍后重试'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        // 如果无法解析 JSON，使用默认错误消息
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()

    if (result.success) {
      message.value = '通报提交成功！'
      messageType.value = 'success'
      
      // 重置表单
      setTimeout(() => {
        resetForm()
      }, 2000)
    } else {
      throw new Error(result.message || '提交失败，请稍后重试')
    }

  } catch (error) {
    console.error('提交失败:', error)
    message.value = error instanceof Error ? error.message : '网络错误，请检查连接后重试'
    messageType.value = 'error'
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.value = {
    class: '',
    reportType: '',
    reportNature: '', // 重置通报性质
    scoreChange: 0,
    remark: ''
  }
  showPreview.value = false
  message.value = ''
}
</script>

<style scoped>
.submit-report-container {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.submit-header {
  text-align: center;
  margin-bottom: 2rem;
}

.submit-header h2 {
  color: #333;
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.submit-header p {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.form-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.report-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled,
.form-group select:disabled,
.form-group textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.field-hint {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
}

.form-preview {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.form-preview h4 {
  color: #333;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preview-item {
  font-size: 0.95rem;
  color: #333;
}

.preview-item strong {
  color: #666;
  min-width: 80px;
  display: inline-block;
}

.score-positive {
  color: #27ae60 !important;
}

.score-negative {
  color: #e74c3c !important;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.preview-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.preview-btn {
  background: #f8f9fa;
  color: #333;
  border: 2px solid #e9ecef;
}

.preview-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #dee2e6;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.preview-btn:disabled,
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.message {
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
  margin-top: 1rem;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .preview-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>