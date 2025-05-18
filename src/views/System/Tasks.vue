<template>
  <div class="learning-tasks-container">
    <el-card class="page-header">
      <div class="header-content">
        <h2>制定学习任务</h2>
        <el-button type="primary" @click="handleCreateTask">新建学习任务</el-button>
      </div>
    </el-card>

    <!-- 搜索区域 -->
    <el-card class="filter-container">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="任务名称">
          <el-input v-model="searchForm.name" placeholder="请输入任务名称" clearable />
        </el-form-item>
        <el-form-item label="任务类型">
          <el-select v-model="searchForm.type" placeholder="请选择任务类型" clearable>
            <el-option label="必修课" value="required" />
            <el-option label="选修课" value="elective" />
            <el-option label="阶段考核" value="assessment" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="未开始" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已结束" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-container">
      <el-table
        v-loading="loading"
        :data="taskList"
        border
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="任务名称" min-width="120" />
        <el-table-column prop="type" label="任务类型" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.type === 'required'" type="danger">必修课</el-tag>
            <el-tag v-else-if="scope.row.type === 'elective'" type="success">选修课</el-tag>
            <el-tag v-else-if="scope.row.type === 'assessment'" type="warning">阶段考核</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="140" />
        <el-table-column prop="endTime" label="结束时间" width="140" />
        <el-table-column prop="courseCount" label="课程数量" width="100" />
        <el-table-column prop="assigneeCount" label="指派人数" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 'pending'" type="info">未开始</el-tag>
            <el-tag v-else-if="scope.row.status === 'in_progress'" type="success">进行中</el-tag>
            <el-tag v-else-if="scope.row.status === 'completed'" type="warning">已结束</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEditTask(scope.row)">编辑</el-button>
            <el-button link type="primary" size="small" @click="handleAssign(scope.row)">指派人员</el-button>
            <el-button link type="primary" size="small" @click="handleDetail(scope.row)">查看详情</el-button>
            <el-button link type="primary" size="small" @click="handleNotify(scope.row)">通知</el-button>
            <el-button 
              link 
              type="danger" 
              size="small" 
              @click="handleDeleteTask(scope.row)"
              :disabled="scope.row.status === 'in_progress'"
            >
              删除
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
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 学习任务表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formType === 'add' ? '新建学习任务' : '编辑学习任务'"
      width="650px"
    >
      <el-form
        ref="taskFormRef"
        :model="taskForm"
        :rules="taskRules"
        label-width="120px"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务类型" prop="type">
          <el-select v-model="taskForm.type" placeholder="请选择任务类型">
            <el-option label="必修课" value="required" />
            <el-option label="选修课" value="elective" />
            <el-option label="阶段考核" value="assessment" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务时间" prop="timeRange">
          <el-date-picker
            v-model="taskForm.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="通过条件" prop="passCriteria">
          <el-select v-model="taskForm.passCriteria" placeholder="请选择通过条件">
            <el-option label="全部完成" value="all" />
            <el-option label="完成指定比例" value="percentage" />
            <el-option label="累计学习时长" value="duration" />
            <el-option label="考核通过" value="examination" />
          </el-select>
        </el-form-item>
        <el-form-item label="通过阈值" prop="passThreshold" v-if="taskForm.passCriteria !== 'all'">
          <div class="threshold-input">
            <el-input-number 
              v-model="taskForm.passThreshold" 
              :min="1" 
              :max="taskForm.passCriteria === 'percentage' ? 100 : 999"
            />
            <span class="threshold-unit">
              {{ taskForm.passCriteria === 'percentage' ? '%' : taskForm.passCriteria === 'duration' ? '小时' : '分' }}
            </span>
          </div>
        </el-form-item>
        <el-form-item label="选择课程" prop="courses">
          <el-select
            v-model="taskForm.courses"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择课程"
            style="width: 100%"
          >
            <el-option
              v-for="course in availableCourses"
              :key="course.id"
              :label="course.title"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="taskForm.status">
            <el-radio label="pending">未开始</el-radio>
            <el-radio label="in_progress">进行中</el-radio>
            <el-radio label="completed">已结束</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="任务说明" prop="description">
          <el-input type="textarea" v-model="taskForm.description" :rows="3" placeholder="请输入任务说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 指派人员对话框 -->
    <el-dialog
      v-model="assignDialogVisible"
      title="指派学习任务"
      width="800px"
    >
      <div class="assign-container">
        <div class="assign-header">
          <h3>任务：{{ currentTask?.name }}</h3>
          <p>{{ currentTask?.description }}</p>
        </div>
        
        <el-divider content-position="center">选择指派对象</el-divider>
        
        <el-tabs v-model="assignTab">
          <el-tab-pane label="按部门指派" name="department">
            <el-transfer
              v-model="selectedDepartments"
              :data="departmentList"
              :titles="['可选部门', '已选部门']"
              filterable
            />
          </el-tab-pane>
          <el-tab-pane label="按人员指派" name="user">
            <div class="user-search">
              <el-input
                v-model="userSearchKeyword"
                placeholder="搜索用户"
                prefix-icon="Search"
                clearable
              />
            </div>
            <el-table
              ref="userTableRef"
              :data="filteredUserList"
              height="300"
              @selection-change="handleUserSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="姓名" width="120" />
              <el-table-column prop="department" label="部门" />
              <el-table-column prop="position" label="职位" />
              <el-table-column prop="email" label="邮箱" />
            </el-table>
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="userCurrentPage"
                v-model:page-size="userPageSize"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next"
                :total="userTotal"
                @size-change="handleUserSizeChange"
                @current-change="handleUserCurrentChange"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="assignDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAssign">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: ''
})

