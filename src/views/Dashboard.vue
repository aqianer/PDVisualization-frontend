<template>
  <div class="dashboard-container" :class="currentTheme">
    <!-- 主题切换按钮 -->
<!--    <el-button-->
<!--        class="theme-toggle"-->
<!--        :icon="currentTheme === 'light' ? 'Moon' : 'Sunny'"-->
<!--        circle-->
<!--        @click="toggleTheme"-->
<!--    />-->

    <!-- 热力图 -->
    <el-card shadow="hover" class="heatmap-card">
      <template #header>
        <div class="card-header">
          <span>计划完成度热力图</span>
          <div class="filter-group">
            <el-select v-model="heatmapFilter.planType" placeholder="计划类型" size="small">
              <el-option label="全部计划" value=""/>
              <el-option label="每日必做" value="1"/>
              <el-option label="非每日必做" value="2"/>
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
            <div class="stat-icon github-icon">
              <i class="el-icon-star-on"></i>
            </div>
            <div class="stat-number">
              <countTo :startVal="0" :endVal="loading_data.github.total_events" :duration="1800"/>
            </div>
            <div class="stat-label">GitHub活跃度</div>
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
            <el-tooltip
                effect="light"
                placement="bottom"
                :show-after="200"
                :hide-after="0"
                popper-class="stat-tooltip"
            >
              <template #content>
                <div class="tooltip-content">
                  <div class="tooltip-title">本周时间统计</div>
                  <div class="tooltip-item">
                    <span>目标时间：</span>
                    <span class="value">{{ loading_data.toggl.target_hours }}小时</span>
                  </div>
                  <div class="tooltip-item">
                    <span>实际时间：</span>
                    <span class="value">{{ loading_data.toggl.actual_hours }}小时</span>
                  </div>
                  <div class="tooltip-item">
                    <span>完成率：</span>
                    <span class="value">{{ loading_data.toggl.completion_rate }}%</span>
                  </div>
                  <div class="tooltip-divider"></div>
                  <div class="tooltip-item">
                    <span>日均时间：</span>
                    <span class="value">{{ (loading_data.toggl.actual_hours / 7).toFixed(1) }}小时</span>
                  </div>
                </div>
              </template>
              <div class="progress-circle" ref="progressCircle">
                <div class="circle-info">
                  <div class="actual-hours">{{ loading_data.toggl.actual_hours }}</div>
                  <div class="target-hours">/ {{ loading_data.toggl.target_hours }}h</div>
                </div>
              </div>
            </el-tooltip>
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
            <el-tooltip
                effect="light"
                placement="bottom"
                :show-after="200"
                :hide-after="0"
                popper-class="stat-tooltip"
            >
              <template #content>
                <div class="tooltip-content">
                  <div class="tooltip-title">计划完成详情</div>
                  <div class="tooltip-item">
                    <span>总计划数：</span>
                    <span class="value">{{ loading_data.plans?.total || 0 }}个</span>
                  </div>
                  <div class="tooltip-item">
                    <span>已完成：</span>
                    <span class="value success">{{ loading_data.plans?.completed || 0 }}个</span>
                  </div>
                  <div class="tooltip-item">
                    <span>进行中：</span>
                    <span class="value warning">{{ loading_data.plans?.inProgress || 0 }}个</span>
                  </div>
                  <div class="tooltip-item">
                    <span>已延期：</span>
                    <span class="value danger">{{ loading_data.plans?.delayed || 0 }}个</span>
                  </div>
                </div>
              </template>
              <div class="stat-number">
                <countTo :startVal="0" :endVal="loading_data.toggl.completion_rate" :duration="2000"/>
                %
              </div>
              <div class="stat-label">完成率</div>
            </el-tooltip>
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
              <el-radio-group v-model="timeRange" size="small" @change="handleTimeRangeChange">
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" ref="trendChart"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>时间分布</span>

            </div>
          </template>
          <div class="chart-container" ref="distributionChart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, computed, watch, onUnmounted} from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request'
import {CountTo} from 'vue3-count-to'

// 状态和引用
const heatmapChart = ref(null)
const progressCircle = ref(null)
const trendChart = ref(null)
const distributionChart = ref(null)
const timeRange = ref('week')


