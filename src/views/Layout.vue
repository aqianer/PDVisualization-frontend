<template>
  <el-container class="layout-container">
    <el-aside class="sidebar" width="240px">
      <div class="sidebar-header">
<!--        <img src="" alt="Logo" class="logo" />-->
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="#409EFF"/>
          <path d="M8 16L14 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h2>数据可视化平台</h2>
      </div>
      
      <el-menu
        class="sidebar-menu"
        :default-active="$route.path"
        router
      >
        <el-menu-item index="/">
          <el-icon><DataLine /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        
        <el-menu-item index="/plans">
          <el-icon><Calendar /></el-icon>
          <span>计划管理</span>
        </el-menu-item>
        
        <el-menu-item index="/profile">
          <el-icon><User /></el-icon>
          <span>个人设置</span>
        </el-menu-item>
      </el-menu>
      
      <div class="sidebar-footer">
        <el-dropdown @command="handleCommand" trigger="click">
          <div class="user-info">
            <el-avatar 
              :size="32" 
              :src="authStore.currentUser?.avatar_url"
            >
              {{ getUserInitials() }}
            </el-avatar>
            <span class="username">
              {{ authStore.currentUser?.nickname || authStore.currentUser?.username }}
            </span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>个人信息
              </el-dropdown-item>
              <el-dropdown-item divided command="logout" class="logout-item">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-aside>
    
    <el-container class="main-container">
      <el-header class="main-header">
        <div class="header-content">
          <div class="page-title">
            {{ getPageTitle() }}
          </div>
          <div class="header-actions">
            <el-button-group>
              <el-button 
                :icon="isDark ? 'Sunny' : 'Moon'"
                circle
                @click="toggleTheme"
              />
            </el-button-group>
          </div>
        </div>
      </el-header>
      
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { DataLine, Calendar, User, ArrowDown, SwitchButton, Moon, Sunny } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 主题相关
const isDark = ref(localStorage.getItem('theme') === 'dark')

const handleCommand = (command) => {
  if (command === 'logout') {
    authStore.logout()
  } else {
    router.push(`/${command === 'dashboard' ? '' : command}`)
  }
}

const getUserInitials = () => {
  const name = authStore.currentUser?.nickname || authStore.currentUser?.username || ''
  return name.substring(0, 2).toUpperCase()
}

const getPageTitle = () => {
  const titles = {
    '/': '数据概览',
    '/plans': '计划管理',
    '/profile': '个人设置'
  }
  return titles[route.path] || '数据概览'
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  localStorage.setItem('theme', theme)
  document.documentElement.classList.toggle('dark', isDark.value)
  updateThemeColors()
}

const updateThemeColors = () => {
  const theme = isDark.value ? 'dark' : 'light'
  const colors = {
    light: {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f5f7fa',
      '--text-primary': '#2c3e50',
      '--text-secondary': '#606266',
      '--border-color': '#dcdfe6'
    },
    dark: {
      '--bg-primary': '#0a0a0a',
      '--bg-secondary': '#1a1a1a',
      '--text-primary': '#ffffff',
      '--text-secondary': '#e0e0e0',
      '--border-color': '#333333'
    }
  }

  Object.entries(colors[theme]).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value)
  })
}

// 初始化主题
onMounted(() => {
  const theme = localStorage.getItem('theme') || 'light'
  isDark.value = theme === 'dark'
  document.documentElement.classList.toggle('dark', isDark.value)
  updateThemeColors()
})
</script>

<style>
:root {
  --primary-bg: #ffffff;
  --secondary-bg: #f5f7fa;
  --primary-text: #2c3e50;
  --secondary-text: #606266;
  --border-color: #dcdfe6;
  --hover-bg: #f5f7fa;
  --active-bg: #ecf5ff;
  --primary-color: #409eff;
  --sidebar-width: 240px;
  --header-height: 60px;
  --transition-speed: 0.3s;
}

:root.dark {
  --primary-bg: #1a1a1a;
  --secondary-bg: #2d2d2d;
  --primary-text: #ffffff;
  --secondary-text: #909399;
  --border-color: #4c4c4c;
  --hover-bg: #363636;
  --active-bg: #363636;
  --primary-color: #409eff;
}

.layout-container {
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: var(--bg-card);
  backdrop-filter: var(--blur-effect);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: all var(--transition-speed);
  z-index: 1000;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border-color);
}

.logo {
  width: 32px;
  height: 32px;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-primary);
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar-menu {
  flex: 1;
  border: none;
  background-color: transparent;
}

.el-menu {
  border-right: none !important;
}

.el-menu-item {
  height: 50px;
  line-height: 50px;
  margin: 8px 12px;
  border-radius: 8px;
  color: var(--text-secondary) !important;
}

.el-menu-item.is-active {
  background: var(--bg-hover) !important;
  color: var(--primary-color) !important;
}

.el-menu-item:hover {
  background-color: var(--hover-bg) !important;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

.user-info:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.username {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.main-container {
  margin-left: var(--sidebar-width);
  min-height: 100vh;
}

.main-header {
  background-color: var(--bg-card);
  backdrop-filter: var(--blur-effect);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.el-main {
  padding: 24px;
  background-color: var(--bg-secondary);
}

.logout-item {
  color: #f56c6c !important;
}

/* 渐变背景圆 */
.gradient-circle {
  position: fixed;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  z-index: -1;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle at center, var(--primary-color) 0%, rgba(0, 220, 130, 0) 70%);
  top: -100px;
  left: -100px;
  animation: float 8s ease-in-out infinite;
}

.circle-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle at center, var(--secondary-color) 0%, rgba(0, 71, 225, 0) 70%);
  bottom: -150px;
  right: -150px;
  animation: float 10s ease-in-out infinite reverse;
}

.circle-3 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle at center, var(--accent-color) 0%, rgba(121, 40, 202, 0) 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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

/* 主题切换按钮样式 */
.theme-toggle {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
  transition: all var(--transition-speed) ease;
}

.theme-toggle:hover {
  border-color: var(--border-hover) !important;
  transform: translateY(-1px);
}

/* 暗色模式适配 */
.dark .sidebar,
.dark .main-header {
  background: rgba(255, 255, 255, 0.03);
}

.dark .el-menu-item:not(.is-active) {
  color: var(--text-secondary) !important;
}

.dark .user-info {
  background: rgba(255, 255, 255, 0.05);
}
</style> 