// 学习任务列表
const loading = ref(false)
const taskList = ref([
  {
    id: 1,
    name: '前端开发基础培训',
    type: 'required',
    startTime: '2023-06-01',
    endTime: '2023-06-30',
    courseCount: 5,
    assigneeCount: 25,
    status: 'in_progress',
    description: '针对新入职员工的前端开发技术培训，内容包括HTML、CSS和JavaScript基础',
    passCriteria: 'all'
  },
  {
    id: 2,
    name: 'Vue3进阶课程',
    type: 'elective',
    startTime: '2023-06-15',
    endTime: '2023-07-15',
    courseCount: 3,
    assigneeCount: 15,
    status: 'pending',
    description: 'Vue3框架进阶学习，包含Composition API、TypeScript集成等内容',
    passCriteria: 'percentage',
    passThreshold: 80
  },
  {
    id: 3,
    name: '前端技术季度考核',
    type: 'assessment',
    startTime: '2023-06-25',
    endTime: '2023-06-30',
    courseCount: 1,
    assigneeCount: 30,
    status: 'pending',
    description: '前端开发团队季度技术考核，考察HTML、CSS、JavaScript和Vue框架等知识',
    passCriteria: 'examination',
    passThreshold: 60
  },
  {
    id: 4,
    name: '前端性能优化专题',
    type: 'elective',
    startTime: '2023-05-01',
    endTime: '2023-05-31',
    courseCount: 4,
    assigneeCount: 18,
    status: 'completed',
    description: '前端性能优化专题培训，包含网络优化、渲染优化、代码优化等内容',
    passCriteria: 'duration',
    passThreshold: 10
  }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 任务表单
const formType = ref('add')
const dialogVisible = ref(false)
const taskFormRef = ref<FormInstance>()
const taskForm = reactive({
  id: null,
  name: '',
  type: 'required',
  timeRange: [],
  courses: [],
  passCriteria: 'all',
  passThreshold: 80,
  status: 'pending',
  description: ''
})

// 课程列表
const availableCourses = ref([
  { id: 1, title: 'HTML5基础教程' },
  { id: 2, title: 'CSS3高级应用' },
  { id: 3, title: 'JavaScript核心概念' },
  { id: 4, title: 'Vue3入门到精通' },
  { id: 5, title: 'React基础与实战' },
  { id: 6, title: '前端工程化实践' },
  { id: 7, title: '移动端开发技巧' },
  { id: 8, title: '前端性能优化' },
  { id: 9, title: 'TypeScript实战' },
  { id: 10, title: '前端安全最佳实践' }
])

// 验证规则
const taskRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  timeRange: [
    { required: true, message: '请选择任务时间', trigger: 'change' }
  ],
  passCriteria: [
    { required: true, message: '请选择通过条件', trigger: 'change' }
  ],
  courses: [
    { required: true, message: '请选择至少一个课程', trigger: 'change' },
    { type: 'array', min: 1, message: '请选择至少一个课程', trigger: 'change' }
  ]
})

