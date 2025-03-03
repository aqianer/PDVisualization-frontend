import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const request = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 5000
})

let isRefreshing = false
let requests = []

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      
      // 如果在登录页面，不需要处理
      if (router.currentRoute.value.name === 'login') {
        return Promise.reject(error)
      }
      
      // 清除用户信息和token
      authStore.logout()
      
      // 静默处理，不显示错误消息
      if (error.config.url.includes('toggl') || error.config.url.includes('github')) {
        return Promise.reject(error)
      }
      
      // 对于其他401错误，显示友好提示
      ElMessage({
        message: '登录已过期，请重新登录',
        type: 'warning'
      })
    } else if (error.response?.data?.detail) {
      ElMessage.error(error.response.data.detail)
    } else {
      ElMessage.error('请求失败，请稍后重试')
    }
    return Promise.reject(error)
  }
)

export default request 