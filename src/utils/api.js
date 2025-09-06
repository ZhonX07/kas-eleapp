/**
 * API 客户端工具
 * 统一管理前端与后端的数据交互
 */

// API基础URL配置 - 从环境变量获取
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000')

// 通用请求函数
async function request(url, options = {}) {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 包含 cookies
  }

  // 请求超时控制
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`)
    }

    return data
  } catch (error) {
    clearTimeout(timeoutId)
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

  // 获取班级列表（别名方法）
  async getClasses() {
    return request('/api/classes')
  },

  // 提交通报数据
  async submit(reportData) {
    return request('/api/inputdata', {
      method: 'POST',
      body: JSON.stringify(reportData)
    })
  },

  // 提交通报数据（别名）
  async submitReport(reportData) {
    return this.submit(reportData)
  },

  // 获取历史记录
  async getHistory(params) {
    const queryString = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, value.toString())
      }
    })
    
    return request(`/api/reports/history?${queryString}`)
  },

  // 获取所有通报
  async getAll() {
    return request('/api/reports')
  },

  // 获取今日Excel报告数据
  async getTodayExcelData() {
    return request('/api/reports/today/excel')
  }
}

// 认证相关 API
const authAPI = {
  // TOTP 登录
  async login(loginData) {
    return request('/api/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
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
    // 数据验证逻辑
    const required = ['class', 'isadd', 'changescore', 'note']
    const missing = required.filter(field => !data.hasOwnProperty(field) || data[field] === '')
    
    if (missing.length > 0) {
      throw new Error(`缺少必需字段: ${missing.join(', ')}`)
    }
    
    if (data.changescore < 1 || data.changescore > 20) {
      throw new Error('分数必须在1-20之间')
    }
    
    return true
  },

  sanitize: (data) => {
    // 数据清理逻辑
    return {
      ...data,
      class: parseInt(data.class),
      isadd: Boolean(data.isadd),
      changescore: parseInt(data.changescore),
      note: String(data.note).trim(),
      submitter: String(data.submitter || '').trim() || '系统用户'
    }
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

  // 获取API配置信息
  getApiConfig() {
    return {
      baseUrl: API_BASE_URL,
      timeout: API_TIMEOUT,
      debug: import.meta.env.VITE_DEBUG === 'true'
    }
  }
}

// 使用具名导出
export { reportsAPI, authAPI, inputAPI, utils }