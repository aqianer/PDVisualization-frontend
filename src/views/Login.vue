<template>
  <div class="login-container">
    <div class="login-background">
      <div class="gradient-circle circle-1"></div>
      <div class="gradient-circle circle-2"></div>
      <div class="gradient-circle circle-3"></div>
    </div>
    
    <div class="login-content">
      <div class="login-header">
        <h1>个人数据可视化平台</h1>
        <p class="subtitle">登录以继续使用</p>
      </div>
      
      <div class="login-form-container">
        <el-form 
          :model="loginForm" 
          :rules="rules" 
          ref="loginFormRef"
          @submit.prevent="handleLogin"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input 
              v-model="loginForm.username"
              placeholder="用户名"
              :prefix-icon="User"
              class="custom-input"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              :prefix-icon="Lock"
              show-password
              class="custom-input"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              native-type="submit"
              :loading="authStore.loading"
              class="login-button"
            >
              {{ authStore.loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>
        
        <el-alert
          v-if="authStore.error"
          :title="authStore.error"
          type="error"
          show-icon
          class="login-alert"
          @close="authStore.error = null"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { User, Lock } from '@element-plus/icons-vue'

const authStore = useAuthStore()
const loginFormRef = ref(null)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    await authStore.login(loginForm.username, loginForm.password)
  } catch (error) {
    if (!error.response) return
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-color: #0a0a0a;
  overflow: hidden;
}

.login-background {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.gradient-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle at center, #00dc82 0%, rgba(0, 220, 130, 0) 70%);
  top: -100px;
  left: -100px;
  opacity: 0.5;
  animation: float 8s ease-in-out infinite;
}

.circle-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle at center, #0047e1 0%, rgba(0, 71, 225, 0) 70%);
  bottom: -150px;
  right: -150px;
  opacity: 0.5;
  animation: float 10s ease-in-out infinite reverse;
}

.circle-3 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle at center, #7928ca 0%, rgba(121, 40, 202, 0) 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.3;
  animation: pulse 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.4;
  }
}

.login-content {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 40px 20px;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  color: #ffffff;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(to right, #00dc82, #0047e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient 8s ease infinite;
}

.subtitle {
  color: #888;
  margin-top: 10px;
  font-size: 1.1rem;
}

.login-form-container {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.login-form {
  width: 100%;
}

.custom-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: none !important;
  transition: all 0.3s ease;
}

.custom-input :deep(.el-input__wrapper:hover),
.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: #00dc82 !important;
  box-shadow: 0 0 0 1px #00dc82 !important;
}

.custom-input :deep(.el-input__inner) {
  color: #fff !important;
  height: 45px;
}

.custom-input :deep(.el-input__prefix-inner) {
  color: #888;
}

.login-button {
  width: 100%;
  height: 45px;
  background: linear-gradient(45deg, #00dc82, #0047e1);
  border: none;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 220, 130, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.login-alert {
  margin-top: 20px;
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.2);
}

:deep(.el-alert__title) {
  color: #ff4d4f;
}

@media (max-width: 768px) {
  .login-content {
    padding: 20px;
  }
  
  .login-header h1 {
    font-size: 2rem;
  }
  
  .login-form-container {
    padding: 20px;
  }
}
</style> 