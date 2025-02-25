import { defineStore } from 'pinia'
import authApi from '@/api/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user
  },

  actions: {
    async login(username, password) {
      try {
        this.loading = true
        this.error = null
        const data = await authApi.login(username, password)
        this.token = data.access_token
        localStorage.setItem('token', data.access_token)
        await this.fetchCurrentUser()
        router.push('/plan-management')
      } catch (error) {
        this.error = error.response?.data?.detail || '登录失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCurrentUser() {
      try {
        const user = await authApi.getCurrentUser()
        this.user = user
      } catch (error) {
        this.logout()
        throw error
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      router.push('/login')
    }
  }
}) 