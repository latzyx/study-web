<template>
  <div class="rankings-container">
    <el-card class="page-header">
      <div class="header-content">
        <h2>课程排行</h2>
        <div class="header-actions">
          <el-button @click="refreshRankings">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 筛选区域 -->
    <el-card class="filter-container">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="排行类型">
          <el-select v-model="filterForm.rankType" placeholder="排行类型">
            <el-option label="热门程度" value="popularity" />
            <el-option label="评分最高" value="rating" />
            <el-option label="学习人数" value="students" />
            <el-option label="完成率" value="completion" />
            <el-option label="新课程" value="newest" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程类型">
          <el-select v-model="filterForm.courseType" placeholder="全部类型" clearable>
            <el-option label="视频课程" value="video" />
            <el-option label="文档课程" value="document" />
            <el-option label="混合课程" value="mixed" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度级别">
          <el-select v-model="filterForm.level" placeholder="全部级别" clearable>
            <el-option label="入门" value="beginner" />
            <el-option label="初级" value="elementary" />
            <el-option label="中级" value="intermediate" />
            <el-option label="高级" value="advanced" />
            <el-option label="专家" value="expert" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-select v-model="filterForm.timeRange" placeholder="全部时间" clearable>
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="本季度" value="quarter" />
            <el-option label="本年度" value="year" />
            <el-option label="全部时间" value="all" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 主要内容 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    <div v-else>
      <!-- 排行榜切换标签 -->
      <el-tabs v-model="activeTab" class="ranking-tabs">
        <el-tab-pane label="排行列表" name="list">
          <el-card>
            <el-table
              :data="rankedCourses"
              style="width: 100%"
              :default-sort="{ prop: getSortProp(), order: 'descending' }"
            >
              <el-table-column label="排名" width="80">
                <template #default="scope">
                  <div class="rank-number" :class="{ 'top-three': scope.$index < 3 }">
                    {{ scope.$index + 1 }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="title" label="课程名称" min-width="200">
                <template #default="scope">
                  <div class="course-info">
                    <el-image 
                      :src="scope.row.coverUrl" 
                      :alt="scope.row.title"
                      class="course-thumbnail"
                    />
                    <div class="course-details">
                      <div class="course-title">{{ scope.row.title }}</div>
                      <div class="course-meta">
                        <el-tag size="small" :type="getTypeTagType(scope.row.type)">
                          {{ getTypeText(scope.row.type) }}
                        </el-tag>
                        <el-tag size="small" type="info">{{ getLevelText(scope.row.level) }}</el-tag>
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="author" label="作者" width="120" />
              <el-table-column prop="rating" label="评分" width="180" sortable>
                <template #default="scope">
                  <div class="rating">
                    <el-rate
                      v-model="scope.row.rating"
                      disabled
                      text-color="#ff9900"
                      score-template="{value}"
                    />
                    <span class="rating-score">{{ scope.row.rating.toFixed(1) }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="students" label="学习人数" width="120" sortable />
              <el-table-column prop="completionRate" label="完成率" width="180" sortable>
                <template #default="scope">
                  <el-progress
                    :percentage="scope.row.completionRate"
                    :format="(val) => val + '%'"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="popularity" label="热门指数" width="180" sortable>
                <template #default="scope">
                  <div class="popularity-indicator">
                    <div class="popularity-bar" :style="{ width: getPopularityWidth(scope.row.popularity) }"></div>
                    <span class="popularity-value">{{ scope.row.popularity }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button 
                    type="primary" 
                    @click="viewCourse(scope.row)"
                    link
                  >
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>
        
        <el-tab-pane label="热门榜单" name="hot">
          <div class="ranking-cards">
            <div v-for="(course, index) in topCourses" :key="course.id" class="ranking-card">
              <div class="rank-badge" :class="{ 'top-three': index < 3 }">{{ index + 1 }}</div>
              <el-card class="course-card" :body-style="{ padding: '0px' }">
                <div class="card-cover">
                  <el-image :src="course.coverUrl" :alt="course.title" fit="cover" />
                  <div class="card-badges">
                    <el-tag size="small" :type="getTypeTagType(course.type)">
                      {{ getTypeText(course.type) }}
                    </el-tag>
                    <el-tag size="small" type="info">{{ getLevelText(course.level) }}</el-tag>
                  </div>
                </div>
                <div class="card-content">
                  <h3 class="card-title">{{ course.title }}</h3>
                  <div class="card-author">{{ course.author }}</div>
                  <div class="card-stats">
                    <div class="card-stat">
                      <el-icon><Star /></el-icon>
                      <span>{{ course.rating.toFixed(1) }}</span>
                    </div>
                    <div class="card-stat">
                      <el-icon><User /></el-icon>
                      <span>{{ course.students }}</span>
                    </div>
                    <div class="card-stat">
                      <el-icon><View /></el-icon>
                      <span>{{ course.views }}</span>
                    </div>
                  </div>
                  <div class="card-popularity">
                    <span class="label">热门指数</span>
                    <div class="popularity-indicator">
                      <div class="popularity-bar" :style="{ width: getPopularityWidth(course.popularity) }"></div>
                      <span class="popularity-value">{{ course.popularity }}</span>
                    </div>
                  </div>
                  <el-button 
                    type="primary" 
                    @click="viewCourse(course)" 
                    class="card-action"
                  >
                    查看课程
                  </el-button>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh, Star, User, View } from '@element-plus/icons-vue'

const router = useRouter()

// 筛选表单
const filterForm = reactive({
  rankType: 'popularity',
  courseType: '',
  level: '',
  timeRange: 'all'
})

// 加载状态
const loading = ref(false)

// 活动标签
const activeTab = ref('list')

// 课程列表数据
const coursesData = ref([
  {
    id: 1,
    title: 'Vue3 实战教程',
    coverUrl: 'https://placehold.co/400x250?text=Vue3',
    author: '张三',
    type: 'video',
    level: 'intermediate',
    rating: 4.8,
    students: 1289,
    views: 5640,
    completionRate: 78,
    popularity: 98,
    publishTime: '2023-05-01'
  },
  {
    id: 2,
    title: 'React Hooks高级应用',
    coverUrl: 'https://placehold.co/400x250?text=React',
    author: '李四',
    type: 'mixed',
    level: 'advanced',
    rating: 4.6,
    students: 856,
    views: 3200,
    completionRate: 65,
    popularity: 85,
    publishTime: '2023-04-15'
  },
  {
    id: 3,
    title: 'Node.js微服务架构',
    coverUrl: 'https://placehold.co/400x250?text=Node.js',
    author: '王五',
    type: 'document',
    level: 'expert',
    rating: 4.9,
    students: 567,
    views: 2100,
    completionRate: 72,
    popularity: 82,
    publishTime: '2023-03-20'
  },
  {
    id: 4,
    title: 'TypeScript高级编程',
    coverUrl: 'https://placehold.co/400x250?text=TypeScript',
    author: '赵六',
    type: 'mixed',
    level: 'advanced',
    rating: 4.7,
    students: 723,
    views: 2800,
    completionRate: 68,
    popularity: 88,
    publishTime: '2023-02-10'
  },
  {
    id: 5,
    title: '前端工程化实践',
    coverUrl: 'https://placehold.co/400x250?text=Engineering',
    author: '张三',
    type: 'video',
    level: 'intermediate',
    rating: 4.5,
    students: 912,
    views: 3100,
    completionRate: 75,
    popularity: 90,
    publishTime: '2023-05-25'
  },
  {
    id: 6,
    title: 'CSS3动画与特效',
    coverUrl: 'https://placehold.co/400x250?text=CSS3',
    author: '孙七',
    type: 'video',
    level: 'elementary',
    rating: 4.3,
    students: 1456,
    views: 4800,
    completionRate: 85,
    popularity: 92,
    publishTime: '2023-04-28'
  },
  {
    id: 7,
    title: 'JavaScript函数式编程',
    coverUrl: 'https://placehold.co/400x250?text=JavaScript',
    author: '钱八',
    type: 'mixed',
    level: 'advanced',
    rating: 4.4,
    students: 623,
    views: 2400,
    completionRate: 62,
    popularity: 78,
    publishTime: '2023-03-15'
  },
  {
    id: 8,
    title: 'Web性能优化指南',
    coverUrl: 'https://placehold.co/400x250?text=Performance',
    author: '周九',
    type: 'document',
    level: 'intermediate',
    rating: 4.7,
    students: 845,
    views: 3200,
    completionRate: 70,
    popularity: 86,
    publishTime: '2023-06-05'
  },
  {
    id: 9,
    title: 'React Native移动应用开发',
    coverUrl: 'https://placehold.co/400x250?text=ReactNative',
    author: '吴十',
    type: 'video',
    level: 'advanced',
    rating: 4.8,
    students: 734,
    views: 2900,
    completionRate: 68,
    popularity: 89,
    publishTime: '2023-05-18'
  },
  {
    id: 10,
    title: 'WebGL 3D编程入门',
    coverUrl: 'https://placehold.co/400x250?text=WebGL',
    author: '郑十一',
    type: 'mixed',
    level: 'advanced',
    rating: 4.9,
    students: 412,
    views: 1800,
    completionRate: 58,
    popularity: 81,
    publishTime: '2023-04-10'
  }
])

// 根据筛选条件和排序方式获取排序后的课程
const rankedCourses = computed(() => {
  let filtered = [...coursesData.value]
  
  // 课程类型筛选
  if (filterForm.courseType) {
    filtered = filtered.filter(course => course.type === filterForm.courseType)
  }
  
  // 难度级别筛选
  if (filterForm.level) {
    filtered = filtered.filter(course => course.level === filterForm.level)
  }
  
  // 时间范围筛选（这里简化处理）
  if (filterForm.timeRange && filterForm.timeRange !== 'all') {
    // 实际应用中应该根据发布时间进行筛选
    // 这里只做简单示例
    const today = new Date()
    let startDate = new Date()
    
    switch (filterForm.timeRange) {
      case 'week':
        startDate.setDate(today.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(today.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(today.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1)
        break
    }
    
    // 假设publishTime的格式为'YYYY-MM-DD'
    filtered = filtered.filter(course => {
      const publishDate = new Date(course.publishTime)
      return publishDate >= startDate
    })
  }
  
  // 排序
  const sortProp = getSortProp()
  filtered.sort((a, b) => b[sortProp] - a[sortProp])
  
  return filtered
})

// 获取前N名课程
const topCourses = computed(() => {
  return rankedCourses.value.slice(0, 6)
})

// 页面加载
onMounted(() => {
  loadRankings()
})

// 加载排行榜数据
const loadRankings = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    loading.value = false
  }, 800)
}

// 刷新排行榜
const refreshRankings = () => {
  loadRankings()
  ElMessage.success('排行榜数据已刷新')
}

// 处理筛选
const handleFilter = () => {
  loadRankings()
}

// 重置筛选
const resetFilter = () => {
  filterForm.rankType = 'popularity'
  filterForm.courseType = ''
  filterForm.level = ''
  filterForm.timeRange = 'all'
  loadRankings()
}

// 获取排序的属性名
const getSortProp = () => {
  const map = {
    'popularity': 'popularity',
    'rating': 'rating',
    'students': 'students',
    'completion': 'completionRate',
    'newest': 'publishTime'
  }
  return map[filterForm.rankType] || 'popularity'
}

// 查看课程
const viewCourse = (course) => {
  router.push(`/dev/course-details?id=${course.id}`)
}

// 获取课程类型文本
const getTypeText = (type) => {
  const map = {
    'video': '视频课程',
    'document': '文档课程',
    'mixed': '混合课程'
  }
  return map[type] || '未知类型'
}

// 获取课程类型标签类型
const getTypeTagType = (type) => {
  const map = {
    'video': 'success',
    'document': 'primary',
    'mixed': 'warning'
  }
  return map[type] || 'info'
}

// 获取难度级别文本
const getLevelText = (level) => {
  const map = {
    'beginner': '入门',
    'elementary': '初级',
    'intermediate': '中级',
    'advanced': '高级',
    'expert': '专家'
  }
  return map[level] || '未知级别'
}

// 获取热门指数条的宽度
const getPopularityWidth = (popularity) => {
  return `${Math.min(popularity, 100)}%`
}
</script>

<style scoped>
.rankings-container {
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

.ranking-tabs {
  margin-top: 20px;
}

.course-info {
  display: flex;
  align-items: center;
}

.course-thumbnail {
  width: 80px;
  height: 45px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
}

.course-details {
  display: flex;
  flex-direction: column;
}

.course-title {
  font-weight: 500;
  margin-bottom: 6px;
}

.course-meta {
  display: flex;
  gap: 8px;
}

.rank-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #f2f6fc;
  color: #606266;
  font-weight: bold;
}

.rank-number.top-three {
  background-color: #e6a23c;
  color: white;
}

.rating {
  display: flex;
  align-items: center;
}

.rating-score {
  margin-left: 8px;
  color: #ff9900;
  font-weight: bold;
}

.popularity-indicator {
  position: relative;
  width: 100%;
  height: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.popularity-bar {
  height: 100%;
  background-color: #409eff;
  border-radius: 4px;
}

.popularity-value {
  position: absolute;
  top: 0;
  left: 8px;
  line-height: 20px;
  color: white;
  font-size: 12px;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

/* 卡片布局样式 */
.ranking-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

.ranking-card {
  position: relative;
}

.rank-badge {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #909399;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.rank-badge.top-three {
  background-color: #e6a23c;
}

.course-card {
  transition: all 0.3s;
  height: 100%;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.card-cover {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.card-cover :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.card-badges {
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  gap: 8px;
}

.card-content {
  padding: 16px;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-author {
  color: #606266;
  margin-bottom: 12px;
  font-size: 14px;
}

.card-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-stat {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

.card-stat :deep(.el-icon) {
  margin-right: 4px;
  font-size: 16px;
}

.card-popularity {
  margin-bottom: 16px;
}

.card-popularity .label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.card-action {
  width: 100%;
}
</style> 