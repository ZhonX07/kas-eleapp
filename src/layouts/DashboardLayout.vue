<template>
  <div class="dashboard-layout">
    <SidebarNav />
    <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="content-wrapper">
        <slot />
      </div>
    </div>
    
    <!-- 移动端遮罩层 -->
    <div v-if="isMobile && sidebarOpen" class="mobile-overlay" @click="closeSidebar"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SidebarNav from '../components/SidebarNav.vue'

const sidebarCollapsed = ref(false)
const sidebarOpen = ref(false)
const isMobile = ref(false)

// 检查是否为移动设备
function checkMobile() {
  isMobile.value = window.innerWidth <= 768
}

// 关闭侧边栏（移动端）
function closeSidebar() {
  sidebarOpen.value = false
}

// 监听窗口大小变化
function handleResize() {
  checkMobile()
  if (!isMobile.value) {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
  overflow-x: hidden;
}

.main-content.sidebar-collapsed {
  margin-left: 60px;
}

.content-wrapper {
  padding: 20px;
  max-width: 100%;
  width: 100%;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  display: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    width: 100%;
  }
  
  .main-content.sidebar-collapsed {
    margin-left: 0;
  }
  
  .content-wrapper {
    padding: 15px;
  }
  
  .mobile-overlay {
    display: block;
  }
}

/* 确保内容区域不会被侧边栏遮挡 */
@media (min-width: 769px) {
  .main-content {
    position: relative;
    z-index: 1;
  }
}
</style>
