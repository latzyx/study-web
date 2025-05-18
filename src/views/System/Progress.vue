<template>
  <div class="task-progress-container">
    <el-card class="page-header">
      <div class="header-content">
        <h2>学习任务完成情况</h2>
        <div class="header-actions">
          <el-button @click="refreshData">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
          <el-button type="primary" @click="exportToCsv">
            <el-icon><Download /></el-icon>导出数据
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 筛选区域 -->
    <el-card class="filter-container">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="部门">
          <el-select v-model="filterForm.department" placeholder="全部部门" clearable>
            <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务">
          <el-select v-model="filterForm.taskId" placeholder="全部任务" clearable>
            <el-option v-for="task in tasks" :key="task.id" :label="task.title" :value="task.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="完成状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
            <el-option label="未完成" value="incomplete" />
            <el-option label="已完成" value="completed" />
            <el-option label="逾期" value="overdue" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="filterForm.username" placeholder="用户名/姓名" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-icon pending-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-title">总任务数</div>
          <div class="stat-number">{{ stats.total }}</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon completed-icon">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-title">已完成</div>
          <div class="stat-number">{{ stats.completed }}</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon progress-icon">
          <el-icon><Loading /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-title">进行中</div>
          <div class="stat-number">{{ stats.inProgress }}</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon overdue-icon">
          <el-icon><WarningFilled /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-title">已逾期</div>
          <div class="stat-number">{{ stats.overdue }}</div>
        </div>
      </el-card>
    </div>

    <!-- 任务完成情况表格 -->
    <el-card>
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      <div v-else>
        <el-table
          :data="taskProgressList"
          style="width: 100%"
          border
          v-loading="loading"
        >
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="realName" label="姓名" width="120" />
          <el-table-column prop="department" label="部门" width="150" />
          <el-table-column prop="taskTitle" label="任务名称" min-width="200" />
          <el-table-column prop="deadline" label="截止日期" width="120" />
          <el-table-column label="完成情况" width="200">
            <template #default="scope">
              <el-progress
                :percentage="scope.row.progress"
                :status="getProgressStatus(scope.row)"
                :format="percentageFormat"
              />
            </template>
          </el-table-column>
          <el-table-column label="任务状态" width="100">
            <template #default="scope">
              <el-tag
                :type="getStatusType(scope.row.status)"
                effect="plain"
              >
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastStudyTime" label="最后学习时间" width="150" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="viewDetail(scope.row)"
                link
              >
                详情
              </el-button>
              <el-button
                size="small"
                type="warning"
                @click="sendReminder(scope.row)"
                :disabled="scope.row.status === 'completed'"
                link
              >
                提醒
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalItems"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 任务完成情况弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="学习任务详情"
      width="800px"
    >
      <div v-if="currentDetail">
        <div class="dialog-header">
          <h3>{{ currentDetail.taskTitle }}</h3>
          <p>{{ currentDetail.taskDescription }}</p>
        </div>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户">{{ currentDetail.realName }} ({{ currentDetail.username }})</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentDetail.department }}</el-descriptions-item>
          <el-descriptions-item label="完成进度">
            <el-progress
              :percentage="currentDetail.progress"
              :status="getProgressStatus(currentDetail)"
            />
          </el-descriptions-item>
          <el-descriptions-item label="截止日期">{{ currentDetail.deadline }}</el-descriptions-item>
          <el-descriptions-item label="任务状态">
            <el-tag :type="getStatusType(currentDetail.status)">
              {{ getStatusText(currentDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后学习时间">{{ currentDetail.lastStudyTime }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title">课程完成情况</div>
        <el-table :data="currentDetail.courses" style="width: 100%" border size="small">
          <el-table-column prop="title" label="课程" min-width="200" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="scope">
              <el-tag size="small" :type="scope.row.type === 'video' ? 'success' : 'primary'">
                {{ scope.row.type === 'video' ? '视频' : '文档' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="durationStr" label="总时长" width="100" />
          <el-table-column prop="studiedDurationStr" label="已学习" width="100" />
          <el-table-column label="完成情况" width="180">
            <template #default="scope">
              <el-progress
                :percentage="scope.row.progress"
                :status="scope.row.progress >= 100 ? 'success' : ''"
              />
            </template>
          </el-table-column>
          <el-table-column prop="lastAccessTime" label="最后访问" width="150" />
        </el-table>

        <div class="section-title">任务跟踪记录</div>
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in currentDetail.activities"
            :key="index"
            :timestamp="activity.time"
            :type="getTimelineItemType(activity.type)"
          >
            {{ activity.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  ElMessage, 
  ElMessageBox 
} from 'element-plus'
import { 
  Refresh, 
  Download, 
  Clock, 
  CircleCheck, 
  Loading, 
  WarningFilled 
} from '@element-plus/icons-vue'

// 筛选表单
const filterForm = reactive({
  department: '',
  taskId: '',
  status: '',
  username: ''
})

// 部门列表
const departments = ref([
  { id: 1, name: '研发部' },
  { id: 2, name: '市场部' },
  { id: 3, name: '销售部' },
  { id: 4, name: '人事部' },
  { id: 5, name: '财务部' }
])

// 任务列表
const tasks = ref([
  { id: 1, title: 'Vue3进阶学习' },
  { id: 2, title: 'React基础知识' },
  { id: 3, title: '前端工程化专题' },
  { id: 4, title: '移动端开发实战' }
])

// 加载状态
const loading = ref(false)

// 任务完成情况列表
const taskProgressData = ref([
  {
    id: 1,
    username: 'zhangsan',
    realName: '张三',
    department: '研发部',
    taskId: 1,
    taskTitle: 'Vue3进阶学习',
    taskDescription: '学习Vue3的Composition API、Teleport等新特性，完成相应练习',
    progress: 100,
    deadline: '2023-06-30',
    status: 'completed',
    lastStudyTime: '2023-06-25 14:30',
    courses: [
      { 
        title: 'Vue3 Composition API详解', 
        type: 'video', 
        duration: 7200, 
        durationStr: '2小时', 
        studiedDuration: 7200,
        studiedDurationStr: '2小时',
        progress: 100,
        lastAccessTime: '2023-06-20 10:15' 
      },
      { 
        title: 'Vue3 新特性实战', 
        type: 'document', 
        duration: 3600, 
        durationStr: '1小时', 
        studiedDuration: 3600,
        studiedDurationStr: '1小时',
        progress: 100,
        lastAccessTime: '2023-06-25 14:30' 
      }
    ],
    activities: [
      { type: 'assign', time: '2023-06-01 09:00', content: '任务已分配' },
      { type: 'start', time: '2023-06-10 10:30', content: '开始学习课程《Vue3 Composition API详解》' },
      { type: 'progress', time: '2023-06-15 14:20', content: '完成课程《Vue3 Composition API详解》' },
      { type: 'progress', time: '2023-06-20 16:45', content: '开始学习课程《Vue3 新特性实战》' },
      { type: 'complete', time: '2023-06-25 14:30', content: '完成全部学习任务' }
    ]
  },
  {
    id: 2,
    username: 'lisi',
    realName: '李四',
    department: '研发部',
    taskId: 1,
    taskTitle: 'Vue3进阶学习',
    taskDescription: '学习Vue3的Composition API、Teleport等新特性，完成相应练习',
    progress: 65,
    deadline: '2023-06-30',
    status: 'incomplete',
    lastStudyTime: '2023-06-28 09:45',
    courses: [
      { 
        title: 'Vue3 Composition API详解', 
        type: 'video', 
        duration: 7200, 
        durationStr: '2小时', 
        studiedDuration: 6000,
        studiedDurationStr: '1小时40分',
        progress: 83,
        lastAccessTime: '2023-06-28 09:45' 
      },
      { 
        title: 'Vue3 新特性实战', 
        type: 'document', 
        duration: 3600, 
        durationStr: '1小时', 
        studiedDuration: 1440,
        studiedDurationStr: '24分钟',
        progress: 40,
        lastAccessTime: '2023-06-27 16:20' 
      }
    ],
    activities: [
      { type: 'assign', time: '2023-06-01 09:00', content: '任务已分配' },
      { type: 'start', time: '2023-06-12 11:20', content: '开始学习课程《Vue3 Composition API详解》' },
      { type: 'progress', time: '2023-06-20 15:10', content: '学习进度达到50%' },
      { type: 'progress', time: '2023-06-27 16:20', content: '开始学习课程《Vue3 新特性实战》' },
      { type: 'reminder', time: '2023-06-29 10:00', content: '系统发送任务即将到期提醒' }
    ]
  },
  {
    id: 3,
    username: 'wangwu',
    realName: '王五',
    department: '市场部',
    taskId: 2,
    taskTitle: 'React基础知识',
    taskDescription: '学习React的基础知识，包括JSX、组件、状态管理等',
    progress: 30,
    deadline: '2023-06-15',
    status: 'overdue',
    lastStudyTime: '2023-06-10 16:25',
    courses: [
      { 
        title: 'React入门基础', 
        type: 'video', 
        duration: 5400, 
        durationStr: '1小时30分', 
        studiedDuration: 2700,
        studiedDurationStr: '45分钟',
        progress: 50,
        lastAccessTime: '2023-06-10 16:25' 
      },
      { 
        title: 'React Hooks详解', 
        type: 'video', 
        duration: 3600, 
        durationStr: '1小时', 
        studiedDuration: 360,
        studiedDurationStr: '6分钟',
        progress: 10,
        lastAccessTime: '2023-06-08 11:20' 
      }
    ],
    activities: [
      { type: 'assign', time: '2023-06-01 09:00', content: '任务已分配' },
      { type: 'start', time: '2023-06-05 14:20', content: '开始学习课程《React入门基础》' },
      { type: 'progress', time: '2023-06-08 11:20', content: '开始学习课程《React Hooks详解》' },
      { type: 'reminder', time: '2023-06-14 10:00', content: '系统发送任务即将到期提醒' },
      { type: 'overdue', time: '2023-06-15 00:00', content: '任务已逾期' },
      { type: 'reminder', time: '2023-06-20 10:00', content: '管理员发送学习提醒' }
    ]
  },
  {
    id: 4,
    username: 'zhaoliu',
    realName: '赵六',
    department: '研发部',
    taskId: 3,
    taskTitle: '前端工程化专题',
    taskDescription: '学习前端工程化相关知识，包括Webpack、Vite、CI/CD等',
    progress: 50,
    deadline: '2023-07-15',
    status: 'incomplete',
    lastStudyTime: '2023-06-29 11:40',
    courses: [
      { 
        title: 'Webpack基础到高级', 
        type: 'video', 
        duration: 7200, 
        durationStr: '2小时', 
        studiedDuration: 7200,
        studiedDurationStr: '2小时',
        progress: 100,
        lastAccessTime: '2023-06-25 16:30' 
      },
      { 
        title: 'Vite入门指南', 
        type: 'document', 
        duration: 3600, 
        durationStr: '1小时', 
        studiedDuration: 1800,
        studiedDurationStr: '30分钟',
        progress: 50,
        lastAccessTime: '2023-06-29 11:40' 
      },
      { 
        title: '前端CI/CD实践', 
        type: 'video', 
        duration: 5400, 
        durationStr: '1小时30分', 
        studiedDuration: 0,
        studiedDurationStr: '0分钟',
        progress: 0,
        lastAccessTime: '-' 
      }
    ],
    activities: [
      { type: 'assign', time: '2023-06-15 09:00', content: '任务已分配' },
      { type: 'start', time: '2023-06-18 10:30', content: '开始学习课程《Webpack基础到高级》' },
      { type: 'progress', time: '2023-06-25 16:30', content: '完成课程《Webpack基础到高级》' },
      { type: 'progress', time: '2023-06-27 14:20', content: '开始学习课程《Vite入门指南》' }
    ]
  },
  {
    id: 5,
    username: 'sunqi',
    realName: '孙七',
    department: '销售部',
    taskId: 4,
    taskTitle: '移动端开发实战',
    taskDescription: '学习移动端开发相关知识，包括响应式设计、移动端适配等',
    progress: 0,
    deadline: '2023-07-30',
    status: 'incomplete',
    lastStudyTime: '-',
    courses: [
      { 
        title: '响应式设计原理', 
        type: 'video', 
        duration: 5400, 
        durationStr: '1小时30分', 
        studiedDuration: 0,
        studiedDurationStr: '0分钟',
        progress: 0,
        lastAccessTime: '-' 
      },
      { 
        title: '移动端适配实战', 
        type: 'document', 
        duration: 3600, 
        durationStr: '1小时', 
        studiedDuration: 0,
        studiedDurationStr: '0分钟',
        progress: 0,
        lastAccessTime: '-' 
      }
    ],
    activities: [
      { type: 'assign', time: '2023-06-20 09:00', content: '任务已分配' }
    ]
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(taskProgressData.value.length)

// 筛选后的任务列表
const taskProgressList = computed(() => {
  let result = [...taskProgressData.value]
  
  // 部门筛选
  if (filterForm.department) {
    const deptName = departments.value.find(d => d.id === filterForm.department)?.name
    result = result.filter(item => item.department === deptName)
  }
  
  // 任务筛选
  if (filterForm.taskId) {
    result = result.filter(item => item.taskId === filterForm.taskId)
  }
  
  // 状态筛选
  if (filterForm.status) {
    result = result.filter(item => item.status === filterForm.status)
  }
  
  // 用户名筛选
  if (filterForm.username) {
    const keyword = filterForm.username.toLowerCase()
    result = result.filter(item => 
      item.username.toLowerCase().includes(keyword) || 
      item.realName.toLowerCase().includes(keyword)
    )
  }

  // 更新总条数
  totalItems.value = result.length
  
  // 分页处理
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  
  return result.slice(start, end)
})

// 统计数据
const stats = computed(() => {
  const filteredData = taskProgressList.value
  return {
    total: totalItems.value,
    completed: taskProgressData.value.filter(item => item.status === 'completed').length,
    inProgress: taskProgressData.value.filter(item => item.status === 'incomplete').length,
    overdue: taskProgressData.value.filter(item => item.status === 'overdue').length
  }
})

// 详情弹窗
const detailDialogVisible = ref(false)
const currentDetail = ref(null)

// 页面加载
onMounted(() => {
  loadData()
})

// 加载数据
const loadData = () => {
  loading.value = true
  // 模拟API请求
  setTimeout(() => {
    loading.value = false
  }, 800)
}

// 刷新数据
const refreshData = () => {
  loadData()
  ElMessage.success('数据已刷新')
}

// 导出CSV
const exportToCsv = () => {
  ElMessage.success('学习任务完成情况数据已导出')
}

// 处理筛选
const handleFilter = () => {
  currentPage.value = 1
  // 筛选由计算属性自动处理
}

// 重置筛选
const resetFilter = () => {
  filterForm.department = ''
  filterForm.taskId = ''
  filterForm.status = ''
  filterForm.username = ''
  currentPage.value = 1
}

// 查看详情
const viewDetail = (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true
}

// 发送提醒
const sendReminder = (row) => {
  ElMessageBox.confirm(
    `确定要向 ${row.realName} 发送学习提醒吗？`,
    '发送提醒',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    ElMessage.success(`已向 ${row.realName} 发送学习提醒`)
  }).catch(() => {})
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
}

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 获取进度状态
const getProgressStatus = (row) => {
  if (row.status === 'completed') return 'success'
  if (row.status === 'overdue') return 'exception'
  return ''
}

// 获取状态类型
const getStatusType = (status) => {
  const map = {
    'completed': 'success',
    'incomplete': 'info',
    'overdue': 'danger'
  }
  return map[status] || 'info'
}

// 获取状态文字
const getStatusText = (status) => {
  const map = {
    'completed': '已完成',
    'incomplete': '进行中',
    'overdue': '已逾期'
  }
  return map[status] || '未知'
}

// 进度格式化
const percentageFormat = (percentage) => {
  return `${percentage}%`
}

// 获取时间线状态类型
const getTimelineItemType = (type) => {
  const map = {
    'assign': 'primary',
    'start': 'info',
    'progress': '',
    'complete': 'success',
    'reminder': 'warning',
    'overdue': 'danger'
  }
  return map[type] || ''
}
</script>

<style scoped>
.task-progress-container {
  padding: 0;
}

.page-header {
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0;
  font-size: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-container {
  margin-bottom: 16px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  margin-right: 16px;
  color: white;
  font-size: 24px;
}

.pending-icon {
  background-color: #909399;
}

.completed-icon {
  background-color: #67c23a;
}

.progress-icon {
  background-color: #409eff;
}

.overdue-icon {
  background-color: #f56c6c;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.loading-container {
  padding: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-header {
  margin-bottom: 20px;
}

.dialog-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.dialog-header p {
  margin: 0;
  color: #606266;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 24px 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style> 