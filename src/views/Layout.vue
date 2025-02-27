<template>
  <el-container class="layout-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <h2>个人数据可视化平台</h2>
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              {{ authStore.currentUser?.nickname || authStore.currentUser?.username }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="dashboard">
                  <el-icon><DataLine /></el-icon>数据概览
                </el-dropdown-item>
                <el-dropdown-item command="plans">
                  <el-icon><Calendar /></el-icon>计划管理
                </el-dropdown-item>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { DataLine, Calendar, User, ArrowDown, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const handleCommand = (command) => {
  if (command === 'logout') {
    authStore.logout()
  } else {
    router.push(`/${command === 'dashboard' ? '' : command}`)
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0 20px;
}

.header-content {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.el-dropdown-menu {
  padding: 5px 0;
}

.el-dropdown-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style> 