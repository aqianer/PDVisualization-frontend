import { defineStore } from 'pinia'
import axios from 'axios'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token'),
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
        
        const formData = new FormData()
        formData.append('username', username)
        formData.append('password', password)
        
        const response = await axios.post('/api/token', formData)
        this.token = response.data.access_token
        localStorage.setItem('token', this.token)
        
        await this.fetchCurrentUser()
        router.push('/')
      } catch (error) {
        this.error = error.response?.data?.detail || '登录失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCurrentUser() {
      try {
        const response = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        this.user = response.data
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