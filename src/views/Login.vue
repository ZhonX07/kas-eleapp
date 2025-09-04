<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">KLYZ Assessment System</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            required
            :disabled="loading"
          />
        </div>
        
        <div class="form-group">
          <label for="totppass">TOTP验证码</label>
          <input
            id="totppass"
            v-model="totppass"
            type="text"
            maxlength="6"
            placeholder="请输入6位验证码"
            pattern="[0-9]{6}"
            required
            :disabled="loading"
          />
        </div>
        
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '验证中...' : '登录' }}
        </button>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../utils/api-updated.js'

const router = useRouter()

const username = ref('')
const totppass = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!username.value || !totppass.value) {
    errorMessage.value = '请填写所有字段'
    return
  }

  if (totppass.value.length !== 6 || !/^\d{6}$/.test(totppass.value)) {
    errorMessage.value = '验证码必须是6位数字'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    console.log('🔐 正在登录:', { user: username.value })
    
    const response = await authAPI.login({
      user: username.value,
      totppass: totppass.value,
    })

    if (response.success) {
      console.log('✅ 登录成功:', response.user)
      
      // 保存用户信息
      localStorage.setItem('kas_user', JSON.stringify(response.user))
      localStorage.setItem('kas_token', response.token)
      
      // 登录成功，跳转到仪表板
      router.push('/dashboard')
    } else {
      errorMessage.value = response.message || '登录失败，请稍后重试'
    }
  } catch (error) {
    console.error('❌ 登录失败:', error)
    errorMessage.value = '网络错误，请检查连接后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'HarmonyOS Sans SC', 'Jetbrains Mono', sans-serif;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.8rem;
  font-weight: 600;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  font-family: 'HarmonyOS Sans SC', 'JetBrains Mono', monospace;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  text-align: center;
  margin-top: -0.5rem;
  padding: 0.5rem;
  background-color: #ffeaea;
  border-radius: 4px;
  border-left: 4px solid #e74c3c;
}
</style>