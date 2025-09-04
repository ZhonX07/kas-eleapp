/**
 * 统一的API请求工具
 */

// 获取API基础URL
const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
}

/**
 * 统一的API请求方法
 * @param {string} endpoint - API端点 (例: '/api/reports/today/stats')
 * @param {object} options - fetch选项
 * @returns {Promise} - API响应
 */
export async function apiRequest(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}${endpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  }
  
  try {
    console.log(`🌐 API请求: ${options.method || 'GET'} ${url}`)
    
    const response = await fetch(url, finalOptions)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log(`✅ API响应成功: ${endpoint}`)
    return data
    
  } catch (error) {
    console.error(`❌ API请求失败: ${endpoint}`, error)
    throw error
  }
}

/**
 * GET请求
 */
export async function apiGet(endpoint) {
  return apiRequest(endpoint, { method: 'GET' })
}

/**
 * POST请求
 */
export async function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * PUT请求
 */
export async function apiPut(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

/**
 * DELETE请求
 */
export async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' })
}

// 导出基础URL获取函数
export { getApiBaseUrl }