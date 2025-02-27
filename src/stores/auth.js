import {defineStore} from 'pinia'
import request from '@/utils/request'
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

                // 将表单数据以 JSON 格式发送
                const payload = {
                    username: username,
                    password: password
                }

                const response = await request.post('/token', payload, {
                    headers: {
                        'Content-Type': 'application/json' // 设置为 JSON 格式
                    }
                })
                console.log(response);
                this.token = response.access_token
                localStorage.setItem('token', this.token)

                await this.fetchCurrentUser()
                await router.push('/')
            } catch (error) {
                this.error = error.response?.data?.detail || '登录失败'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchCurrentUser() {
            try {
                const response = await request.get('/users/me')
                this.user = response
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