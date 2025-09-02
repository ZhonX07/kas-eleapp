/**
 * API配置文件
 * 用于集中管理后端API接口地址
 */

// 开发环境和生产环境都使用远程地址
const isDev = import.meta.env.DEV

// API基础URL
export const API_BASE_URL = 'http://117.72.79.92:8080/api'

// 登录接口
export const LOGIN_API = `${API_BASE_URL}/login`

// 提交通报数据接口
export const SUBMIT_REPORT_API = `${API_BASE_URL}/inputdata`

// 获取报告归档接口
export const GET_ARCHIVES_API = `${API_BASE_URL}/archives`

// API请求通用配置
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json'
  }
}
