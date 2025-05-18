<template>
  <div class="my-courses-container">
    <el-card class="page-header">
      <div class="header-content">
        <h2>我开发的课程</h2>
        <div class="header-actions">
          <el-button @click="refreshCourses">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
          <el-button type="primary" @click="navigateToCreate">
            <el-icon><Plus /></el-icon>创建新课程
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 筛选区域 -->
    <el-card class="filter-container">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="课程状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
            <el-option label="开发中" value="developing" />
            <el-option label="已发布" value="published" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程类型">
          <el-select v-model="filterForm.type" placeholder="全部类型" clearable>
            <el-option label="视频课程" value="video" />
            <el-option label="文档课程" value="document" />
            <el-option label="混合课程" value="mixed" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="课程名称/描述" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 课程列表 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else>
      <el-empty v-if="filteredCourses.length === 0" description="暂无课程，开始创建吧" />
      
      <div v-else class="course-grid">
        <el-card v-for="course in filteredCourses" :key="course.id" class="course-card">
          <div class="course-cover">
            <img :src="course.coverUrl" :alt="course.title" />
            <div class="course-status">
              <el-tag 
                :type="getStatusType(course.status)" 
                effect="dark"
              >
                {{ getStatusText(course.status) }}
              </el-tag>
            </div>
          </div>
          
          <div class="course-info">
            <h3 class="course-title">{{ course.title }}</h3>
            <p class="course-desc">{{ course.description }}</p>
            
            <div class="course-meta">
              <span>
                <el-icon><Calendar /></el-icon>
                {{ formatDate(course.updateTime) }}
              </span>
              <span>
                <el-icon><View /></el-icon>
                {{ course.views }}次查看
              </span>
              <span>
                <el-icon><User /></el-icon>
                {{ course.students }}名学员
              </span>
            </div>
            
            <el-progress 
              :percentage="course.progress" 
              :status="course.status === 'published' ? 'success' : ''"
              :stroke-width="8"
              :format="percentageFormat"
            />
            
            <div class="course-actions">
              <el-button-group>
                <el-button type="primary" @click="handleEdit(course)">
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <el-button 
                  type="success" 
                  :disabled="course.progress < 100" 
                  @click="handlePublish(course)"
                  v-if="course.status !== 'published'"
                >
                  <el-icon><Upload /></el-icon>发布
                </el-button>
                <el-button 
                  type="warning" 
                  @click="handleUnpublish(course)"
                  v-else
                >
                  <el-icon><Download /></el-icon>取消发布
                </el-button>
                <el-button @click="handlePreview(course)">
                  <el-icon><View /></el-icon>预览
                </el-button>
              </el-button-group>
              <el-dropdown @command="handleCommand($event, course)">
                <el-button>
                  <el-icon><More /></el-icon>更多
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="stats">课程数据</el-dropdown-item>
                    <el-dropdown-item command="copy">复制课程</el-dropdown-item>
                    <el-dropdown-item command="archive" v-if="course.status !== 'archived'">归档</el-dropdown-item>
                    <el-dropdown-item command="restore" v-else>恢复归档</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除课程</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[8, 12, 24, 36]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalCourses"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ElMessage, 
  ElMessageBox,

} from 'element-plus'
import { 
  Edit, 
  Refresh, 
  Plus, 
  View, 
  Calendar,
  User,
  Upload,
  Download,
  More
} from '@element-plus/icons-vue'

const router = useRouter()

interface Course {
  id: number
  title: string
  description: string
  coverUrl: string
  status: 'developing' | 'published' | 'archived'
  progress: number
  updateTime: string
  type: 'video' | 'document' | 'mixed'
  views: number
  students: number
}

// 过滤表单
const filterForm = reactive({
  status: '',
  type: '',
  keyword: ''
})

