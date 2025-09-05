/**
 * 统一的API接口定义
 * 所有API调用的入口点
 */
import { apiGet, apiPost, getApiConfig } from './api-client.js'

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

  // 提交新通报 - 确保使用正确的端点
  async submitReport(data) {
    console.log('📤 提交通报数据到 /api/inputdata:', data)
    return apiPost('/api/inputdata', data)
  },

  // 获取班级列表
  async getClasses() {
    return apiGet('/api/classes')
  },

  // 获取班级列表（别名）
  async getAllClasses() {
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
  },

  // 获取历史记录
  async getHistory(params) {
    const queryString = new URLSearchParams()
    
    // 构建查询参数
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, value.toString())
      }
    })
    
    return apiGet(`/api/reports/history?${queryString}`)
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
  },

  // 获取API配置
  getApiConfig() {
    return getApiConfig()
  }
}

// 导出API基础URL
export { getApiConfig as getApiBaseUrl }