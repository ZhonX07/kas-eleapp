/**
 * API 客户端工具
 * 统一管理前端与后端的数据交互
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// 通用请求函数
async function request(url, options = {}) {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 包含 cookies
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`)
    }

    return data
  } catch (error) {
    console.error(`API 请求失败: ${url}`, error)
    throw error
  }
}

// 报告相关 API
const reportsAPI = {
  // 获取今日统计数据
  async getTodayStats() {
    return request('/api/reports/today/stats')
  },

  // 获取今日明细数据
  async getTodayDetails() {
    return request('/api/reports/today/details')
  },

  // 获取特定日期的通报
  async getReportsByDate(date) {
    return request(`/api/reports/date/${date}`)
  },

  // 获取特定日期和班级的通报
  async getReportsByDateAndClass(date, classNum) {
    return request(`/api/reports/date/${date}/class/${classNum}`)
  },

  // 获取特定月份的通报
  async getReportsByMonth(yearMonth) {
    return request(`/api/reports/${yearMonth}`)
  },

  // 获取班级在日期范围内的通报
  async getReportsByClassAndDateRange(classNum, startDate, endDate) {
    return request(`/api/reports/class/${classNum}/range/${startDate}/${endDate}`)
  },

  // 获取所有班级列表
  async getAllClasses() {
    return request('/api/classes')
  },

  submit: async (reportData) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  getAll: async () => {
    try {
      const response = await fetch('/api/reports');
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

// 认证相关 API
const authAPI = {
  // TOTP 登录
  async login(totp) {
    return request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ totp }),
    })
  },
}

// 数据输入相关 API
const inputAPI = {
  // 提交通报数据
  async submitReport(reportData) {
    return request('/api/inputdata', {
      method: 'POST',
      body: JSON.stringify(reportData),
    })
  },

  validate: (data) => {
    // Add validation logic here
    return true;
  },
  sanitize: (data) => {
    // Add sanitization logic here
    return data;
  }
}

// 工具函数
const utils = {
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
}

// 使用具名导出
export { reportsAPI, authAPI, inputAPI, utils }