// 数据状态
const loading_data = reactive({
  toggl: {
    actual_hours: 0,
    target_hours: 40,
    completion_rate: 0,
    period: '',
  },
  github: {
    total_events: 0,
    commits: 0,
    pulls: 0,
    issues: 0,
    daily_events:[]
  },
  plans: {
    total: 0,
    completed: 0,
    inProgress: 0,
    delayed: 0,
    distribution:[]
  }
})

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

// 主题相关
const currentTheme = ref('light')
const themes = {
  light: {
    backgroundColor: '#ffffff',
    textColor: '#303133',
    cardBg: '#ffffff',
    borderColor: '#EBEEF5',
    chartColors: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
  },
  dark: {
    backgroundColor: '#1e1e1e',
    textColor: '#ffffff',
    cardBg: '#2d2d2d',
    borderColor: '#4c4c4c',
    chartColors: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
  }
}

// 获取仪表盘数据
const fetchDashboardData = async () => {
  try {
    // 获取热力图数据
    const heatmapResponse = await request.get('/plans/heatmap', {
      params: {
        plan_type: heatmapFilter.planType || undefined,
        start_date: heatmapFilter.dateRange?.[0]?.toISOString().split('T')[0],
        end_date: heatmapFilter.dateRange?.[1]?.toISOString().split('T')[0]
      }
    })

    // 更新热力图数据
    heatmapData.value = heatmapResponse.map(item => ({
      date: new Date(item.record_date),
      value: item.heat_level,
      details: item.plan_status
    }))

    // 获取其他统计数据
    const response = await request.get('/stats/dashboard')
    // 更新状态
    Object.assign(loading_data.toggl, response.stats.toggl)
    Object.assign(loading_data.github, {
      total_events: response.stats.github.total_events,
      commits: response.stats.github.commits,
      pulls: response.stats.github.pulls,
      issues: response.stats.github.issues,
      githubEvents: response.stats.github.daily_events,
    })
    Object.assign(loading_data.plans, {
      total: response.stats.plans.total,
      completed: response.stats.plans.completed,
      inProgress: response.stats.plans.inProgress,
      delayed: response.stats.plans.delayed,
      distribution: response.stats.plans.distribution,
    })

    // 初始化图表
    initProgressCircle()
    initTrendChart(response.stats.github.daily_events)
    initDistributionChart(response.stats.plans.distribution)
    initHeatmap()
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  }
}

// 初始化热力图
const initHeatmap = () => {
  if (!heatmapChart.value) return

  const chart = echarts.init(heatmapChart.value)

  const startDate = heatmapFilter.dateRange ?
      heatmapFilter.dateRange[0].getFullYear() :
      new Date().getFullYear()

  const calendar = {
    top: 50,
    left: 50,
    right: 10,
    cellSize: ['auto', 26],
    range: startDate,
    itemStyle: {
      borderWidth: 7,
      borderColor: '#fff',
      borderRadius: 7
    },
    yearLabel: {show: false},
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
        console.log(heatmapData.value instanceof Array) //true
        console.log(heatmapData.value)
        // const data = heatmapData.value.find(item =>
        //     echarts.format.formatTime('yyyy-MM-dd', item.date)  === params.value[0]
        // )
        const dateIndex = new Map();
        heatmapData.value.forEach(item => {
          const key = echarts.format.formatTime('yyyy-MM-dd', item.date);
          dateIndex.set(key, item);
        });

        const data = dateIndex.get(params.value[0]);

        console.log(data)
        
        if (!data) return params.value[0]

        let details = `<div class="heatmap-tooltip">
          <div class="tooltip-header">
            <span class="tooltip-date">${params.value[0]}</span>
            <span class="tooltip-level">热力等级: ${data.value}</span>
          </div>
          <div class="tooltip-divider"></div>
          <div class="tooltip-plans">
            <div class="plans-title">计划完成情况:</div>`

        // 遍历所有计划状态
        for (const [planName, status] of Object.entries(data.details)) {
          const statusClass = status.completed ? 'completed' : 'incomplete'
          const planTypeText = status.plan_type === 1 ? '(每日必做)' :
              status.plan_type === 2 ? '(非每日)' : '(未加入)'
          const duration = status.duration || 0
          console.log(duration)
          details += `
            <div class="plan-item ${statusClass}">
              <div class="plan-info">
                <span class="plan-name">${planName}</span>
                <span class="plan-type">${planTypeText}</span>
              </div>
              <span class="plan-duration">${duration}分钟</span>
            </div>`
        }

        details += '</div></div>'
        return details
      },
      appendToBody: true,
      extraCssText: `
        background-color: var(--bg-card);
        border-radius: 8px;
        padding: 16px;
        width: auto;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        font-family: system-ui, -apple-system, sans-serif;
        
        .heatmap-tooltip {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .tooltip-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }
        
        .tooltip-date {
          font-weight: 500;
        }
        
        .tooltip-level {
          color: var(--text-secondary);

        }
        
        .tooltip-divider {
          height: 1px;
          background: var(--border-color);
          margin: 4px 0;
        }
        
        .plans-title {
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--text-secondary);
        }
        
        .plan-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          margin: 4px 0;
          border-radius: 6px;
          background: var(--bg-hover);
        }
        
        .plan-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .plan-name {
          font-weight: 500;
        }
        
        .plan-type {
          font-size: 12px;
          color: var(--text-secondary);
        }
        
        .plan-duration {
          font-size: 13px;
          color: var(--text-secondary);
        }
        
        .completed {
          border-left: 3px solid var(--primary-color);
        }
        
        .incomplete {
          border-left: 3px solid var(--border-color);
          opacity: 0.8;
        }
      `
    },
    visualMap: {
      show: true,
      min: 0,
      max: 4,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: -20,
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
    series: [{
      type: 'heatmap',
      coordinateSystem: 'calendar',
      calendarIndex: 0,
      data: heatmapData.value.map(item => [
        echarts.format.formatTime('yyyy-MM-dd', item.date),
        item.value
      ])
    }]
  }

  chart.setOption(option)
}