// 课程数据
const loading = ref(false)
const courses = ref<Course[]>([
  {
    id: 1,
    title: 'Vue3 实战教程',
    description: '从零开始学习Vue3，掌握Composition API、TypeScript集成、Vite构建工具等前沿技术',
    coverUrl: 'https://placehold.co/400x250?text=Vue3',
    status: 'published',
    progress: 100,
    updateTime: '2023-05-15',
    type: 'video',
    views: 2456,
    students: 189
  },
  {
    id: 2,
    title: 'React Hooks高级应用',
    description: '深入学习React Hooks，构建可复用的函数组件，优化应用性能',
    coverUrl: 'https://placehold.co/400x250?text=React',
    status: 'developing',
    progress: 65,
    updateTime: '2023-06-02',
    type: 'mixed',
    views: 842,
    students: 0
  },
  {
    id: 3,
    title: 'Node.js微服务架构',
    description: '学习使用Node.js构建可扩展的微服务架构，包含Docker部署、服务治理等内容',
    coverUrl: 'https://placehold.co/400x250?text=Node.js',
    status: 'developing',
    progress: 35,
    updateTime: '2023-06-10',
    type: 'document',
    views: 320,
    students: 0
  },
  {
    id: 4,
    title: 'TypeScript高级编程',
    description: '掌握TypeScript高级特性，提升代码质量和开发效率',
    coverUrl: 'https://placehold.co/400x250?text=TypeScript',
    status: 'archived',
    progress: 100,
    updateTime: '2023-04-08',
    type: 'mixed',
    views: 1526,
    students: 87
  },
  {
    id: 5,
    title: '前端工程化实践',
    description: '学习前端工程化工具链和最佳实践，包含CI/CD、自动化测试等内容',
    coverUrl: 'https://placehold.co/400x250?text=Engineering',
    status: 'published',
    progress: 100,
    updateTime: '2023-05-28',
    type: 'video',
    views: 1234,
    students: 93
  },
  {
    id: 6,
    title: 'CSS3动画与特效',
    description: '掌握CSS3动画、过渡、变换等高级特性，创造引人入胜的网页体验',
    coverUrl: 'https://placehold.co/400x250?text=CSS3',
    status: 'developing',
    progress: 80,
    updateTime: '2023-06-05',
    type: 'video',
    views: 567,
    students: 0
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(8)
const totalCourses = ref(courses.value.length)

// 获取过滤后的课程
const filteredCourses = computed(() => {
  let result = [...courses.value]
  
  // 按状态筛选
  if (filterForm.status) {
    result = result.filter(course => course.status === filterForm.status)
  }
  
  // 按类型筛选
  if (filterForm.type) {
    result = result.filter(course => course.type === filterForm.type)
  }
  
  // 按关键词筛选
  if (filterForm.keyword) {
    const keyword = filterForm.keyword.toLowerCase()
    result = result.filter(course => 
      course.title.toLowerCase().includes(keyword) || 
      course.description.toLowerCase().includes(keyword)
    )
  }
  
  // 分页处理
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  
  // 更新总数
  totalCourses.value = result.length
  
  return result.slice(startIndex, endIndex)
})

// 初始化数据
onMounted(() => {
  loadCourses()
})

// 加载课程数据
const loadCourses = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    loading.value = false
  }, 800)
}

// 刷新课程列表
const refreshCourses = () => {
  loadCourses()
  ElMessage.success('课程列表已刷新')
}

// 导航到创建新课程页面
const navigateToCreate = () => {
  router.push('/dev/course-edit')
}

// 处理筛选
const handleFilter = () => {
  currentPage.value = 1
  // 在实际项目中，可能需要调用API进行筛选
}

// 重置筛选
const resetFilter = () => {
  filterForm.status = ''
  filterForm.type = ''
  filterForm.keyword = ''
  currentPage.value = 1
  // 在实际项目中，可能需要调用API重新加载数据
}

// 编辑课程
const handleEdit = (course: Course) => {
  router.push(`/dev/course-edit/${course.id}`)
}

// 发布课程
const handlePublish = (course: Course) => {
  if (course.progress < 100) {
    ElMessage.warning('课程内容尚未完成，无法发布')
    return
  }
  
  ElMessageBox.confirm(
    `确定要发布课程"${course.title}"吗？发布后将对学员可见。`,
    '发布确认',
    {
      confirmButtonText: '确定发布',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    // 这里应该调用API发布课程
    const index = courses.value.findIndex(item => item.id === course.id)
    if (index !== -1) {
      courses.value[index].status = 'published'
      ElMessage.success('课程发布成功')
    }
  }).catch(() => {})
}

