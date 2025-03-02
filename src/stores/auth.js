import {defineStore} from 'pinia'
import request from '@/utils/request'
import router from '@/router'
import CryptoJS from 'crypto-js'

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

                // 生成随机的 IV
                const iv = CryptoJS.lib.WordArray.random(16)
                
                // 从Base64解码密钥
                const keyBase64 = import.meta.env.VITE_ENCRYPTION_KEY
                const keyWords = CryptoJS.enc.Base64.parse(keyBase64)
                
                // 使用 PKCS7 填充并加密
                const encrypted = CryptoJS.AES.encrypt(password, keyWords, {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                })

                // 将 IV 和加密后的密码组合在一起
                const combined = iv.concat(encrypted.ciphertext)
                const encryptedBase64 = CryptoJS.enc.Base64.stringify(combined)

                const payload = {
                    username: username,
                    password: encryptedBase64
                }

                const response = await request.post('/token', payload, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
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