// 初始化进度圆环
const initProgressCircle = () => {
  if (!progressCircle.value) return

  const chart = echarts.init(progressCircle.value)
  const percentage = (loading_data.toggl.actual_hours / loading_data.toggl.target_hours) * 100

  const option = {
    series: [{
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      pointer: {
        show: false
      },
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: '#67C23A'
              },
              {
                offset: 1,
                color: '#95D475'
              }
            ]
          }
        }
      },
      axisLine: {
        lineStyle: {
          width: 20,
          color: [[1, '#E5E9F2']]
        }
      },
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      },
      data: [{
        value: percentage,
        detail: {
          show: false
        }
      }],
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicInOut'
    }]
  }

  chart.setOption(option)
}

// 初始化趋势图
const initTrendChart = (data) => {
  if (!trendChart.value) return

  const chart = echarts.init(trendChart.value)
  const dates = data.map(item => item.date)
  const counts = data.map(item => item.count)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 个事件'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: {
        lineStyle: {
          color: '#909399'
        }
      },
      axisLabel: {
        formatter: (value) => {
          const date = new Date(value)
          return `${date.getMonth() + 1}/${date.getDate()}`
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: true,
        lineStyle: {
          color: '#909399'
        }
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [{
      name: '事件数',
      type: 'line',
      smooth: true,
      data: counts,
      symbolSize: 8,
      itemStyle: {
        color: '#409EFF'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: 'rgba(64,158,255,0.2)'
          }, {
            offset: 1,
            color: 'rgba(64,158,255,0)'
          }]
        }
      }
    }],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicInOut'
  }

  chart.setOption(option)
}

// 初始化分布图
const initDistributionChart = (data) => {
  if (!distributionChart.value) return

  const chart = echarts.init(distributionChart.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}小时 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      formatter: (name) => {
        const item = data.find(d => d.plan_name === name)
        return `${name} (${item.percentage}%)`
      }
    },
    series: [{
      name: '时间分布',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: data.map(item => ({
        name: item.plan_name,
        value: item.duration,
        itemStyle: {
          color: item.color
        }
      }))
    }]
  }

  chart.setOption(option)
}

// 处理时间范围变化
const handleTimeRangeChange = () => {
  // TODO: 根据新的时间范围重新获取数据
  fetchDashboardData()
}

// 处理日期范围变化
const handleDateRangeChange = () => {
  fetchDashboardData()
}

// 监听筛选条件变化
watch([heatmapFilter, heatmapData], () => {
  if (heatmapData.value.length > 0) {
    initHeatmap()
  }
}, {deep: true})

