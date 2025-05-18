<template>
  <AdminLayout title="定时任务">
    <template #actions>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增任务
      </el-button>
      <el-button @click="handleRefresh">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
    </template>
    
    <!-- 搜索区域 -->
    <el-card class="filter-container">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="任务名称">
          <el-input v-model="searchForm.name" placeholder="请输入任务名称" clearable />
        </el-form-item>
        <el-form-item label="任务类型">
          <el-select v-model="searchForm.type" placeholder="请选择任务类型" clearable>
            <el-option label="系统任务" value="system" />
            <el-option label="业务任务" value="business" />
            <el-option label="数据任务" value="data" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" value="normal" />
            <el-option label="暂停" value="paused" />
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
      <el-tabs v-model="activeTab">
        <el-tab-pane label="任务列表" name="tasks">
          <el-table
            v-loading="loading"
            :data="taskList"
            border
            style="width: 100%"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="任务ID" width="80" />
            <el-table-column prop="name" label="任务名称" min-width="120" />
            <el-table-column prop="type" label="任务类型" width="100">
              <template #default="scope">
                <el-tag v-if="scope.row.type === 'system'" type="danger">系统任务</el-tag>
                <el-tag v-else-if="scope.row.type === 'business'" type="success">业务任务</el-tag>
                <el-tag v-else-if="scope.row.type === 'data'" type="warning">数据任务</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="cron" label="cron表达式" width="140" />
            <el-table-column prop="target" label="调用目标" min-width="180" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'normal' ? 'success' : 'info'">
                  {{ scope.row.status === 'normal' ? '正常' : '暂停' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="nextTime" label="下次执行时间" width="160" />
            <el-table-column label="操作" width="300" fixed="right">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button 
                  link 
                  :type="scope.row.status === 'normal' ? 'warning' : 'success'" 
                  size="small" 
                  @click="handleToggleStatus(scope.row)"
                >
                  {{ scope.row.status === 'normal' ? '暂停' : '恢复' }}
                </el-button>
                <el-button link type="primary" size="small" @click="handleRunOnce(scope.row)">执行一次</el-button>
                <el-button link type="primary" size="small" @click="viewLog(scope.row)">执行日志</el-button>
                <el-button 
                  link 
                  type="danger" 
                  size="small" 
                  @click="handleDelete(scope.row)"
                  :disabled="scope.row.type === 'system'"
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
        </el-tab-pane>
        <el-tab-pane label="执行日志" name="logs">
          <div class="log-filter">
            <el-form :inline="true" :model="logSearchForm">
              <el-form-item label="任务名称">
                <el-input v-model="logSearchForm.taskName" placeholder="请输入任务名称" clearable />
              </el-form-item>
              <el-form-item label="执行状态">
                <el-select v-model="logSearchForm.status" placeholder="请选择状态" clearable>
                  <el-option label="成功" value="success" />
                  <el-option label="失败" value="fail" />
                </el-select>
              </el-form-item>
              <el-form-item label="执行时间">
                <el-date-picker
                  v-model="logSearchForm.timeRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchLogs">查询</el-button>
                <el-button @click="resetLogSearch">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-table
            v-loading="logLoading"
            :data="logList"
            border
            style="width: 100%"
          >
            <el-table-column prop="id" label="日志ID" width="80" />
            <el-table-column prop="taskName" label="任务名称" min-width="120" />
            <el-table-column prop="startTime" label="开始时间" width="160" />
            <el-table-column prop="endTime" label="结束时间" width="160" />
            <el-table-column prop="duration" label="耗时" width="100">
              <template #default="scope">
                {{ scope.row.duration }} 毫秒
              </template>
            </el-table-column>
            <el-table-column prop="status" label="执行状态" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
                  {{ scope.row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="result" label="执行结果" min-width="200" show-overflow-tooltip />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="viewLogDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 日志分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="logCurrentPage"
              v-model:page-size="logPageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="logTotal"
              @size-change="handleLogSizeChange"
              @current-change="handleLogCurrentChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 任务表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formType === 'add' ? '新增任务' : '编辑任务'"
      width="600px"
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
            <el-option label="业务任务" value="business" />
            <el-option label="数据任务" value="data" />
          </el-select>
        </el-form-item>
        <el-form-item label="调用目标" prop="target">
          <el-input v-model="taskForm.target" placeholder="请输入调用目标，例如：system.updateCache">
            <template #append>
              <el-tooltip content="请填写任务执行的目标方法，格式：包名.方法名">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="cron表达式" prop="cron">
          <el-input v-model="taskForm.cron" placeholder="请输入cron表达式，例如：0 0 12 * * ?">
            <template #append>
              <el-tooltip content="cron表达式格式：秒 分 时 日 月 周">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="任务参数" prop="params">
          <el-input v-model="taskForm.params" type="textarea" :rows="3" placeholder="请输入任务参数，JSON格式" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="taskForm.status">
            <el-radio label="normal">正常</el-radio>
            <el-radio label="paused">暂停</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="taskForm.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="logDetailVisible"
      title="执行日志详情"
      width="800px"
    >
      <div v-if="currentLog">
        <el-descriptions bordered :column="2">
          <el-descriptions-item label="任务名称" :span="2">{{ currentLog.taskName }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ currentLog.startTime }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ currentLog.endTime }}</el-descriptions-item>
          <el-descriptions-item label="执行耗时">{{ currentLog.duration }} 毫秒</el-descriptions-item>
          <el-descriptions-item label="执行状态">
            <el-tag :type="currentLog.status === 'success' ? 'success' : 'danger'">
              {{ currentLog.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="执行结果" :span="2">{{ currentLog.result }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="currentLog.exception" class="log-exception">
          <p class="exception-title">异常信息：</p>
          <el-scrollbar height="250px">
            <pre class="exception-content">{{ currentLog.exception }}</pre>
          </el-scrollbar>
        </div>
      </div>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Refresh, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import AdminLayout from './Layout.vue'

// 选项卡
const activeTab = ref('tasks')

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: ''
})

// 任务列表
const loading = ref(false)
const taskList = ref([
  {
    id: 1,
    name: '系统缓存更新',
    type: 'system',
    cron: '0 0 */1 * * ?',
    target: 'system.updateCache',
    params: '{}',
    status: 'normal',
    nextTime: '2023-06-15 12:00:00',
    remark: '每小时更新系统缓存'
  },
  {
    id: 2,
    name: '数据库备份',
    type: 'system',
    cron: '0 0 2 * * ?',
    target: 'system.backupDatabase',
    params: '{"type":"full"}',
    status: 'normal',
    nextTime: '2023-06-16 02:00:00',
    remark: '每天凌晨2点进行数据库备份'
  },
  {
    id: 3,
    name: '用户统计分析',
    type: 'business',
    cron: '0 0 1 * * ?',
    target: 'statistics.analyzeUserData',
    params: '{"day":1}',
    status: 'normal',
    nextTime: '2023-06-16 01:00:00',
    remark: '每天凌晨1点统计分析用户数据'
  },
  {
    id: 4,
    name: '临时数据清理',
    type: 'data',
    cron: '0 30 23 * * ?',
    target: 'system.cleanTempData',
    params: '{"days":7}',
    status: 'paused',
    nextTime: '暂停中',
    remark: '每天23:30清理7天前的临时数据'
  },
  {
    id: 5,
    name: '学习进度统计',
    type: 'business',
    cron: '0 0 3 * * ?',
    target: 'statistics.learningProgress',
    params: '{}',
    status: 'normal',
    nextTime: '2023-06-16 03:00:00',
    remark: '每天凌晨3点统计学习进度数据'
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
  type: 'business',
  target: '',
  cron: '',
  params: '',
  status: 'normal',
  remark: ''
})

// cron表达式验证
const validateCron = (rule: any, value: string, callback: any) => {
  if (!value) {
    return callback(new Error('请输入cron表达式'))
  }
  
  // 简单的cron表达式校验，实际项目中应有更严格的校验
  const pattern = /^[0-9*/,-]+\s[0-9*/,-]+\s[0-9*/,-]+\s[0-9*/,-]+\s[0-9*/,-]+\s[0-9*/,?-]*$/
  if (!pattern.test(value)) {
    return callback(new Error('cron表达式格式不正确'))
  }
  
  callback()
}

// 任务表单验证规则
const taskRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  target: [
    { required: true, message: '请输入调用目标', trigger: 'blur' }
  ],
  cron: [
    { required: true, validator: validateCron, trigger: 'blur' }
  ],
  params: [
    { 
      validator: (rule: any, value: string, callback: any) => {
        if (value) {
          try {
            JSON.parse(value)
            callback()
          } catch (error) {
            callback(new Error('请输入有效的JSON格式'))
          }
        } else {
          callback()
        }
      }, 
      trigger: 'blur'
    }
  ]
})

// 日志搜索表单
const logSearchForm = reactive({
  taskName: '',
  status: '',
  timeRange: []
})

// 日志列表
const logLoading = ref(false)
const logList = ref([
  {
    id: 1,
    taskId: 1,
    taskName: '系统缓存更新',
    startTime: '2023-06-14 12:00:00',
    endTime: '2023-06-14 12:00:02',
    duration: 2000,
    status: 'success',
    result: '缓存更新成功，更新了325个缓存项',
    exception: null
  },
  {
    id: 2,
    taskId: 2,
    taskName: '数据库备份',
    startTime: '2023-06-14 02:00:00',
    endTime: '2023-06-14 02:05:30',
    duration: 330000,
    status: 'success',
    result: '数据库备份成功，备份文件大小：1.2GB',
    exception: null
  },
  {
    id: 3,
    taskId: 3,
    taskName: '用户统计分析',
    startTime: '2023-06-14 01:00:00',
    endTime: '2023-06-14 01:01:45',
    duration: 105000,
    status: 'success',
    result: '分析完成，生成报表：user_analysis_20230614.xlsx',
    exception: null
  },
  {
    id: 4,
    taskId: 5,
    taskName: '学习进度统计',
    startTime: '2023-06-14 03:00:00',
    endTime: '2023-06-14 03:00:00',
    duration: 0,
    status: 'fail',
    result: '执行失败，详见异常信息',
    exception: 'java.lang.NullPointerException\n\tat com.example.statistics.LearningProgressService.analyze(LearningProgressService.java:45)\n\tat com.example.task.TaskExecutor.execute(TaskExecutor.java:78)\n\tat java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1128)\n\tat java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628)\n\tat java.base/java.lang.Thread.run(Thread.java:834)'
  },
  {
    id: 5,
    taskId: 1,
    taskName: '系统缓存更新',
    startTime: '2023-06-14 11:00:00',
    endTime: '2023-06-14 11:00:01',
    duration: 1000,
    status: 'success',
    result: '缓存更新成功，更新了320个缓存项',
    exception: null
  }
])

// 日志分页
const logCurrentPage = ref(1)
const logPageSize = ref(10)
const logTotal = ref(100)

// 日志详情
const logDetailVisible = ref(false)
const currentLog = ref<any>(null)

// 初始化
onMounted(() => {
  fetchTaskList()
})

// 获取任务列表
const fetchTaskList = () => {
  loading.value = true
  // 这里应该调用API获取任务列表
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 获取日志列表
const fetchLogList = () => {
  logLoading.value = true
  // 这里应该调用API获取日志列表
  setTimeout(() => {
    logLoading.value = false
  }, 500)
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

// 处理刷新
const handleRefresh = () => {
  if (activeTab.value === 'tasks') {
    fetchTaskList()
  } else {
    fetchLogList()
  }
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

// 日志分页大小变化
const handleLogSizeChange = (size: number) => {
  logPageSize.value = size
  fetchLogList()
}

// 日志页码变化
const handleLogCurrentChange = (page: number) => {
  logCurrentPage.value = page
  fetchLogList()
}

// 搜索日志
const searchLogs = () => {
  logCurrentPage.value = 1
  fetchLogList()
}

// 重置日志搜索
const resetLogSearch = () => {
  logSearchForm.taskName = ''
  logSearchForm.status = ''
  logSearchForm.timeRange = []
  searchLogs()
}

// 新增任务
const handleAdd = () => {
  formType.value = 'add'
  taskForm.id = null
  taskForm.name = ''
  taskForm.type = 'business'
  taskForm.target = ''
  taskForm.cron = ''
  taskForm.params = '{}'
  taskForm.status = 'normal'
  taskForm.remark = ''
  dialogVisible.value = true
}

// 编辑任务
const handleEdit = (row: any) => {
  formType.value = 'edit'
  Object.assign(taskForm, row)
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!taskFormRef.value) return
  
  await taskFormRef.value.validate(async (valid) => {
    if (valid) {
      // 这里应该调用API保存任务
      console.log('保存任务:', taskForm)
      
      if (!taskForm.id) {
        // 新增
        const newTask = { 
          ...taskForm, 
          id: Date.now(),
          nextTime: taskForm.status === 'normal' ? '2023-06-16 00:00:00' : '暂停中'
        }
        taskList.value.unshift(newTask)
        ElMessage.success('任务创建成功')
      } else {
        // 编辑
        const index = taskList.value.findIndex(item => item.id === taskForm.id)
        if (index !== -1) {
          const updatedTask = { 
            ...taskList.value[index], 
            ...taskForm,
            nextTime: taskForm.status === 'normal' ? taskList.value[index].nextTime : '暂停中'
          }
          taskList.value[index] = updatedTask
        }
        ElMessage.success('任务更新成功')
      }
      
      dialogVisible.value = false
    }
  })
}

// 切换任务状态
const handleToggleStatus = (row: any) => {
  const action = row.status === 'normal' ? '暂停' : '恢复'
  
  ElMessageBox.confirm(
    `确定要${action}任务"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API更新任务状态
    row.status = row.status === 'normal' ? 'paused' : 'normal'
    row.nextTime = row.status === 'normal' ? '2023-06-16 00:00:00' : '暂停中'
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

// 执行一次
const handleRunOnce = (row: any) => {
  ElMessageBox.confirm(
    `确定要立即执行一次任务"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API立即执行任务
    ElMessage.success('任务执行命令已发送，请稍后查看执行日志')
    
    // 模拟添加一条日志
    setTimeout(() => {
      const now = new Date()
      const endTime = new Date(now.getTime() + 2000)
      
      const newLog = {
        id: Date.now(),
        taskId: row.id,
        taskName: row.name,
        startTime: now.toLocaleString(),
        endTime: endTime.toLocaleString(),
        duration: 2000,
        status: 'success',
        result: '手动触发执行成功',
        exception: null
      }
      
      logList.value.unshift(newLog)
      
      if (activeTab.value !== 'logs') {
        ElMessage.info('任务执行完成，可前往日志选项卡查看详情')
      }
    }, 2000)
  }).catch(() => {})
}

// 删除任务
const handleDelete = (row: any) => {
  if (row.type === 'system') {
    ElMessage.warning('系统任务不允许删除')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除任务"${row.name}"吗？删除后将无法恢复！`,
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

// 查看日志
const viewLog = (row: any) => {
  activeTab.value = 'logs'
  logSearchForm.taskName = row.name
  searchLogs()
}

// 查看日志详情
const viewLogDetail = (row: any) => {
  currentLog.value = row
  logDetailVisible.value = true
}
</script>

<style scoped>
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

.log-filter {
  margin-bottom: 16px;
}

.log-exception {
  margin-top: 20px;
}

.exception-title {
  font-weight: bold;
  color: #f56c6c;
  margin-bottom: 10px;
}

.exception-content {
  background-color: #f8f8f8;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  color: #f56c6c;
  white-space: pre-wrap;
  word-break: break-all;
}
</style> 