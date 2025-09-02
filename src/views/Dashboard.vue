<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>KLYZ Assessment System</h1>
      <div class="user-info">
        <span>欢迎使用系统</span>
        <button @click="logout" class="logout-btn">退出登录</button>
      </div>
    </header>
    
    <nav class="dashboard-nav">
      <div class="nav-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['nav-tab', { active: activeTab === tab.id }]"
        >
          {{ tab.name }}
        </button>
      </div>
    </nav>
    
    <main class="dashboard-main">
      <div class="dashboard-content">
        <component :is="activeComponent" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'

// 动态导入组件
const Overview = defineAsyncComponent(() => import('@/components/dashboard/Overview.vue'))
const SubmitReport = defineAsyncComponent(() => import('@/components/dashboard/SubmitReport.vue'))
const ReviewArchive = defineAsyncComponent(() => import('@/components/dashboard/ReviewArchive.vue'))

const router = useRouter()
const activeTab = ref('overview')

const tabs = [
  { id: 'overview', name: '总览' },
  { id: 'submit', name: '提交通报' },
  { id: 'archive', name: '审阅过往档案' }
]

const activeComponent = computed(() => {
  switch (activeTab.value) {
    case 'overview':
      return Overview
    case 'submit':
      return SubmitReport
    case 'archive':
      return ReviewArchive
    default:
      return Overview
  }
})

const logout = () => {
  router.push('/login')
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'HarmonyOS Sans SC', 'Jetbrains Mono', sans-serif;
}

.dashboard-header {
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.dashboard-nav {
  background: white;
  border-bottom: 1px solid #e1e5e9;
  padding: 0 2rem;
}

.nav-tabs {
  display: flex;
  gap: 0;
}

.nav-tab {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  color: #666;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  font-family: inherit;
}

.nav-tab:hover {
  color: #333;
  background-color: #f8f9fa;
}

.nav-tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background-color: #f8fafe;
}

.dashboard-main {
  padding: 2rem;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .dashboard-nav {
    padding: 0 1rem;
  }

  .nav-tabs {
    flex-direction: column;
  }

  .nav-tab {
    padding: 0.75rem;
    text-align: left;
  }

  .dashboard-main {
    padding: 1rem;
  }
}
</style>