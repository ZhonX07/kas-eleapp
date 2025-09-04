/**
 * API配置文件
 * 用于集中管理后端API接口地址
 */

// API基础URL - 可以通过环境变量配置，默认使用远程地址
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://117.72.79.92:8080'

// 登录接口
export const LOGIN_API = `${API_BASE_URL}/api/login`

// 提交通报数据接口
export const SUBMIT_REPORT_API = `${API_BASE_URL}/inputdata`

// 获取报告归档接口
export const GET_ARCHIVES_API = `${API_BASE_URL}/archives`

// 获取今日明细数据接口
export const GET_TODAY_DETAILS_API = `${API_BASE_URL}/today-details`

// 获取统计数据接口
export const GET_STATISTICS_API = `${API_BASE_URL}/statistics`

// API请求通用配置
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10秒超时
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

// 开发环境标识
export const IS_DEV = import.meta.env.DEV
