import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

// 导入页面组件
const Login = () => import('../views/Login.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const Overview = () => import('../components/dashboard/Overview.vue')
const SubmitReport = () => import('../components/dashboard/SubmitReport.vue')
const ReviewArchive = () => import('../components/dashboard/ReviewArchive.vue')
const ExcelGenerator = () => import('../components/dashboard/ExcelGenerator.vue')

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { title: '登录' }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    redirect: '/dashboard/overview',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'overview',
        name: 'overview',
        component: Overview,
        meta: { title: '今日概览' }
      },
      {
        path: 'submit',
        name: 'submit-report',
        component: SubmitReport,
        meta: { title: '提交通报' }
      },
      {
        path: 'archive',
        name: 'review-archive',
        component: ReviewArchive,
        meta: { title: '审阅档案' }
      },
      {
        path: 'excel',
        name: 'excel-generator',
        component: ExcelGenerator,
        meta: { title: 'Excel报告' }
      }
    ]
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(), // 使用hash模式避免file://协议问题
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  console.log('🔄 路由跳转:', from.path, '->', to.path)
  
  // 修复：检测并防止文件系统路径
  if (to.path.includes(':') || to.path.includes('\\') || to.path.includes('/C:')) {
    console.warn('⚠️ 检测到无效路由路径:', to.path)
    next('/login') // 重定向到登录页
    return
  }
  
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - KAS系统`
  } else {
    document.title = 'KAS系统'
  }

  // 检查认证
  const token = localStorage.getItem('kas_token')
  
  if (to.meta?.requiresAuth && !token) {
    console.log('❌ 需要认证，重定向到登录页')
    next('/login')
  } else if (to.path === '/login' && token) {
    console.log('✅ 已登录，重定向到Dashboard')
    next('/dashboard')
  } else {
    console.log('✅ 路由验证通过')
    next()
  }
})

// 路由错误处理
router.onError((error) => {
  console.error('🚨 路由错误:', error)
})

export default router