<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>GitHub活跃度</span>
              <el-tag size="small">本周</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="stat-number">{{ stats.githubEvents || 0 }}</div>
            <div class="stat-label">事件数</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>Toggl时间</span>
              <el-tag size="small" type="success">本周</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="stat-number">{{ stats.togglHours || 0 }}</div>
            <div class="stat-label">小时</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>计划完成率</span>
              <el-tag size="small" type="warning">本周</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="stat-number">{{ stats.completionRate || 0 }}%</div>
            <div class="stat-label">完成率</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>活动趋势</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <!-- 这里将添加活动趋势图表 -->
          <div class="chart-container">
            图表待实现
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>时间分布</span>
              <el-select v-model="projectFilter" size="small" placeholder="选择项目">
                <el-option label="全部项目" value="" />
                <el-option
                  v-for="project in projects"
                  :key="project.id"
                  :label="project.name"
                  :value="project.id"
                />
              </el-select>
            </div>
          </template>
          <!-- 这里将添加时间分布图表 -->
          <div class="chart-container">
            图表待实现
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// 模拟数据
const stats = reactive({
  githubEvents: 23,
  togglHours: 42.5,
  completionRate: 85
})

const timeRange = ref('week')
const projectFilter = ref('')
const projects = ref([
  { id: 1, name: '项目A' },
  { id: 2, name: '项目B' }
])

onMounted(() => {
  // 这里将添加数据加载逻辑
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.chart-row {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
  padding: 20px 0;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  margin-top: 10px;
  color: #909399;
}

.chart-container {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
}
</style> 