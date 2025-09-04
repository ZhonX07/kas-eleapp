/**
 * API请求工具函数
 * 提供统一的错误处理和请求配置
 */

import { API_CONFIG, type ApiResponse } from '../config/api'

/**
 * 通用API请求函数
 * @param url 请求URL
 * @param options 请求选项
 * @returns Promise<ApiResponse<T>>
 */
export async function apiRequest<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...API_CONFIG,
      ...options,
      headers: {
        ...API_CONFIG.headers,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('API请求失败:', error)
    
    // 网络错误处理
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查网络设置')
    }
    
    // 其他错误
    throw error instanceof Error ? error : new Error('未知错误')
  }
}

/**
 * GET请求
 */
export function apiGet<T = any>(url: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { method: 'GET' })
}

/**
 * POST请求
 */
export function apiPost<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PUT请求
 */
export function apiPut<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE请求
 */
export function apiDelete<T = any>(url: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { method: 'DELETE' })
}