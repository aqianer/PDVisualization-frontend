<template>
  <div class="dashboard-container">
    <!-- 热力图 -->
    <el-card shadow="hover" class="heatmap-card">
      <template #header>
        <div class="card-header">
          <span>计划完成度热力图</span>
          <div class="filter-group">
            <el-select v-model="heatmapFilter.planType" placeholder="计划类型" size="small">
              <el-option label="全部计划" value="" />
              <el-option label="每日必做" value="1" />
              <el-option label="非每日必做" value="2" />
            </el-select>
            <el-date-picker
              v-model="heatmapFilter.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              :shortcuts="dateShortcuts"
              @change="handleDateRangeChange"
            />
          </div>
        </div>
      </template>
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

// 热力图筛选条件
const heatmapFilter = reactive({
  planType: '',
  dateRange: null
})

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      return [start, end]
    }
  },
  {
    text: '最近三月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      return [start, end]
    }
  }
]

// 处理日期范围变化
const handleDateRangeChange = () => {
  initHeatmap()
}

// 监听筛选条件变化
watch(heatmapFilter, () => {
  initHeatmap()
}, { deep: true })

// 获取热力图数据
const fetchHeatmapData = async () => {
  try {
    const params = {}
    if (heatmapFilter.planType) {
      params.plan_type = heatmapFilter.planType
    }
    if (heatmapFilter.dateRange) {
      params.start_date = heatmapFilter.dateRange[0].toISOString().split('T')[0]
      params.end_date = heatmapFilter.dateRange[1].toISOString().split('T')[0]
    }
    
    const response = await request.get('/plans/heatmap', { params })
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
  
  const startDate = heatmapFilter.dateRange ? 
    heatmapFilter.dateRange[0].getFullYear() :
    new Date().getFullYear()
  
  const calendar = {
    top: 50,
    left: 50,
    right: 10,
    cellSize: ['auto', 20],
    range: startDate,
    itemStyle: {
      borderWidth: 2,
      borderColor: '#fff',
      borderRadius: 2
    },
    yearLabel: { show: false },
    dayLabel: {
      nameMap: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    },
    monthLabel: {
      nameMap: 'cn'
    }
  }
  
  const option = {
    title: {
      show: false
    },
    tooltip: {
      position: 'top',
      formatter: function (params) {
        const data = heatmapData.value.find(item => 
          echarts.format.formatTime('yyyy-MM-dd', item.date) === params.value[0]
        )
        
        if (!data) return params.value[0]
        
        let details = `<div class="heatmap-tooltip">
          <div class="tooltip-date">${params.value[0]}</div>
          <div class="tooltip-level">完成度等级: ${params.value[1]}</div>
          <div class="tooltip-plans">计划完成情况:</div>`
        
        for (const [planName, status] of Object.entries(data.details)) {
          const statusClass = status.completed ? 'completed' : 'incomplete'
          const planTypeText = status.plan_type === 1 ? '(每日必做)' : 
                             status.plan_type === 2 ? '(非每日)' : ''
          details += `
            <div class="plan-item ${statusClass}">
              <span class="plan-name">${planName}${planTypeText}</span>
              <span class="plan-duration">${status.duration}分钟</span>
            </div>`
        }
        
        details += '</div>'
        return details
      },
      extraCssText: `
        background-color: rgba(255, 255, 255, 0.95);
        border-radius: 4px;
        padding: 10px;
        width: auto;
        min-width: 250px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        z-index: 9999;
      `
    },
    visualMap: {
      show: true,
      min: 0,
      max: 4,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: 20,
      inRange: {
        color: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
      },
      controller: {
        inRange: {
          symbol: 'rect'
        }
      },
      textStyle: {
        color: '#666'
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
      ]),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        }
      }
    }
  }
  
  chart.setOption(option)
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

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
  height: 250px;
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

.filter-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.heatmap-tooltip {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.tooltip-date {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #303133;
}

.tooltip-level {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.tooltip-plans {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  border-bottom: 1px solid #EBEEF5;
  padding-bottom: 4px;
}

.plan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 12px;
}

.plan-item.completed {
  color: #67C23A;
}

.plan-item.incomplete {
  color: #F56C6C;
}

.plan-name {
  margin-right: 10px;
}

.plan-duration {
  font-weight: 500;
}
</style> 