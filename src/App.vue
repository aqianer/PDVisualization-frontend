<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script setup>
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
</script>

<style>
/* 主题变量 */
:root {
  /* 基础颜色 */
  --primary-gradient: linear-gradient(45deg, #00dc82, #0047e1);
  --primary-color: #00dc82;
  --secondary-color: #0047e1;
  --accent-color: #7928ca;
  
  /* 背景色 */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f7fa;
  --bg-card: rgba(255, 255, 255, 0.05);
  --bg-hover: rgba(255, 255, 255, 0.1);
  
  /* 文字颜色 */
  --text-primary: #2c3e50;
  --text-secondary: #606266;
  --text-muted: #909399;
  
  /* 边框颜色 */
  --border-color: #dcdfe6;
  --border-hover: #c0c4cc;
  
  /* 特殊效果 */
  --blur-effect: blur(10px);
  --shadow-card: 0 4px 30px rgba(0, 0, 0, 0.1);
  --transition-speed: 0.3s;
}

/* 暗色主题变量 */
:root.dark {
  /* 背景色 */
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --bg-card: rgba(255, 255, 255, 0.05);
  --bg-hover: rgba(255, 255, 255, 0.1);
  
  /* 文字颜色 */
  --text-primary: #ffffff;
  --text-secondary: #e0e0e0;
  --text-muted: #909399;
  
  /* 边框颜色 */
  --border-color: #333333;
  --border-hover: #4c4c4c;
}

/* 全局样式 */
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all var(--transition-speed) ease;
}

#app {
  height: 100vh;
}

/* Element Plus 组件主题适配 */
.el-card {
  background-color: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  backdrop-filter: var(--blur-effect);
  box-shadow: var(--shadow-card) !important;
}

.el-button--primary {
  background: var(--primary-gradient) !important;
  border: none !important;
}

.el-input__wrapper {
  background-color: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  box-shadow: none !important;
}

.el-input__inner {
  color: var(--text-primary) !important;
}

.el-menu {
  background-color: transparent !important;
}

.el-menu-item {
  color: var(--text-secondary) !important;
}

.el-menu-item.is-active {
  color: var(--primary-color) !important;
  background: var(--bg-hover) !important;
}

/* 图表主题适配 */
.echarts {
  background: transparent !important;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--text-muted);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

/* 卡片和容器通用样式 */
.glass-card {
  background: var(--bg-card);
  backdrop-filter: var(--blur-effect);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  transition: all var(--transition-speed) ease;
}

.glass-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

/* 文字渐变效果 */
.gradient-text {
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 动画效果 */
.fade-transition {
  transition: all var(--transition-speed) ease;
}

/* 统一圆角 */
.el-button,
.el-input__wrapper,
.el-card,
.el-menu-item {
  border-radius: 8px !important;
}

/* 暗色模式特殊处理 */
.dark .glass-card {
  background: rgba(255, 255, 255, 0.05);
}

.dark .el-button:not(.el-button--primary) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

.dark .el-input__wrapper {
  box-shadow: none !important;
}

/* 平滑过渡 */
.el-card,
.el-table,
.el-pagination,
.el-input__wrapper,
.el-select-dropdown,
.el-button {
  transition: all 0.3s ease;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #909399;
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #606266;
}

::-webkit-scrollbar-thumb:hover {
  background: #606266;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #909399;
}
</style> 