// 指派对话框
const assignDialogVisible = ref(false)
const currentTask = ref<any>(null)
const assignTab = ref('department')

// 部门列表
const departmentList = ref([
  { key: 1, label: '技术部' },
  { key: 2, label: '产品部' },
  { key: 3, label: '设计部' },
  { key: 4, label: '市场部' },
  { key: 5, label: '销售部' },
  { key: 6, label: '行政部' }
])
const selectedDepartments = ref<number[]>([])

// 用户列表
const userList = ref([
  { id: 1, name: '张三', department: '技术部', position: '前端开发', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', department: '技术部', position: '后端开发', email: 'lisi@example.com' },
  { id: 3, name: '王五', department: '产品部', position: '产品经理', email: 'wangwu@example.com' },
  { id: 4, name: '赵六', department: '设计部', position: 'UI设计师', email: 'zhaoliu@example.com' },
  { id: 5, name: '钱七', department: '技术部', position: '测试工程师', email: 'qianqi@example.com' }
])
const userSearchKeyword = ref('')
const userCurrentPage = ref(1)
const userPageSize = ref(10)
const userTotal = ref(100)
const selectedUsers = ref<any[]>([])

// 过滤后的用户列表
const filteredUserList = computed(() => {
  if (!userSearchKeyword.value) return userList.value
  
  return userList.value.filter(user => 
    user.name.includes(userSearchKeyword.value) || 
    user.department.includes(userSearchKeyword.value) ||
    user.position.includes(userSearchKeyword.value) ||
    user.email.includes(userSearchKeyword.value)
  )
})

// 处理用户选择变化
const handleUserSelectionChange = (selection: any[]) => {
  selectedUsers.value = selection
}

// 用户分页变化
const handleUserSizeChange = (size: number) => {
  userPageSize.value = size
}

const handleUserCurrentChange = (page: number) => {
  userCurrentPage.value = page
}

// 处理查询
const handleSearch = () => {
  currentPage.value = 1
  fetchTaskList()
}

// 重置查询
const resetSearch = () => {
  searchForm.name = ''
  searchForm.type = ''
  searchForm.status = ''
  handleSearch()
}

// 获取任务列表
const fetchTaskList = () => {
  loading.value = true
  // 这里应该调用API获取任务列表
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchTaskList()
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchTaskList()
}

// 新建任务
const handleCreateTask = () => {
  formType.value = 'add'
  taskForm.id = null
  taskForm.name = ''
  taskForm.type = 'required'
  taskForm.timeRange = []
  taskForm.courses = []
  taskForm.passCriteria = 'all'
  taskForm.passThreshold = 80
  taskForm.status = 'pending'
  taskForm.description = ''
  dialogVisible.value = true
}

// 编辑任务
const handleEditTask = (row: any) => {
  formType.value = 'edit'
  taskForm.id = row.id
  taskForm.name = row.name
  taskForm.type = row.type
  taskForm.timeRange = [row.startTime, row.endTime]
  taskForm.courses = [] // 这里应该获取实际的课程ID
  taskForm.passCriteria = row.passCriteria
  taskForm.passThreshold = row.passThreshold || 80
  taskForm.status = row.status
  taskForm.description = row.description
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!taskFormRef.value) return
  
  await taskFormRef.value.validate((valid) => {
    if (valid) {
      // 处理日期
      const startTime = taskForm.timeRange[0] instanceof Date 
        ? taskForm.timeRange[0].toISOString().split('T')[0]
        : taskForm.timeRange[0]
      
      const endTime = taskForm.timeRange[1] instanceof Date 
        ? taskForm.timeRange[1].toISOString().split('T')[0]
        : taskForm.timeRange[1]
      
      // 这里应该调用API保存任务
      if (!taskForm.id) {
        // 新建
        const newTask = {
          id: Date.now(),
          name: taskForm.name,
          type: taskForm.type,
          startTime,
          endTime,
          courseCount: taskForm.courses.length,
          assigneeCount: 0,
          status: taskForm.status,
          description: taskForm.description,
          passCriteria: taskForm.passCriteria,
          passThreshold: taskForm.passThreshold
        }
        
        taskList.value.unshift(newTask)
        ElMessage.success('任务创建成功')
      } else {
        // 编辑
        const index = taskList.value.findIndex(item => item.id === taskForm.id)
        if (index !== -1) {
          taskList.value[index] = {
            ...taskList.value[index],
            name: taskForm.name,
            type: taskForm.type,
            startTime,
            endTime,
            courseCount: taskForm.courses.length,
            status: taskForm.status,
            description: taskForm.description,
            passCriteria: taskForm.passCriteria,
            passThreshold: taskForm.passThreshold
          }
        }
        ElMessage.success('任务更新成功')
      }
      
      dialogVisible.value = false
    }
  })
}