// 取消发布课程
const handleUnpublish = (course: Course) => {
  ElMessageBox.confirm(
    `确定要取消发布课程"${course.title}"吗？取消后学员将无法访问该课程。`,
    '取消发布确认',
    {
      confirmButtonText: '确定取消发布',
      cancelButtonText: '返回',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API取消发布课程
    const index = courses.value.findIndex(item => item.id === course.id)
    if (index !== -1) {
      courses.value[index].status = 'developing'
      ElMessage.success('课程已取消发布')
    }
  }).catch(() => {})
}

// 预览课程
const handlePreview = (course: Course) => {
  router.push(`/dev/course-preview/${course.id}`)
}

// 查看课程数据
const handleViewStats = (course: Course) => {
  router.push(`/dev/course-details/${course.id}`)
}

// 处理更多操作
const handleCommand = (command: string, course: Course) => {
  switch (command) {
    case 'stats':
      handleViewStats(course)
      break
    case 'copy':
      handleCopyCourse(course)
      break
    case 'archive':
      handleArchiveCourse(course)
      break
    case 'restore':
      handleRestoreCourse(course)
      break
    case 'delete':
      handleDeleteCourse(course)
      break
  }
}

// 复制课程
const handleCopyCourse = (course: Course) => {
  ElMessageBox.confirm(
    `确定要复制课程"${course.title}"吗？复制后将创建一个新的课程。`,
    '复制课程',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 调用API复制课程
    ElMessage.success('课程复制成功')
  }).catch(() => {})
}

// 归档课程
const handleArchiveCourse = (course: Course) => {
  ElMessageBox.confirm(
    `确定要归档课程"${course.title}"吗？归档后课程将不再显示在主列表中。`,
    '归档课程',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 调用API归档课程
    const index = courses.value.findIndex(item => item.id === course.id)
    if (index !== -1) {
      courses.value[index].status = 'archived'
      ElMessage.success('课程已归档')
    }
  }).catch(() => {})
}

// 恢复归档课程
const handleRestoreCourse = (course: Course) => {
  // TODO: 调用API恢复课程
  const index = courses.value.findIndex(item => item.id === course.id)
  if (index !== -1) {
    courses.value[index].status = 'developing'
    ElMessage.success('课程已恢复')
  }
}

// 删除课程
const handleDeleteCourse = (course: Course) => {
  ElMessageBox.confirm(
    `确定要删除课程"${course.title}"吗？此操作不可恢复。`,
    '删除课程',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    // TODO: 调用API删除课程
    const index = courses.value.findIndex(item => item.id === course.id)
    if (index !== -1) {
      courses.value.splice(index, 1)
      ElMessage.success('课程已删除')
    }
  }).catch(() => {})
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  // TODO: 重新加载数据
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  // TODO: 重新加载数据
}

// 获取状态类型
const getStatusType = (status: Course['status']): '' | 'success' | 'warning' | 'info' => {
  const statusMap: Record<Course['status'], '' | 'success' | 'warning' | 'info'> = {
    developing: '',
    published: 'success',
    archived: 'info'
  }
  return statusMap[status]
}

// 获取状态文本
const getStatusText = (status: Course['status']) => {
  const map = {
    developing: '开发中',
    published: '已发布',
    archived: '已归档'
  }
  return map[status] || '未知'
}

// 格式化日期
const formatDate = (dateStr: string) => {
  // 实际项目中，可能需要更复杂的日期格式化逻辑
  return dateStr
}

// 进度格式化
const percentageFormat = (percentage: number) => {
  return `${percentage}%`
}
</script>

<style scoped>
.my-courses-container {
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

.loading-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.course-card {
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  height: 100%;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.course-cover {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-status {
  position: absolute;
  top: 10px;
  right: 10px;
}

.course-info {
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.course-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-desc {
  color: #606266;
  margin-bottom: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;

  -webkit-box-orient: vertical;
  min-height: 40px;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 13px;
  margin-bottom: 15px;
}

.course-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.course-actions {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  padding-top: 15px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 