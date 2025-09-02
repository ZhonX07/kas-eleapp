interface UserInfo {
  id?: string | number;
  name: string;
  role?: string;
  // 其他可能的用户信息字段
}

/**
 * 从本地存储获取用户信息
 */
export function getUserInfo(): UserInfo | null {
  try {
    const userInfoStr = localStorage.getItem('userInfo')
    if (!userInfoStr) return null
    
    return JSON.parse(userInfoStr) as UserInfo
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

/**
 * 保存用户信息到本地存储
 */
export function setUserInfo(userInfo: UserInfo): void {
  localStorage.setItem('userInfo', JSON.stringify(userInfo))
}

/**
 * 清除用户信息
 */
export function clearUserInfo(): void {
  localStorage.removeItem('userInfo')
  localStorage.removeItem('token')
}

/**
 * 检查用户是否已登录
 */
export function isLoggedIn(): boolean {
  return !!localStorage.getItem('token') && !!getUserInfo()
}
