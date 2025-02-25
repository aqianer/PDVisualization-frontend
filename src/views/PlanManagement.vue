<template>
  <div class="plan-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <h2>计划管理</h2>
          <el-button type="primary" @click="dialogVisible = true">
            新建计划
          </el-button>
        </div>
      </el-header>
      
      <el-main>
        <!-- 计划列表 -->
        <el-table :data="planList" style="width: 100%">
          <el-table-column prop="planName" label="计划名称" />
          <el-table-column prop="togglProject" label="Toggl项目" />
          <el-table-column prop="githubRepo" label="GitHub仓库" />
          <el-table-column prop="duration" label="计划时长(小时)" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
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
      </el-main>
    </el-container>

    <!-- 新建/编辑计划对话框 -->
    <el-dialog 
      v-model="dialogVisible"
      :title="editingPlan ? '编辑计划' : '新建计划'"
      width="50%"
    >
      <el-form :model="planForm" :rules="rules" ref="planFormRef" label-width="120px">
        <el-form-item label="计划名称" prop="planName">
          <el-input v-model="planForm.planName" />
        </el-form-item>
        
        <el-form-item label="Toggl项目" prop="togglProjectId">
          <el-select v-model="planForm.togglProjectId" placeholder="选择Toggl项目">
            <el-option 
              v-for="project in togglProjects"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="GitHub仓库" prop="repoId">
          <el-select v-model="planForm.repoId" placeholder="选择GitHub仓库">
            <el-option
              v-for="repo in githubRepos"
              :key="repo.id"
              :label="repo.name"
              :value="repo.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="每日计划时长" prop="dailyPlanDuration">
          <el-input-number 
            v-model="planForm.dailyPlanDuration"
            :min="0.5"
            :max="24"
            :step="0.5"
          />
          <span class="unit">小时</span>
        </el-form-item>
        
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="planForm.tags"
            multiple
            placeholder="选择标签"
          >
            <el-option
              v-for="tag in togglTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="截止日期" prop="deadline">
          <el-date-picker
            v-model="planForm.deadline"
            type="date"
            placeholder="选择截止日期"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// 模拟数据
const togglProjects = ref([
  { id: 1, name: '项目A' },
  { id: 2, name: '项目B' }
])

const githubRepos = ref([
  { id: 1, name: 'repo-1' },
  { id: 2, name: 'repo-2' }
])

const togglTags = ref([
  { id: 1, name: 'dev' },
  { id: 2, name: 'design' }
])

const planList = ref([
  {
    id: 1,
    planName: '示例计划',
    togglProject: '项目A',
    githubRepo: 'repo-1',
    duration: 2,
    status: 2
  }
])

const dialogVisible = ref(false)
const editingPlan = ref(null)
const planFormRef = ref(null)

const planForm = reactive({
  planName: '',
  togglProjectId: '',
  repoId: '',
  dailyPlanDuration: 2,
  tags: [],
  deadline: ''
})

const rules = {
  planName: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  togglProjectId: [{ required: true, message: '请选择Toggl项目', trigger: 'change' }],
  repoId: [{ required: true, message: '请选择GitHub仓库', trigger: 'change' }],
  dailyPlanDuration: [{ required: true, message: '请输入计划时长', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择截止日期', trigger: 'change' }]
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

const handleEdit = (row) => {
  editingPlan.value = row
  Object.assign(planForm, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  // TODO: 调用删除API
}

const handleSubmit = async () => {
  if (!planFormRef.value) return
  
  await planFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 调用保存API
      dialogVisible.value = false
    }
  })
}

onMounted(() => {
  // TODO: 获取Toggl项目和GitHub仓库列表
})
</script>

<style scoped>
.plan-container {
  height: 100vh;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.unit {
  margin-left: 10px;
}
</style> 