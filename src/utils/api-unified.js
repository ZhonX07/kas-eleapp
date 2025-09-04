import { apiGet, apiPost, getApiBaseUrl } from './api-client.js'

// 报告相关API
export const reportsAPI = {
  // 获取今日统计数据
  async getTodayStats() {
    return apiGet('/api/reports/today/stats')
  },

  // 获取今日详细数据  
  async getTodayDetails() {
    return apiGet('/api/reports/today/details')
  },

  // 提交新通报
  async submitReport(data) {
    return apiPost('/api/inputdata', data)
  },

  // 获取班级列表
  async getClasses() {
    return apiGet('/api/classes')
  },

  // 获取特定日期的通报
  async getReportsByDate(date) {
    return apiGet(`/api/reports/date/${date}`)
  },

  // 获取特定日期和班级的通报
  async getReportsByDateAndClass(date, classNum) {
    return apiGet(`/api/reports/date/${date}/class/${classNum}`)
  },

  // 获取特定月份的通报
  async getReportsByMonth(yearMonth) {
    return apiGet(`/api/reports/${yearMonth}`)
  },

  // 获取班级在日期范围内的通报
  async getReportsByClassAndDateRange(classNum, startDate, endDate) {
    return apiGet(`/api/reports/class/${classNum}/range/${startDate}/${endDate}`)
  }
}

// 用户认证API
export const authAPI = {
  // 用户登录
  async login(credentials) {
    return apiPost('/api/login', credentials)
  }
}

// 工具函数
export const utils = {
  // 格式化日期为 YYYY-MM-DD
  formatDate(date = new Date()) {
    return date.toISOString().split('T')[0]
  },

  // 格式化年月为 YYYY-MM
  formatYearMonth(date = new Date()) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  },

  // 获取今天的中文日期显示
  getChineseDateString(date = new Date()) {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }
}

// 导出API基础URL
export { getApiBaseUrl }