<template>
  <div class="plan-container">
    <div class="page-header">
      <h2>计划管理</h2>
      <el-button type="primary" @click="dialogVisible = true">
        新建计划
      </el-button>
    </div>

    <!-- 计划列表 -->
    <el-table :data="planList" style="width: 100%" v-loading="loading">
      <el-table-column prop="plan_name" label="计划名称">
        <template #default="scope">
          {{ scope.row.plan_name }}
        </template>
      </el-table-column>

      <el-table-column label="Toggl项目">
        <template #default="scope">
          {{ getProjectName(scope.row.toggl_project_id) }}
        </template>
      </el-table-column>
      <el-table-column label="GitHub仓库">
        <template #default="scope">
          {{ getRepoName(scope.row.repo_id) }}
        </template>
      </el-table-column>
      <el-table-column prop="daily_plan_duration" label="计划时长">
        <template #default="scope">
          {{ scope.row.daily_plan_duration }}小时/天
        </template>
      </el-table-column>
      <el-table-column prop="deadline" label="截止日期">
        <template #default="scope">
          {{ formatDate(scope.row.deadline) }}
        </template>
      </el-table-column>
      <el-table-column prop="plan_type" label="计划类型">
        <template #default="scope">
          {{ getTypeText(scope.row.plan_type) }}
        </template>
      </el-table-column>
      <el-table-column prop="plan_status" label="状态">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.plan_status)">
            {{ getStatusText(scope.row.plan_status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新建/编辑计划对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="editingPlan ? '编辑计划' : '新建计划'"
        width="50%"
    >
      <el-form
          :model="planForm"
          :rules="rules"
          ref="planFormRef"
          label-width="120px"
      >
        <el-form-item label="计划名称" prop="plan_name">
          <el-input v-model="planForm.plan_name"/>
        </el-form-item>

        <el-form-item label="Toggl项目" prop="toggl_project_id">
          <el-select
              v-model="planForm.toggl_project_id"
              placeholder="选择Toggl项目"
              :loading="projectsLoading"
          >
            <el-option
                v-for="project in togglProjects"
                :key="project.id"
                :label="project.name"
                :value="project.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="GitHub仓库" prop="repo_id">
          <el-select
              v-model="planForm.repo_id"
              placeholder="选择GitHub仓库"
              :loading="reposLoading"
              filterable
          >
            <el-option
                v-for="repo in githubRepos"
                :key="repo.github_id"
                :label="repo.repo_name"
                :value="repo.github_id"
            />
            <template #suffix>
              <div v-if="!showAllRepos && githubRepos.length >= reposPagination.per_page">
                <el-divider/>
                <el-button link type="primary" @click.stop="handleShowMoreRepos">
                  显示更多仓库
                </el-button>
              </div>
              <div v-else-if="showAllRepos" class="pagination-container">
                <el-divider/>
                <el-pagination
                    v-model:current-page="reposPagination.page"
                    :page-size="reposPagination.per_page"
                    :total="reposPagination.total"
                    layout="prev, pager, next"
                    @current-change="handleRepoPageChange"
                    small
                />
              </div>
            </template>
          </el-select>
        </el-form-item>

        <el-form-item label="计划类型" prop="plan_type">
          <el-select
              v-model="planForm.plan_type"
              placeholder="选择计划类型"
              :loading="projectsLoading"
          >
            <el-option
                v-for="planType in planTypes"
                :key="planType.key"
                :label="planType.value"
                :value="planType.key"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="每日计划时长" prop="daily_plan_duration">
          <el-input-number
              v-model="planForm.daily_plan_duration"
              :min="0.5"
              :max="24"
              :step="0.5"
          />
          <span class="unit">小时</span>
        </el-form-item>

        <el-form-item label="截止日期" prop="deadline">
          <el-date-picker
              v-model="planForm.deadline"
              type="datetime"
              placeholder="选择截止日期"
              :disabled-date="disabledDate"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref, watch} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import request from '@/utils/request'

const API_URL = 'http://localhost:8000'
// 状态变量
const loading = ref(false)
const projectsLoading = ref(false)
const reposLoading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const editingPlan = ref(null)
const planFormRef = ref(null)
const showAllRepos = ref(false)

// 数据列表
const planList = ref([])
const togglProjects = ref([])
const githubRepos = ref([])
const reposPagination = reactive({
  page: 1,
  total: 0,
  per_page: 5
})
const planTypes=ref([
  {
    key:0,
    value:'未加入'
  },
  {
    key:1,
    value:'每日必做'
  },
  {
    key:2,
    value:'非每日必做'
  }
])

// 表单数据
const defaultPlanForm = {
  plan_name: '',
  toggl_project_id: '',
  repo_id: '',
  daily_plan_duration: 2,
  plan_type: 0,
  deadline: ''
}

const planForm = reactive({...defaultPlanForm})

// 表单验证规则
const rules = {
  plan_name: [{required: true, message: '请输入计划名称', trigger: 'blur'}],
  toggl_project_id: [{required: true, message: '请选择Toggl项目', trigger: 'change'}],
  repo_id: [{required: true, message: '请选择GitHub仓库', trigger: 'change'}],
  daily_plan_duration: [{required: true, message: '请输入计划时长', trigger: 'blur'}],
  deadline: [{required: true, message: '请选择截止日期', trigger: 'change'}]
}

// 工具函数
const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const getProjectName = (projectId) => {
  const project = togglProjects.value.find(p => p.id === projectId)
  return project ? project.name : '未知项目'
}

const getRepoName = (repoId) => {
  const repo = githubRepos.value.find(r => r.github_id === repoId)
  return repo ? repo.repo_name : '未知仓库'
}

const getStatusType = (status) => {
  const types = {
    0: 'danger',   // 延期
    1: 'success',  // 已完成
    2: 'primary',  // 进行中
    3: 'info'      // 废弃
  }
  return types[status]
}
const getStatusText = (status) => {
  const texts = {
    0: '延期',
    1: '已完成',
    2: '进行中',
    3: '废弃'
  }
  return texts[status]
}

const getTypeText = (type) => {
  const texts = {
    0: '未加入',
    1: '每日必做',
    2: '非每日必做'
  }
  return texts[type]
}

const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7
}

// 数据加载函数
const loadPlans = async () => {
  try {
    loading.value = true
    planList.value = await request.get('/plans')
  } catch (error) {
    ElMessage.error('加载计划列表失败')
  } finally {
    loading.value = false
  }
}

const loadProjects = async () => {
  try {
    projectsLoading.value = true
    const response = await request.get('/toggl/projects')
    togglProjects.value = response
  } catch (error) {
    ElMessage.error('加载Toggl项目失败')
  } finally {
    projectsLoading.value = false
  }
}

const loadRepos = async (page = 1) => {
  try {
    reposLoading.value = true
    const response = await request.get('/github/repos', {
      params: {
        page,
        per_page: showAllRepos.value ? 20 : reposPagination.per_page
      }
    })
    githubRepos.value = response.items
    reposPagination.total = response.total
    reposPagination.page = response.page
  } catch (error) {
    ElMessage.error('加载GitHub仓库失败')
  } finally {
    reposLoading.value = false
  }
}

// 事件处理函数
const handleEdit = (plan) => {
  editingPlan.value = plan
  Object.assign(planForm, plan)
  dialogVisible.value = true
}

const resetForm = () => {
  editingPlan.value = null
  Object.assign(planForm, defaultPlanForm)
  if (planFormRef.value) {
    planFormRef.value.resetFields()
  }
}

const handleDelete = async (plan) => {
  try {
    await ElMessageBox.confirm('确定要删除这个计划吗？', '提示', {
      type: 'warning'
    })

    await request.delete(`/plans/${plan.id}`)
    ElMessage.success('删除成功')
    await loadPlans()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!planFormRef.value) return

  try {
    await planFormRef.value.validate()
    submitting.value = true

    if (editingPlan.value) {
      await request.put(`/plans/${editingPlan.value.id}`, planForm)
    } else {
      await request.post('/plans', planForm)
    }

    ElMessage.success(editingPlan.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    await loadPlans()
  } catch (error) {
    ElMessage.error(editingPlan.value ? '更新失败' : '创建失败')
  } finally {
    submitting.value = false
  }
}

const handleShowMoreRepos = async () => {
  showAllRepos.value = true
  await loadRepos(1)
}

const handleRepoPageChange = async (page) => {
  await loadRepos(page)
}

watch(dialogVisible, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

// 生命周期钩子
onMounted(async () => {
  await Promise.all([
    loadPlans(),
    loadProjects(),
    loadRepos()
  ])
})
</script>

<style scoped>
.plan-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.unit {
  margin-left: 10px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.el-select {
  width: 100%;
}

.pagination-container {
  padding: 8px 0;
  text-align: center;
}

.el-pagination {
  justify-content: center;
  padding: 0;
}
</style> 