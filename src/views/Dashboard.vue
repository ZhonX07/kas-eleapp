<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>KLYZ Assessment System</h1>
      <div class="user-info">
        <span>欢迎使用系统</span>
        <button @click="logout" class="logout-btn">退出登录</button>
      </div>
    </header>
    
    <div class="dashboard-layout">
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" exact-active-class="active">
          <span class="icon">📊</span>
          <span class="text">今日概览</span>
        </router-link>
        
        <router-link to="/dashboard/submit" class="nav-item" active-class="active">
          <span class="icon">📝</span>
          <span class="text">提交通报</span>
        </router-link>
        
        <router-link to="/dashboard/archive" class="nav-item" active-class="active">
          <span class="icon">📋</span>
          <span class="text">审阅档案</span>
        </router-link>
        
        <router-link to="/dashboard/excel" class="nav-item" active-class="active">
          <span class="icon">📄</span>
          <span class="text">Excel报告</span>
        </router-link>
      </nav>
      
      <!-- 主内容区域 -->
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  // 清除本地存储的用户信息
  localStorage.removeItem('kas_user')
  localStorage.removeItem('kas_token')
  
  // 跳转到登录页
  router.push('/login')
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'HarmonyOS Sans SC', 'Jetbrains Mono', sans-serif;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px;
}

.dashboard-header h1 {
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info span {
  color: #666;
  font-size: 0.9rem;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background: #c0392b;
}

.dashboard-layout {
  display: flex;
  margin-top: 64px;
  min-height: calc(100vh - 64px);
}

.sidebar-nav {
  background: white;
  width: 250px;
  padding: 1rem;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  flex-shrink: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  margin-bottom: 0.25rem;
}

.nav-item:hover {
  background-color: #f8f9fa;
}

.nav-item.active {
  background-color: #e7f0ff;
  color: #0056b3;
}

.icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background-color: #f5f7fa;
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    height: auto;
  }

  .dashboard-layout {
    flex-direction: column;
    margin-top: 100px;
  }

  .sidebar-nav {
    width: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 0.5rem;
  }

  .nav-item {
    justify-content: center;
    padding: 0.5rem;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>