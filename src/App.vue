<script setup lang="ts">
import { ref, provide } from 'vue'
import { RouterView } from 'vue-router'
import NotificationSystem from './components/NotificationSystem.vue'
import ReportLiveCard from './components/ReportLiveCard.vue'

const notificationSystem = ref(null)

// 提供全局通知方法
provide('notification', {
  show: (notification) => notificationSystem.value?.addNotification(notification)
})
</script>

<template>
  <div id="app">
    <!-- 主应用路由视图 -->
    <RouterView />
    
    <!-- 添加通知系统 -->
    <NotificationSystem ref="notificationSystem" />
    
    <!-- 添加实时违纪表彰卡片 -->
    <ReportLiveCard />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'HarmonyOS Sans SC', 'Jetbrains Mono', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}
</style>
