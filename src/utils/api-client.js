/**
 * 统一的API客户端
 * 处理所有HTTP请求和错误处理
 */

// API基础URL配置 - 从环境变量获取
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000')

// 默认请求选项
const DEFAULT_OPTIONS = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include'
}

// 请求超时控制
function withTimeout(promise, timeoutMs = API_TIMEOUT) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
  })
  
  return Promise.race([promise, timeout])
}

// 通用API请求函数
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  if (import.meta.env.VITE_DEBUG === 'true') {
    console.log(`🌐 API请求: ${options.method || 'GET'} ${url}`)
  }
  
  try {
    const fetchPromise = fetch(url, {
      ...DEFAULT_OPTIONS,
      ...options,
      headers: {
        ...DEFAULT_OPTIONS.headers,
        ...options.headers
      }
    })

    const response = await withTimeout(fetchPromise)

    // 检查响应是否为 HTML（通常是 404 页面）
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('text/html')) {
      throw new Error(`HTTP ${response.status}: 接口返回HTML页面，可能是路由不存在`)
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Request failed'}`)
    }

    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log(`✅ API响应成功: ${endpoint}`)
    }
    return data
  } catch (error) {
    console.error(`❌ API请求失败: ${endpoint}`, error)
    throw error
  }
}

// GET 请求
export async function apiGet(endpoint) {
  return apiRequest(endpoint, { method: 'GET' })
}

// POST 请求
export async function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// PUT 请求
export async function apiPut(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

// DELETE 请求
export async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' })
}

// 导出API基础URL和配置
export function getApiConfig() {
  return {
    baseUrl: API_BASE_URL,
    timeout: API_TIMEOUT,
    debug: import.meta.env.VITE_DEBUG === 'true'
  }
}

// 导出API基础URL获取函数
export function getApiBaseUrl() {
  return API_BASE_URL
}