import {defineStore} from 'pinia'
import axios from 'axios'
import router from '@/router'

const API_URL = 'http://localhost:8000'

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

                // 将表单数据以 JSON 格式发送
                const payload = {
                    username: username,
                    password: password
                }

                const response = await axios.post(`${API_URL}/api/token`, payload, {
                    headers: {
                        'Content-Type': 'application/json' // 设置为 JSON 格式
                    }
                })
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
                const response = await axios.get(`${API_URL}/api/users/me`, {
                    headers: {Authorization: `Bearer ${this.token}`}
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