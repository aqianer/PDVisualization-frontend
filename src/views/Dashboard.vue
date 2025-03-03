<template>
  <div class="dashboard-container">
    <!-- 热力图 -->
    <el-card shadow="hover" class="heatmap-card">
      <div ref="heatmapChart" class="heatmap-container"></div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request'

// 状态和引用
const heatmapChart = ref(null)
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

// 热力图数据
const heatmapData = ref([])

// 获取热力图数据
const fetchHeatmapData = async () => {
  try {
    const response = await request.get('/plans/heatmap')
    heatmapData.value = response.map(item => ({
      date: new Date(item.record_date),
      value: item.heat_level,
      details: item.plan_status
    }))
  } catch (error) {
    console.error('Failed to fetch heatmap data:', error)
  }
}

// 初始化热力图
const initHeatmap = () => {
  if (!heatmapChart.value || !heatmapData.value.length) return
  
  const chart = echarts.init(heatmapChart.value)
  
  const calendar = {
    top: 40,
    left: 50,
    right: 10,
    cellSize: ['auto', 20],
    range: new Date().getFullYear(),
    itemStyle: {
      borderWidth: 2,
      borderColor: '#fff'
    },
    yearLabel: { show: false }
  }
  
  const option = {
    title: {
      top: 0,
      left: 'center',
      text: '计划完成度热力图'
    },
    tooltip: {
      formatter: function (params) {
        const data = heatmapData.value.find(item => 
          echarts.format.formatTime('yyyy-MM-dd', item.date) === params.value[0]
        )
        
        if (!data) return params.value[0]
        
        let details = '<div style="margin: 10px 0;">完成度等级: ' + params.value[1] + '</div>'
        details += '<div style="margin: 5px 0;">计划完成情况:</div>'
        
        for (const [planName, status] of Object.entries(data.details)) {
          details += `<div>${planName}: ${status.completed ? '已完成' : '未完成'} (${status.duration}分钟)</div>`
        }
        
        return params.value[0] + details
      }
    },
    visualMap: {
      show: false,
      min: 0,
      max: 4,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: 'top',
      inRange: {
        color: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
      }
    },
    calendar: calendar,
    series: {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      calendarIndex: 0,
      data: heatmapData.value.map(item => [
        echarts.format.formatTime('yyyy-MM-dd', item.date),
        item.value
      ])
    }
  }
  
  chart.setOption(option)
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 监听数据变化
watch(heatmapData, () => {
  initHeatmap()
}, { deep: true })

onMounted(async () => {
  await fetchHeatmapData()
  initHeatmap()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.heatmap-card {
  margin-bottom: 20px;
}

.heatmap-container {
  height: 200px;
  width: 100%;
}

.stat-cards {
  margin-bottom: 20px;
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