<template>
  <AdminLayout title="数据同步">
    <template #actions>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增同步任务
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
        <el-form-item label="数据类型">
          <el-select v-model="searchForm.dataType" placeholder="请选择数据类型" clearable>
            <el-option label="用户数据" value="user" />
            <el-option label="学习数据" value="learning" />
            <el-option label="系统数据" value="system" />
            <el-option label="内容数据" value="content" />
          </el-select>
        </el-form-item>
        <el-form-item label="同步状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="已启用" value="enabled" />
            <el-option label="已禁用" value="disabled" />
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
        <el-tab-pane label="同步任务" name="tasks">
          <el-table
            v-loading="loading"
            :data="syncTaskList"
            border
            style="width: 100%"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="任务名称" min-width="120" />
            <el-table-column prop="dataType" label="数据类型" width="100">
              <template #default="scope">
                <el-tag v-if="scope.row.dataType === 'user'" type="success">用户数据</el-tag>
                <el-tag v-else-if="scope.row.dataType === 'learning'" type="warning">学习数据</el-tag>
                <el-tag v-else-if="scope.row.dataType === 'system'" type="danger">系统数据</el-tag>
                <el-tag v-else-if="scope.row.dataType === 'content'" type="info">内容数据</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sourceSystem" label="源系统" min-width="120" />
            <el-table-column prop="targetSystem" label="目标系统" min-width="120" />
            <el-table-column prop="frequency" label="同步频率" width="100" />
            <el-table-column prop="lastSync" label="上次同步时间" width="160" />
            <el-table-column prop="nextSync" label="下次同步时间" width="160" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'info'">
                  {{ scope.row.status === 'enabled' ? '已启用' : '已禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="300" fixed="right">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button 
                  link 
                  :type="scope.row.status === 'enabled' ? 'warning' : 'success'" 
                  size="small" 
                  @click="handleToggleStatus(scope.row)"
                >
                  {{ scope.row.status === 'enabled' ? '禁用' : '启用' }}
                </el-button>
                <el-button link type="primary" size="small" @click="handleSyncNow(scope.row)">立即同步</el-button>
                <el-button link type="primary" size="small" @click="viewHistory(scope.row)">同步历史</el-button>
                <el-button link type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
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
        <el-tab-pane label="同步历史" name="history">
          <div class="history-filter">
            <el-form :inline="true" :model="historySearchForm">
              <el-form-item label="任务名称">
                <el-input v-model="historySearchForm.taskName" placeholder="请输入任务名称" clearable />
              </el-form-item>
              <el-form-item label="同步状态">
                <el-select v-model="historySearchForm.result" placeholder="请选择状态" clearable>
                  <el-option label="成功" value="success" />
                  <el-option label="失败" value="fail" />
                  <el-option label="部分成功" value="partial" />
                </el-select>
              </el-form-item>
              <el-form-item label="同步时间">
                <el-date-picker
                  v-model="historySearchForm.timeRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchHistory">查询</el-button>
                <el-button @click="resetHistorySearch">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-table
            v-loading="historyLoading"
            :data="historyList"
            border
            style="width: 100%"
          >
            <el-table-column prop="id" label="记录ID" width="80" />
            <el-table-column prop="taskName" label="任务名称" min-width="120" />
            <el-table-column prop="dataType" label="数据类型" width="100">
              <template #default="scope">
                <el-tag v-if="scope.row.dataType === 'user'" type="success">用户数据</el-tag>
                <el-tag v-else-if="scope.row.dataType === 'learning'" type="warning">学习数据</el-tag>
                <el-tag v-else-if="scope.row.dataType === 'system'" type="danger">系统数据</el-tag>
                <el-tag v-else-if="scope.row.dataType === 'content'" type="info">内容数据</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="160" />
            <el-table-column prop="endTime" label="结束时间" width="160" />
            <el-table-column prop="syncCount" label="同步数量" width="100" />
            <el-table-column prop="result" label="同步结果" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.result === 'success' ? 'success' : scope.row.result === 'partial' ? 'warning' : 'danger'">
                  {{ scope.row.result === 'success' ? '成功' : scope.row.result === 'partial' ? '部分成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="结果描述" min-width="200" show-overflow-tooltip />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="viewDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 历史分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="historyCurrentPage"
              v-model:page-size="historyPageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="historyTotal"
              @size-change="handleHistorySizeChange"
              @current-change="handleHistoryCurrentChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 任务表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formType === 'add' ? '新增同步任务' : '编辑同步任务'"
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
        <el-form-item label="数据类型" prop="dataType">
          <el-select v-model="taskForm.dataType" placeholder="请选择数据类型">
            <el-option label="用户数据" value="user" />
            <el-option label="学习数据" value="learning" />
            <el-option label="系统数据" value="system" />
            <el-option label="内容数据" value="content" />
          </el-select>
        </el-form-item>
        <el-form-item label="源系统" prop="sourceSystem">
          <el-input v-model="taskForm.sourceSystem" placeholder="请输入源系统" />
        </el-form-item>
        <el-form-item label="目标系统" prop="targetSystem">
          <el-input v-model="taskForm.targetSystem" placeholder="请输入目标系统" />
        </el-form-item>
        <el-form-item label="同步方式" prop="syncType">
          <el-radio-group v-model="taskForm.syncType">
            <el-radio label="full">全量同步</el-radio>
            <el-radio label="incremental">增量同步</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="同步频率" prop="frequency">
          <el-select v-model="taskForm.frequency" placeholder="请选择同步频率">
            <el-option label="每小时" value="hourly" />
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
            <el-option label="手动" value="manual" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行时间" v-if="taskForm.frequency !== 'manual' && taskForm.frequency !== 'hourly'">
          <el-time-picker v-model="taskForm.executeTime" placeholder="请选择执行时间" format="HH:mm" />
        </el-form-item>
        <el-form-item label="数据筛选条件" prop="condition">
          <el-input v-model="taskForm.condition" type="textarea" :rows="3" placeholder="请输入数据筛选条件，JSON格式" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="taskForm.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
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
    
    <!-- 同步历史详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="同步历史详情"
      width="800px"
    >
      <div v-if="currentDetail">
        <el-descriptions bordered :column="2">
          <el-descriptions-item label="任务名称" :span="2">{{ currentDetail.taskName }}</el-descriptions-item>
          <el-descriptions-item label="数据类型">
            <el-tag :type="getDataTypeTag(currentDetail.dataType)">
              {{ getDataTypeLabel(currentDetail.dataType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="同步结果">
            <el-tag :type="getResultTag(currentDetail.result)">
              {{ getResultLabel(currentDetail.result) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ currentDetail.startTime }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ currentDetail.endTime }}</el-descriptions-item>
          <el-descriptions-item label="同步数量">{{ currentDetail.syncCount }} 条</el-descriptions-item>
          <el-descriptions-item label="源系统">{{ currentDetail.sourceSystem }}</el-descriptions-item>
          <el-descriptions-item label="目标系统">{{ currentDetail.targetSystem }}</el-descriptions-item>
          <el-descriptions-item label="同步方式">{{ currentDetail.syncType === 'full' ? '全量同步' : '增量同步' }}</el-descriptions-item>
          <el-descriptions-item label="结果描述" :span="2">{{ currentDetail.message }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="currentDetail.errors && currentDetail.errors.length > 0" class="error-list">
          <p class="error-title">错误详情：</p>
          <el-scrollbar height="250px">
            <el-table :data="currentDetail.errors" border>
              <el-table-column prop="id" label="数据ID" width="80" />
              <el-table-column prop="data" label="数据内容" min-width="200" show-overflow-tooltip />
              <el-table-column prop="reason" label="错误原因" min-width="200" show-overflow-tooltip />
            </el-table>
          </el-scrollbar>
        </div>
      </div>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import AdminLayout from './Layout.vue'

// 选项卡
const activeTab = ref('tasks')

// 搜索表单
const searchForm = reactive({
  name: '',
  dataType: '',
  status: ''
})

// 同步任务列表
const loading = ref(false)
const syncTaskList = ref([
  {
    id: 1,
    name: '用户基础信息同步',
    dataType: 'user',
    sourceSystem: 'CRM系统',
    targetSystem: '学习平台',
    syncType: 'incremental',
    frequency: 'daily',
    executeTime: '01:00',
    lastSync: '2023-06-14 01:00:00',
    nextSync: '2023-06-15 01:00:00',
    status: 'enabled',
    condition: '{"lastUpdateTime": "1d"}',
    remark: '每天凌晨1点同步用户信息'
  },
  {
    id: 2,
    name: '课程内容同步',
    dataType: 'content',
    sourceSystem: '内容管理系统',
    targetSystem: '学习平台',
    syncType: 'incremental',
    frequency: 'hourly',
    executeTime: null,
    lastSync: '2023-06-14 15:00:00',
    nextSync: '2023-06-14 16:00:00',
    status: 'enabled',
    condition: '{"status": "published"}',
    remark: '每小时同步一次新发布的课程内容'
  },
  {
    id: 3,
    name: '学习记录同步',
    dataType: 'learning',
    sourceSystem: '学习平台',
    targetSystem: '数据仓库',
    syncType: 'full',
    frequency: 'weekly',
    executeTime: '03:00',
    lastSync: '2023-06-10 03:00:00',
    nextSync: '2023-06-17 03:00:00',
    status: 'enabled',
    condition: '{}',
    remark: '每周六凌晨3点全量同步学习记录到数据仓库'
  },
  {
    id: 4,
    name: '系统配置同步',
    dataType: 'system',
    sourceSystem: '配置中心',
    targetSystem: '学习平台',
    syncType: 'incremental',
    frequency: 'daily',
    executeTime: '02:00',
    lastSync: '2023-06-14 02:00:00',
    nextSync: '2023-06-15 02:00:00',
    status: 'disabled',
    condition: '{"env": "production"}',
    remark: '每天凌晨2点同步系统配置'
  },
  {
    id: 5,
    name: '用户学习进度同步',
    dataType: 'learning',
    sourceSystem: '学习平台',
    targetSystem: 'CRM系统',
    syncType: 'incremental',
    frequency: 'daily',
    executeTime: '04:00',
    lastSync: '2023-06-14 04:00:00',
    nextSync: '2023-06-15 04:00:00',
    status: 'enabled',
    condition: '{"progress": "completed"}',
    remark: '每天凌晨4点同步已完成的学习进度到CRM'
  }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 同步任务表单
const formType = ref('add')
const dialogVisible = ref(false)
const taskFormRef = ref<FormInstance>()
const taskForm = reactive({
  id: null,
  name: '',
  dataType: 'user',
  sourceSystem: '',
  targetSystem: '',
  syncType: 'incremental',
  frequency: 'daily',
  executeTime: new Date(2023, 0, 1, 1, 0),
  lastSync: '',
  nextSync: '',
  status: 'enabled',
  condition: '{}',
  remark: ''
})

// 表单验证规则
const taskRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  dataType: [
    { required: true, message: '请选择数据类型', trigger: 'change' }
  ],
  sourceSystem: [
    { required: true, message: '请输入源系统', trigger: 'blur' }
  ],
  targetSystem: [
    { required: true, message: '请输入目标系统', trigger: 'blur' }
  ],
  frequency: [
    { required: true, message: '请选择同步频率', trigger: 'change' }
  ],
  condition: [
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

// 同步历史搜索表单
const historySearchForm = reactive({
  taskName: '',
  result: '',
  timeRange: []
})

// 同步历史列表
const historyLoading = ref(false)
const historyList = ref([
  {
    id: 1,
    taskId: 1,
    taskName: '用户基础信息同步',
    dataType: 'user',
    sourceSystem: 'CRM系统',
    targetSystem: '学习平台',
    startTime: '2023-06-14 01:00:00',
    endTime: '2023-06-14 01:05:20',
    syncCount: 125,
    syncType: 'incremental',
    result: 'success',
    message: '成功同步125条用户数据',
    errors: []
  },
  {
    id: 2,
    taskId: 2,
    taskName: '课程内容同步',
    dataType: 'content',
    sourceSystem: '内容管理系统',
    targetSystem: '学习平台',
    startTime: '2023-06-14 15:00:00',
    endTime: '2023-06-14 15:01:30',
    syncCount: 8,
    syncType: 'incremental',
    result: 'success',
    message: '成功同步8条课程内容',
    errors: []
  },
  {
    id: 3,
    taskId: 3,
    taskName: '学习记录同步',
    dataType: 'learning',
    sourceSystem: '学习平台',
    targetSystem: '数据仓库',
    startTime: '2023-06-10 03:00:00',
    endTime: '2023-06-10 03:20:45',
    syncCount: 5246,
    syncType: 'full',
    result: 'partial',
    message: '部分同步成功：成功5246条，失败12条',
    errors: [
      { id: '1001', data: '{"userId": 1001, "courseId": 5}', reason: '数据格式错误：缺少必填字段' },
      { id: '1002', data: '{"userId": 1002, "courseId": 8}', reason: '目标系统连接超时' }
    ]
  },
  {
    id: 4,
    taskId: 4,
    taskName: '系统配置同步',
    dataType: 'system',
    sourceSystem: '配置中心',
    targetSystem: '学习平台',
    startTime: '2023-06-13 02:00:00',
    endTime: '2023-06-13 02:00:10',
    syncCount: 18,
    syncType: 'incremental',
    result: 'success',
    message: '成功同步18条系统配置',
    errors: []
  },
  {
    id: 5,
    taskId: 5,
    taskName: '用户学习进度同步',
    dataType: 'learning',
    sourceSystem: '学习平台',
    targetSystem: 'CRM系统',
    startTime: '2023-06-14 04:00:00',
    endTime: '2023-06-14 04:00:00',
    syncCount: 0,
    syncType: 'incremental',
    result: 'fail',
    message: '同步失败：CRM系统API不可用',
    errors: [
      { id: 'API', data: 'CRM API', reason: '连接超时：目标系统无响应' }
    ]
  }
])

// 历史分页
const historyCurrentPage = ref(1)
const historyPageSize = ref(10)
const historyTotal = ref(100)

// 同步历史详情
const detailVisible = ref(false)
const currentDetail = ref<any>(null)

// 初始化
onMounted(() => {
  fetchTaskList()
})

// 获取任务列表
const fetchTaskList = () => {
  loading.value = true
  // 这里应该调用API获取同步任务列表
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 获取历史列表
const fetchHistoryList = () => {
  historyLoading.value = true
  // 这里应该调用API获取同步历史列表
  setTimeout(() => {
    historyLoading.value = false
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
  searchForm.dataType = ''
  searchForm.status = ''
  handleSearch()
}

// 处理刷新
const handleRefresh = () => {
  if (activeTab.value === 'tasks') {
    fetchTaskList()
  } else {
    fetchHistoryList()
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

// 历史分页大小变化
const handleHistorySizeChange = (size: number) => {
  historyPageSize.value = size
  fetchHistoryList()
}

// 历史页码变化
const handleHistoryCurrentChange = (page: number) => {
  historyCurrentPage.value = page
  fetchHistoryList()
}

// 搜索历史
const searchHistory = () => {
  historyCurrentPage.value = 1
  fetchHistoryList()
}

// 重置历史搜索
const resetHistorySearch = () => {
  historySearchForm.taskName = ''
  historySearchForm.result = ''
  historySearchForm.timeRange = []
  searchHistory()
}

// 新增任务
const handleAdd = () => {
  formType.value = 'add'
  taskForm.id = null
  taskForm.name = ''
  taskForm.dataType = 'user'
  taskForm.sourceSystem = ''
  taskForm.targetSystem = ''
  taskForm.syncType = 'incremental'
  taskForm.frequency = 'daily'
  taskForm.executeTime = new Date(2023, 0, 1, 1, 0)
  taskForm.condition = '{}'
  taskForm.status = 'enabled'
  taskForm.remark = ''
  dialogVisible.value = true
}

// 编辑任务
const handleEdit = (row: any) => {
  formType.value = 'edit'
  Object.assign(taskForm, {
    ...row,
    executeTime: row.executeTime ? new Date(2023, 0, 1, 
      parseInt(row.executeTime.split(':')[0]), 
      parseInt(row.executeTime.split(':')[1])
    ) : null
  })
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!taskFormRef.value) return
  
  await taskFormRef.value.validate(async (valid) => {
    if (valid) {
      // 处理时间格式
      let formattedExecuteTime = null
      if (taskForm.executeTime) {
        const hours = taskForm.executeTime.getHours().toString().padStart(2, '0')
        const minutes = taskForm.executeTime.getMinutes().toString().padStart(2, '0')
        formattedExecuteTime = `${hours}:${minutes}`
      }
      
      // 这里应该调用API保存任务
      console.log('保存任务:', { ...taskForm, executeTime: formattedExecuteTime })
      
      if (!taskForm.id) {
        // 新增
        const newTask = { 
          ...taskForm, 
          id: Date.now(),
          executeTime: formattedExecuteTime,
          lastSync: '-',
          nextSync: '2023-06-15 00:00:00'
        }
        syncTaskList.value.unshift(newTask)
        ElMessage.success('任务创建成功')
      } else {
        // 编辑
        const index = syncTaskList.value.findIndex(item => item.id === taskForm.id)
        if (index !== -1) {
          const updatedTask = { 
            ...syncTaskList.value[index], 
            ...taskForm,
            executeTime: formattedExecuteTime
          }
          syncTaskList.value[index] = updatedTask
        }
        ElMessage.success('任务更新成功')
      }
      
      dialogVisible.value = false
    }
  })
}

// 切换任务状态
const handleToggleStatus = (row: any) => {
  const action = row.status === 'enabled' ? '禁用' : '启用'
  
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
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    row.nextSync = row.status === 'enabled' ? '2023-06-15 00:00:00' : '已禁用'
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

// 立即同步
const handleSyncNow = (row: any) => {
  if (row.status !== 'enabled') {
    ElMessage.warning('任务已禁用，请先启用任务')
    return
  }
  
  ElMessageBox.confirm(
    `确定要立即执行同步任务"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API立即执行同步任务
    ElMessage.success('同步任务已开始执行，请稍后查看同步历史')
    
    // 模拟添加一条历史记录
    setTimeout(() => {
      const now = new Date()
      const endTime = new Date(now.getTime() + 5000)
      
      const newHistory = {
        id: Date.now(),
        taskId: row.id,
        taskName: row.name,
        dataType: row.dataType,
        sourceSystem: row.sourceSystem,
        targetSystem: row.targetSystem,
        startTime: now.toLocaleString(),
        endTime: endTime.toLocaleString(),
        syncCount: Math.floor(Math.random() * 100) + 1,
        syncType: row.syncType,
        result: 'success',
        message: `手动触发同步成功，同步了${Math.floor(Math.random() * 100) + 1}条数据`,
        errors: []
      }
      
      historyList.value.unshift(newHistory)
      
      // 更新任务的最后同步时间
      const index = syncTaskList.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        syncTaskList.value[index].lastSync = now.toLocaleString()
      }
      
      if (activeTab.value !== 'history') {
        ElMessage.info('同步任务执行完成，可前往同步历史选项卡查看详情')
      }
    }, 2000)
  }).catch(() => {})
}

// 删除任务
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除同步任务"${row.name}"吗？删除后将无法恢复！`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API删除任务
    syncTaskList.value = syncTaskList.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 查看历史
const viewHistory = (row: any) => {
  activeTab.value = 'history'
  historySearchForm.taskName = row.name
  searchHistory()
}

// 查看详情
const viewDetail = (row: any) => {
  currentDetail.value = row
  detailVisible.value = true
}

// 辅助函数
const getDataTypeTag = (type: string) => {
  const map: Record<string, string> = {
    user: 'success',
    learning: 'warning',
    system: 'danger',
    content: 'info'
  }
  return map[type] || 'info'
}

const getDataTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    user: '用户数据',
    learning: '学习数据',
    system: '系统数据',
    content: '内容数据'
  }
  return map[type] || type
}

const getResultTag = (result: string) => {
  const map: Record<string, string> = {
    success: 'success',
    partial: 'warning',
    fail: 'danger'
  }
  return map[result] || 'info'
}

const getResultLabel = (result: string) => {
  const map: Record<string, string> = {
    success: '成功',
    partial: '部分成功',
    fail: '失败'
  }
  return map[result] || result
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

.history-filter {
  margin-bottom: 16px;
}

.error-list {
  margin-top: 20px;
}

.error-title {
  font-weight: bold;
  color: #f56c6c;
  margin-bottom: 10px;
}
</style> 