// 监听窗口大小变化
window.addEventListener('resize', () => {
  const charts = [
    heatmapChart.value && echarts.getInstanceByDom(heatmapChart.value),
    progressCircle.value && echarts.getInstanceByDom(progressCircle.value),
    trendChart.value && echarts.getInstanceByDom(trendChart.value),
    distributionChart.value && echarts.getInstanceByDom(distributionChart.value)
  ]

  charts.forEach(chart => chart?.resize())
})

// 在组件卸载时清理图表实例
onUnmounted(() => {
  const charts = [
    heatmapChart.value && echarts.getInstanceByDom(heatmapChart.value),
    progressCircle.value && echarts.getInstanceByDom(progressCircle.value),
    trendChart.value && echarts.getInstanceByDom(trendChart.value),
    distributionChart.value && echarts.getInstanceByDom(distributionChart.value)
  ]

  charts.forEach(chart => chart?.dispose())
})

// 切换主题
const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', currentTheme.value)
  updateChartsTheme()
}

// 更新图表主题
const updateChartsTheme = () => {
  const theme = themes[currentTheme.value]
  const charts = [
    heatmapChart.value && echarts.getInstanceByDom(heatmapChart.value),
    progressCircle.value && echarts.getInstanceByDom(progressCircle.value),
    trendChart.value && echarts.getInstanceByDom(trendChart.value),
    distributionChart.value && echarts.getInstanceByDom(distributionChart.value)
  ]

  charts.forEach(chart => {
    if (chart) {
      const option = chart.getOption()
      // 更新配色方案
      if (option.series[0].type === 'heatmap') {
        option.visualMap[0].inRange.color = theme.chartColors
      }
      chart.setOption(option)
    }
  })
}

onMounted(async () => {
  await fetchDashboardData()
  document.documentElement.setAttribute('data-theme', currentTheme.value)
})
</script>

<style>
/* 主题变量 */
:root {
  --bg-color: #ffffff;
  --text-color: #303133;
  --card-bg: #ffffff;
  --border-color: #EBEEF5;
  --tooltip-bg: rgba(255, 255, 255, 0.95);
  --tooltip-text: #303133;
  --tooltip-border: #e4e7ed;
}

:root[data-theme='dark'] {
  --bg-color: #1e1e1e;
  --text-color: #ffffff;
  --card-bg: #2d2d2d;
  --border-color: #4c4c4c;
  --tooltip-bg: rgba(45, 45, 45, 0.95);
  --tooltip-text: #ffffff;
  --tooltip-border: #4c4c4c;
}

.dashboard-container {
  padding: 20px;
  background-color: var(--bg-color);
  color: var(--text-color);
  min-height: 100vh;
  transition: all 0.3s ease;
}

.el-card {
  background-color: var(--card-bg);
  border-color: var(--border-color);
  transition: all 0.3s ease;
}

.theme-toggle {
  position: fixed;
  right: 100px;
  top: 20px;
  z-index: 1000;
}

.heatmap-card {
  margin-bottom: 20px;
}

.heatmap-container {
  height: 260px;
  width: 94%;
  margin-left: 40px;
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
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.progress-circle {
  width: 120px;
  height: 120px;
  position: relative;
}

.circle-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.actual-hours {
  font-size: 24px;
  font-weight: bold;
  color: #67C23A;
}

.target-hours {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
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
}

.filter-group {
  display: flex;
  gap: 20px;
  align-items: center;
}

.heatmap-tooltip {
  background-color: var(--tooltip-bg);
  color: var(--tooltip-text);
  border: 0px solid var(--tooltip-border);
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

.stat-tooltip {
  padding: 0 !important;
  border: none !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
}

.tooltip-content {
  padding: 16px;
  min-width: 200px;
}

.tooltip-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #EBEEF5;
}

.tooltip-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
}

.tooltip-item:last-child {
  margin-bottom: 0;
}

.tooltip-item .value {
  font-weight: 500;
  color: #303133;
}

.tooltip-item .value.success {
  color: #67C23A;
}

.tooltip-item .value.warning {
  color: #E6A23C;
}

.tooltip-item .value.danger {
  color: #F56C6C;
}

.tooltip-divider {
  height: 1px;
  background-color: #EBEEF5;
  margin: 8px 0;
}

.progress-circle {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.progress-circle:hover {
  transform: scale(1.05);
}

.stat-number {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.stat-number:hover {
  transform: scale(1.1);
}
</style> 