// 指派人员
const handleAssign = (row: any) => {
  currentTask.value = row
  assignDialogVisible.value = true
  selectedDepartments.value = []
  selectedUsers.value = []
  
  // 实际项目中，这里应该获取已指派的部门和人员
}

// 提交指派
const submitAssign = () => {
  // 根据当前选择的分配方式处理
  if (assignTab.value === 'department') {
    // 按部门指派
    if (selectedDepartments.value.length === 0) {
      ElMessage.warning('请至少选择一个部门')
      return
    }
    
    // 这里应该调用API保存部门分配
    ElMessage.success(`成功将任务"${currentTask.value.name}"指派给${selectedDepartments.value.length}个部门`)
  } else {
    // 按人员指派
    if (selectedUsers.value.length === 0) {
      ElMessage.warning('请至少选择一个人员')
      return
    }
    
    // 这里应该调用API保存人员分配
    ElMessage.success(`成功将任务"${currentTask.value.name}"指派给${selectedUsers.value.length}名人员`)
  }
  
  // 更新任务的指派人数（实际项目中这个值应该从后端获取）
  const index = taskList.value.findIndex(item => item.id === currentTask.value.id)
  if (index !== -1) {
    if (assignTab.value === 'department') {
      // 假设每个部门平均10人
      taskList.value[index].assigneeCount = selectedDepartments.value.length * 10
    } else {
      taskList.value[index].assigneeCount = selectedUsers.value.length
    }
  }
  
  assignDialogVisible.value = false
}

// 查看详情
const handleDetail = (row: any) => {
  ElMessage.info(`查看任务"${row.name}"的详情`)
  // 实际项目中，这里应该跳转到任务详情页面
}

// 发送通知
const handleNotify = (row: any) => {
  ElMessageBox.confirm(
    `确定要向所有指派的人员发送"${row.name}"任务的通知吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    // 这里应该调用API发送通知
    ElMessage.success(`通知已发送给${row.assigneeCount}名人员`)
  }).catch(() => {})
}

// 删除任务
const handleDeleteTask = (row: any) => {
  if (row.status === 'in_progress') {
    ElMessage.warning('进行中的任务不允许删除')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除任务"${row.name}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API删除任务
    taskList.value = taskList.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.learning-tasks-container {
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

.filter-container {
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.table-container {
  margin-bottom: 16px;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  text-align: right;
}

.threshold-input {
  display: flex;
  align-items: center;
}

.threshold-unit {
  margin-left: 8px;
  color: #606266;
}

.assign-container {
  padding: 0 20px;
}

.assign-header {
  margin-bottom: 20px;
}

.assign-header h3 {
  margin-top: 0;
  margin-bottom: 8px;
}

.assign-header p {
  color: #606266;
  margin: 0;
}

.user-search {
  margin-bottom: 15px;
}
</style> 