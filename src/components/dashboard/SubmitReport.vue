<template>
  <div class="submit-report">
    <div class="page-header">
      <h1>提交通报</h1>
      <p>记录学生的表彰或违纪情况</p>
    </div>

    <!-- 消息提示 -->
    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit" class="report-form">
        <!-- 基本信息 -->
        <div class="form-section">
          <h3>基本信息</h3>
          
          <div class="form-group">
            <label for="class">班级 *</label>
            <select 
              id="class" 
              v-model="formData.class" 
              :disabled="loadingClasses"
              required
            >
              <option value="">{{ loadingClasses ? '加载中...' : '请选择班级' }}</option>
              <option 
                v-for="classItem in classList" 
                :key="classItem.class" 
                :value="classItem.class"
              >
                {{ classItem.class }}班 - {{ classItem.headteacher }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>通报类型 *</label>
            <div class="radio-group">
              <label class="radio-item">
                <input 
                  type="radio" 
                  v-model="formData.type" 
                  value="praise"
                  required
                >
                <span class="radio-label praise">表彰</span>
              </label>
              <label class="radio-item">
                <input 
                  type="radio" 
                  v-model="formData.type" 
                  value="criticism"
                  required
                >
                <span class="radio-label criticism">违纪</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="score">分值 *</label>
            <input 
              id="score"
              type="number" 
              v-model="formData.score" 
              min="1" 
              max="20" 
              required
              placeholder="请输入分值 (1-20)"
            >
            <small class="help-text">分值范围：1-20分</small>
          </div>
        </div>

        <!-- 详细信息 -->
        <div class="form-section">
          <h3>详细信息</h3>
          
          <div class="form-group">
            <label for="title">标题 *</label>
            <input 
              id="title"
              type="text" 
              v-model="formData.title" 
              required
              placeholder="请输入通报标题"
              maxlength="50"
            >
          </div>

          <div class="form-group">
            <label for="description">详细描述 *</label>
            <textarea 
              id="description"
              v-model="formData.description" 
              required
              placeholder="请详细描述具体情况"
              rows="4"
              maxlength="200"
            ></textarea>
            <small class="help-text">{{ formData.description.length }}/200</small>
          </div>

          <div class="form-group">
            <label for="submitter">提交人</label>
            <input 
              id="submitter"
              type="text" 
              v-model="formData.submitter" 
              placeholder="提交人姓名 (可选)"
              maxlength="20"
            >
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <button 
            type="button" 
            @click="resetForm" 
            class="btn btn-secondary"
            :disabled="submitting"
          >
            重置
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="submitting || !isFormValid"
          >
            {{ submitting ? '提交中...' : '提交通报' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { reportsAPI } from '../../utils/api-unified.js'

const router = useRouter()

// 表单数据
const formData = ref({
  class: '',
  type: '',
  score: '',
  title: '',
  description: '',
  submitter: ''
})

// 状态管理
const submitting = ref(false)
const loadingClasses = ref(false)
const message = ref('')
const messageType = ref('') // 'success' | 'error'

// 班级列表
const classList = ref([])

// 表单验证
const isFormValid = computed(() => {
  return formData.value.class && 
         formData.value.type && 
         formData.value.score && 
         formData.value.title.trim() && 
         formData.value.description.trim()
})

// 加载班级列表
async function loadClasses() {
  try {
    loadingClasses.value = true
    console.log('🔄 正在加载班级列表...')
    
    const response = await reportsAPI.getClasses()
    classList.value = response.data || response
    
    console.log('✅ 班级列表加载成功:', classList.value)
  } catch (error) {
    console.error('❌ 加载班级列表失败:', error)
    
    // 使用备用数据
    classList.value = Array.from({ length: 60 }, (_, i) => ({
      class: i + 1,
      headteacher: `班主任${i + 1}`
    }))
    
    console.log('⚠️ 使用备用班级数据')
  } finally {
    loadingClasses.value = false
  }
}

// 表单验证
function validateForm() {
  if (!formData.value.class) {
    message.value = '请选择班级'
    messageType.value = 'error'
    return false
  }
  
  if (!formData.value.type) {
    message.value = '请选择通报类型'
    messageType.value = 'error'
    return false
  }
  
  if (!formData.value.score || formData.value.score < 1 || formData.value.score > 20) {
    message.value = '请输入有效的分值 (1-20)'
    messageType.value = 'error'
    return false
  }
  
  if (!formData.value.title.trim()) {
    message.value = '请输入标题'
    messageType.value = 'error'
    return false
  }
  
  if (!formData.value.description.trim()) {
    message.value = '请输入详细描述'
    messageType.value = 'error'
    return false
  }
  
  return true
}

// 提交表单
async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  try {
    submitting.value = true
    
    const submitData = {
      class: parseInt(formData.value.class),
      isadd: formData.value.type === 'praise',
      changescore: parseInt(formData.value.score),
      note: `${formData.value.title} - ${formData.value.description}`,
      submitter: formData.value.submitter || '系统用户'
    }
    
    console.log('🚀 提交通报数据:', submitData)
    
    const response = await reportsAPI.submitReport(submitData)
    
    if (response.success) {
      console.log('✅ 提交成功:', response)
      
      // 显示成功消息
      message.value = '通报提交成功！'
      messageType.value = 'success'
      
      // 重置表单
      resetForm()
      
      // 3秒后清除消息
      setTimeout(() => {
        message.value = ''
      }, 3000)
    } else {
      throw new Error(response.message || '提交失败')
    }
    
  } catch (error) {
    console.error('❌ 提交失败:', error)
    message.value = `提交失败: ${error.message}`
    messageType.value = 'error'
    
    // 5秒后清除错误消息
    setTimeout(() => {
      message.value = ''
    }, 5000)
  } finally {
    submitting.value = false
  }
}

// 重置表单
function resetForm() {
  formData.value = {
    class: '',
    type: '',
    score: '',
    title: '',
    description: '',
    submitter: ''
  }
  message.value = ''
}

// 页面加载时获取班级列表
onMounted(() => {
  loadClasses()
})
</script>

<style scoped>
.submit-report {
  padding: 20px;
  max-width: 800px;
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

.form-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.form-section {
  margin-bottom: 30px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-section h3 {
  margin: 0 0 20px;
  color: #333;
  font-size: 1.2rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-item input[type="radio"] {
  width: auto;
  margin-right: 8px;
}

.radio-label {
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s;
}

.radio-label.praise {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.radio-label.criticism {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.help-text {
  display: block;
  margin-top: 4px;
  color: #6b7280;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

@media (max-width: 768px) {
  .submit-report {
    padding: 10px;
  }
  
  .form-container {
    padding: 20px;
  }
  
  .radio-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>