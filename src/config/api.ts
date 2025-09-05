/**
 * API配置文件
 * 用于集中管理后端API接口地址
 */

// 从环境变量获取配置
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000')
export const IS_DEV = import.meta.env.VITE_DEV_MODE === 'true'
export const DEBUG_MODE = import.meta.env.VITE_DEBUG === 'true'

// API端点配置
export const API_ENDPOINTS = {
  LOGIN: '/api/login',
  SUBMIT_REPORT: '/api/inputdata',
  TODAY_STATS: '/api/reports/today/stats',
  TODAY_DETAILS: '/api/reports/today/details',
  CLASSES: '/api/classes',
  HISTORY: '/api/reports/history'
}

// API请求通用配置
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: API_TIMEOUT,
  credentials: 'include' as RequestCredentials
}

// API响应类型定义
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
}

// 今日数据响应类型
export interface TodayDetailsResponse {
  summary: {
    total: number
    praise: number
    criticism: number
    activeClasses: number
  }
  allReports: Array<{
    id: string
    class: string
    headteacher: string
    type: string
    level: string
    nature: 'praise' | 'criticism'
    actualScore: number
    note: string
    submitter: string
    submittime: string
  }>
}

// 应用配置
export const APP_CONFIG = {
  title: import.meta.env.VITE_APP_TITLE || 'KAS系统',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  theme: import.meta.env.VITE_THEME || 'light',
  language: import.meta.env.VITE_LANGUAGE || 'zh-CN',
  cacheEnabled: import.meta.env.VITE_CACHE_ENABLED === 'true',
  cacheDuration: parseInt(import.meta.env.VITE_CACHE_DURATION || '300000')
}
