<template>
  <div :class="['sidebar', { collapsed: isCollapsed }]" @mouseleave="handleMouseLeave">
    <div class="sidebar-header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">📊</span>
          <span class="logo-text">数据统计</span>
        </div>
        <button class="toggle-btn" @click="toggleCollapse">
          <span v-if="!isCollapsed">❮</span>
          <span v-else>❯</span>
        </button>
      </div>
    </div>
    
    <div class="sidebar-content">
      <div class="nav-section">
        <div class="section-title">报表</div>
        <router-link to="/reports" class="nav-item" exact-active-class="active" data-tooltip="报表列表">
          <span class="nav-icon">📈</span>
          <span class="nav-text">报表列表</span>
        </router-link>
      </div>
      
      <div class="nav-section">
        <div class="section-title">设置</div>
        <router-link to="/settings" class="nav-item" exact-active-class="active" data-tooltip="系统设置">
          <span class="nav-icon">⚙️</span>
          <span class="nav-text">系统设置</span>
        </router-link>
      </div>
    </div>
    
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">U</div>
        <div class="user-details">
          <div class="user-name">用户名</div>
          <div class="user-role">角色</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const isCollapsed = ref(false)
const route = useRoute()

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function handleMouseLeave() {
  if (isCollapsed.value) {
    isCollapsed.value = true
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow-y: auto;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.sidebar.collapsed .sidebar-header {
  padding: 20px 10px;
  text-align: center;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.2rem;
  font-weight: 600;
}

.logo-icon {
  font-size: 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px;
  border-radius: 8px;
}

.logo-text {
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .logo-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.sidebar.collapsed .toggle-btn {
  margin: 0 auto;
}

.sidebar-content {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.sidebar.collapsed .sidebar-content {
  padding: 20px 5px;
}

.nav-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
  padding: 0 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .section-title {
  opacity: 0;
  height: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.nav-item {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 12px 20px;
  margin: 2px 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.sidebar.collapsed .nav-item {
  margin: 2px 5px;
  padding: 12px 10px;
  justify-content: center;
  gap: 0;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: translateX(5px);
}

.sidebar.collapsed .nav-item:hover {
  transform: translateX(0);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  font-size: 1.2rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.nav-text {
  transition: opacity 0.3s ease;
  white-space: nowrap;
}

.sidebar.collapsed .nav-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* 工具提示样式（折叠状态下显示） */
.sidebar.collapsed .nav-item {
  position: relative;
}

.sidebar.collapsed .nav-item::after {
  content: attr(data-tooltip);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  margin-left: 10px;
  z-index: 1000;
}

.sidebar.collapsed .nav-item:hover::after {
  opacity: 1;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: auto;
}

.sidebar.collapsed .sidebar-footer {
  padding: 20px 10px;
  text-align: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
}

.sidebar.collapsed .user-info {
  justify-content: center;
  gap: 0;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .user-details {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.user-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.user-role {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    max-width: 280px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .sidebar.collapsed {
    width: 100%;
    max-width: 280px;
  }
}

/* 滚动条样式 */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>