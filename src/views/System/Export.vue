<template>
  <div class="export-container">
    <el-card class="page-header">
      <div class="header-content">
        <h2>导出学习记录</h2>
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </el-card>

    <!-- 导出选项区域 -->
    <el-card class="export-options">
      <el-form :model="exportForm" label-width="120px">
        <el-form-item label="导出类型">
          <el-radio-group v-model="exportForm.type">
            <el-radio label="user">按用户导出</el-radio>
            <el-radio label="department">按部门导出</el-radio>
            <el-radio label="course">按课程导出</el-radio>
            <el-radio label="task">按任务导出</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="exportForm.type === 'user'" label="选择用户">
          <el-select 
            v-model="exportForm.userIds" 
            multiple 
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择用户"
            style="width: 100%"
          >
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.realName + ' (' + user.username + ')'"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="exportForm.type === 'department'" label="选择部门">
          <el-select 
            v-model="exportForm.departmentIds" 
            multiple 
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择部门"
            style="width: 100%"
          >
            <el-option
              v-for="dept in departmentList"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="exportForm.type === 'course'" label="选择课程">
          <el-select 
            v-model="exportForm.courseIds" 
            multiple 
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择课程"
            style="width: 100%"
          >
            <el-option
              v-for="course in courseList"
              :key="course.id"
              :label="course.title"
              :value="course.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="exportForm.type === 'task'" label="选择任务">
          <el-select 
            v-model="exportForm.taskIds" 
            multiple 
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择任务"
            style="width: 100%"
          >
            <el-option
              v-for="task in taskList"
              :key="task.id"
              :label="task.title"
              :value="task.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="exportForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="包含内容">
          <el-checkbox-group v-model="exportForm.includeFields">
            <el-checkbox label="baseInfo">基本信息</el-checkbox>
            <el-checkbox label="progress">学习进度</el-checkbox>
            <el-checkbox label="time">学习时长</el-checkbox>
            <el-checkbox label="score">测试成绩</el-checkbox>
            <el-checkbox label="notes">学习笔记</el-checkbox>
            <el-checkbox label="comments">评论内容</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="文件格式">
          <el-radio-group v-model="exportForm.fileFormat">
            <el-radio label="excel">Excel</el-radio>
            <el-radio label="csv">CSV</el-radio>
            <el-radio label="pdf">PDF</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleExport" :loading="exporting">
            <el-icon><Download /></el-icon>导出数据
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 历史导出记录 -->
    <el-card class="export-history">
      <template #header>
        <div class="card-header">
          <span>历史导出记录</span>
          <el-button type="danger" size="small" @click="handleClearHistory" :disabled="exportHistory.length === 0">
            清空记录
          </el-button>
        </div>
      </template>
      
      <el-empty v-if="exportHistory.length === 0" description="暂无导出记录" />
      
      <el-table v-else :data="exportHistory" style="width: 100%" border>
        <el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip />
        <el-table-column prop="exportType" label="导出类型" width="100">
          <template #default="scope">
            {{ getExportTypeText(scope.row.exportType) }}
          </template>
        </el-table-column>
        <el-table-column prop="fileSize" label="文件大小" width="100" />
        <el-table-column prop="createTime" label="导出时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'completed' ? 'success' : 'warning'">
              {{ scope.row.status === 'completed' ? '已完成' : '处理中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary" 
              @click="handleDownload(scope.row)"
              :disabled="scope.row.status !== 'completed'"
              link
            >
              下载
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDeleteExport(scope.row)"
              link
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 导出详情弹窗 -->
    <el-dialog v-model="previewDialogVisible" title="导出预览" width="600px">
      <div v-if="exportPreview">
        <el-alert
          title="准备导出以下数据，请确认"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        />

        <el-descriptions :column="1" border>
          <el-descriptions-item label="导出类型">{{ getExportTypeText(exportForm.type) }}</el-descriptions-item>
          <el-descriptions-item label="导出范围">
            <template v-if="exportForm.type === 'user'">
              {{ getSelectionNames(userList, exportForm.userIds) }}
            </template>
            <template v-else-if="exportForm.type === 'department'">
              {{ getSelectionNames(departmentList, exportForm.departmentIds) }}
            </template>
            <template v-else-if="exportForm.type === 'course'">
              {{ getSelectionNames(courseList, exportForm.courseIds) }}
            </template>
            <template v-else-if="exportForm.type === 'task'">
              {{ getSelectionNames(taskList, exportForm.taskIds) }}
            </template>
          </el-descriptions-item>
          <el-descriptions-item label="时间范围">
            {{ exportForm.dateRange ? `${exportForm.dateRange[0]} 至 ${exportForm.dateRange[1]}` : '全部时间' }}
          </el-descriptions-item>
          <el-descriptions-item label="包含内容">
            {{ getIncludeFieldsText(exportForm.includeFields) }}
          </el-descriptions-item>
          <el-descriptions-item label="文件格式">
            {{ getFileFormatText(exportForm.fileFormat) }}
          </el-descriptions-item>
          <el-descriptions-item label="预计数据量">{{ exportPreview.estimatedCount }} 条记录</el-descriptions-item>
          <el-descriptions-item label="预计文件大小">{{ exportPreview.estimatedSize }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmExport">确认导出</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import {ElMessage} from 'element-plus'
import {Download, Refresh} from '@element-plus/icons-vue'

// 类型定义
interface UserItem {
  id: number
  username: string
  realName: string
}
interface DepartmentItem {
  id: number
  name: string
}
interface CourseItem {
  id: number
  title: string
}
interface TaskItem {
  id: number
  title: string
}
interface ExportHistoryItem {
  id: number
  fileName: string
  exportType: string
  fileSize: string
  createTime: string
  status: 'completed' | 'processing'
}
interface ExportPreview {
  estimatedCount: number
  estimatedSize: string
}

// 导出表单
const exportForm = reactive({
  type: 'user',
  userIds: [] as number[],
  departmentIds: [] as number[],
  courseIds: [] as number[],
  taskIds: [] as number[],
  dateRange: null as [string, string] | null,
  includeFields: ['baseInfo', 'progress', 'time'] as string[],
  fileFormat: 'excel'
})

// 加载状态
const exporting = ref(false)
const loading = ref(false)

// 数据列表
const userList = ref<UserItem[]>([])
const departmentList = ref<DepartmentItem[]>([])
const courseList = ref<CourseItem[]>([])
const taskList = ref<TaskItem[]>([])
const exportHistory = ref<ExportHistoryItem[]>([])

// 预览弹窗
const previewDialogVisible = ref(false)
const exportPreview = ref<ExportPreview | null>(null)

// 页面加载
onMounted(() => {
  refreshData()
  fetchUserList()
  fetchDepartmentList()
  fetchCourseList()
  fetchTaskList()
  fetchExportHistory()
})

// 获取用户列表
async function fetchUserList() {
  try {
    // TODO: 替换为实际API
    // const res = await api.getUserList()
    // userList.value = res.data
    userList.value = []
  } catch (e) {
    ElMessage.error('获取用户列表失败')
  }
}
// 获取部门列表
async function fetchDepartmentList() {
  try {
    // TODO: 替换为实际API
    // const res = await api.getDepartmentList()
    // departmentList.value = res.data
    departmentList.value = []
  } catch (e) {
    ElMessage.error('获取部门列表失败')
  }
}
// 获取课程列表
async function fetchCourseList() {
  try {
    // TODO: 替换为实际API
    // const res = await api.getCourseList()
    // courseList.value = res.data
    courseList.value = []
  } catch (e) {
    ElMessage.error('获取课程列表失败')
  }
}
// 获取任务列表
async function fetchTaskList() {
  try {
    // TODO: 替换为实际API
    // const res = await api.getTaskList()
    // taskList.value = res.data
    taskList.value = []
  } catch (e) {
    ElMessage.error('获取任务列表失败')
  }
}
// 获取导出历史
async function fetchExportHistory() {
  try {
    // TODO: 替换为实际API
    // const res = await api.getExportHistory()
    // exportHistory.value = res.data
    exportHistory.value = []
  } catch (e) {
    ElMessage.error('获取导出历史失败')
  }
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  Promise.all([
    fetchUserList(),
    fetchDepartmentList(),
    fetchCourseList(),
    fetchTaskList(),
    fetchExportHistory()
  ]).then(() => {
    loading.value = false
    ElMessage.success('数据已刷新')
  })
}

// 重置表单
const resetForm = () => {
  exportForm.type = 'user'
  exportForm.userIds = []
  exportForm.departmentIds = []
  exportForm.courseIds = []
  exportForm.taskIds = []
  exportForm.dateRange = null
  exportForm.includeFields = ['baseInfo', 'progress', 'time']
  exportForm.fileFormat = 'excel'
}

// 处理导出
const handleExport = () => {
  if (!validateExportForm()) return
  showExportPreview()
}

// 验证导出表单
const validateExportForm = (): boolean => {
  if (exportForm.type === 'user' && exportForm.userIds.length === 0) {
    ElMessage.warning('请选择要导出的用户')
    return false
  }
  if (exportForm.type === 'department' && exportForm.departmentIds.length === 0) {
    ElMessage.warning('请选择要导出的部门')
    return false
  }
  if (exportForm.type === 'course' && exportForm.courseIds.length === 0) {
    ElMessage.warning('请选择要导出的课程')
    return false
  }
  if (exportForm.type === 'task' && exportForm.taskIds.length === 0) {
    ElMessage.warning('请选择要导出的任务')
    return false
  }
  if (exportForm.includeFields.length === 0) {
    ElMessage.warning('请选择至少一项要包含的内容')
    return false
  }
  return true
}

// 显示导出预览
const showExportPreview = () => {
  // TODO: 可调用后端接口获取预估数据量和大小
  exportPreview.value = {
    estimatedCount: 100,
    estimatedSize: '1MB'
  }
  previewDialogVisible.value = true
}

// 确认导出
const confirmExport = async () => {
  previewDialogVisible.value = false
  exporting.value = true
  try {
    // TODO: 替换为实际API
    // const res = await api.exportData(exportForm)
    // 导出成功后刷新历史
    await fetchExportHistory()
    ElMessage.success('导出成功，可在导出记录中下载文件')
  } catch (e) {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

// 处理下载
const handleDownload = (record: ExportHistoryItem) => {
  // TODO: 替换为实际API
  // await api.downloadExportFile(record.id)
  ElMessage.success(`正在下载文件: ${record.fileName}`)
}

// 处理删除导出记录
const handleDeleteExport = async (record: ExportHistoryItem) => {
  try {
    // TODO: 替换为实际API
    // await api.deleteExportRecord(record.id)
    await fetchExportHistory()
    ElMessage.success('导出记录已删除')
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

// 清空历史记录
const handleClearHistory = async () => {
  try {
    // TODO: 替换为实际API
    // await api.clearExportHistory()
    await fetchExportHistory()
    ElMessage.success('导出记录已清空')
  } catch (e) {
    ElMessage.error('清空失败')
  }
}

// 获取导出类型文本
const getExportTypeText = (type: string): string => {
  const map: Record<string, string> = {
    'user': '按用户',
    'department': '按部门',
    'course': '按课程',
    'task': '按任务'
  }
  return map[type] || '未知'
}
// 获取文件扩展名
const getFileExtension = (format: string): string => {
  const map: Record<string, string> = {
    'excel': 'xlsx',
    'csv': 'csv',
    'pdf': 'pdf'
  }
  return map[format] || 'xlsx'
}
// 获取文件格式文本
const getFileFormatText = (format: string): string => {
  const map: Record<string, string> = {
    'excel': 'Excel 表格',
    'csv': 'CSV 文本文件',
    'pdf': 'PDF 文档'
  }
  return map[format] || '未知'
}
// 获取包含字段文本
const getIncludeFieldsText = (fields: string[]): string => {
  const map: Record<string, string> = {
    'baseInfo': '基本信息',
    'progress': '学习进度',
    'time': '学习时长',
    'score': '测试成绩',
    'notes': '学习笔记',
    'comments': '评论内容'
  }
  return fields.map(field => map[field] || field).join('、')
}
// 获取选择的名称列表
const getSelectionNames = (list: Array<any>, ids: number[]): string => {
  if (!ids || ids.length === 0) return '全部'
  const names = ids.map(id => {
    const item = list.find((item: any) => item.id === id)
    return item ? (item.realName || item.name || item.title) : ''
  }).filter(Boolean)
  if (names.length <= 3) {
    return names.join('、')
  } else {
    return `${names.slice(0, 3).join('、')} 等 ${names.length} 项`
  }
}
</script>

<style scoped>
.export-container {
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

.export-options {
  margin-bottom: 16px;
  padding: 20px;
}

.export-history {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 