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
  }
}

// 用户认证API
export const authAPI = {
  // 用户登录
  async login(credentials) {
    return apiPost('/api/login', credentials)
  }
}

// 导出API基础URL
export { getApiBaseUrl }