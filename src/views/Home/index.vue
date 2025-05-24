<template>
  <div class="home-container">
    <!-- 数据统计轮播 -->
    <el-card class="stats-carousel-card">
      <el-carousel :interval="4000" type="card" height="200px">
        <el-carousel-item v-for="(stat, index) in statisticsData" :key="index">
          <div class="stat-card" :style="{ backgroundColor: stat.bgColor }">
            <div class="stat-icon">
              <el-icon :size="40" :color="stat.iconColor">
                <component :is="stat.icon"></component>
              </el-icon>
            </div>
            <div class="stat-content">
              <h3 class="stat-title">{{ stat.title }}</h3>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-desc">{{ stat.description }}</div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </el-card>

    <!-- 学习平台区域 -->
    <el-card class="learning-platform-card">
      <template #header>
        <div class="card-header">
          <h2>学习平台</h2>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索视频"
            prefix-icon="Search"
            class="search-input"
            clearable
            @input="handleSearch"
          />
        </div>
      </template>

      <div class="filter-section">
        <el-select v-model="filterCategory" placeholder="课程分类" class="filter-select">
          <el-option label="全部" value=""></el-option>
          <el-option v-for="category in categories" :key="category.value" :label="category.label" :value="category.value"></el-option>
        </el-select>
        <el-select v-model="filterStatus" placeholder="学习状态" class="filter-select">
          <el-option label="全部" value=""></el-option>
          <el-option label="已完成" value="completed"></el-option>
          <el-option label="进行中" value="in-progress"></el-option>
          <el-option label="未开始" value="not-started"></el-option>
        </el-select>
        <el-button type="primary" @click="handleSearch">筛选</el-button>
      </div>

      <!-- 视频卡片列表 -->
      <div class="video-list">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="video in videoList" :key="video.id" class="video-column">
            <el-card class="video-card" shadow="hover">
              <div class="video-thumbnail" @click="goToVideoDetail(video.id)">
                <el-image :src="video.cover" fit="cover"></el-image>
                <div class="video-duration">{{ formatDuration(video.duration) }}</div>
              </div>
              <div class="video-info">
                <h3 class="video-title" @click="goToVideoDetail(video.id)">{{ video.title }}</h3>
                <div class="video-meta">
                  <span class="video-category">{{ getCategoryLabel(video.category) }}</span>
                  <el-tag
                      :type="getStatusType(video.status)"
                    size="small"
                  >
                    {{ getStatusText(video.status) }}
                  </el-tag>
                </div>
                <div class="video-description">{{ video.description }}</div>
                <div class="video-footer">
                  <span class="video-instructor">
                    <el-icon><User/></el-icon>
                    {{ video.instructor.name }}
                  </span>
                  <span class="video-level">
                    <el-icon><Star/></el-icon>
                    {{ video.level }}
                  </span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 分页控件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalVideos"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import type {Course} from '@/api/services/learningService'
import {LearningService} from '@/api/services/learningService'
import {ElMessage} from 'element-plus'

const router = useRouter()
const learningService = new LearningService()

// 统计数据
const statisticsData = ref([
  {
    title: '本月观看视频',
    value: '0 个',
    description: '暂无数据',
    icon: 'VideoPlay',
    bgColor: '#e6f7ff',
    iconColor: '#1890ff'
  },
  {
    title: '待完成学习',
    value: '0 个',
    description: '暂无数据',
    icon: 'Clock',
    bgColor: '#fff7e6',
    iconColor: '#fa8c16'
  },
  {
    title: '总学习时长',
    value: '0 小时',
    description: '暂无数据',
    icon: 'Clock',
    bgColor: '#f6ffed',
    iconColor: '#52c41a'
  },
  {
    title: '最近观看',
    value: '暂无',
    description: '暂无数据',
    icon: 'View',
    bgColor: '#f9f0ff',
    iconColor: '#722ed1'
  }
])

// 课程分类
const categories = [
  { label: '前端开发', value: 'frontend' },
  { label: '后端开发', value: 'backend' },
  { label: '移动开发', value: 'mobile' },
  { label: '数据库', value: 'database' },
  { label: '云计算', value: 'cloud' },
  { label: '人工智能', value: 'ai' }
]

// 搜索和筛选
const searchKeyword = ref('')
const filterCategory = ref('')
const filterStatus = ref('')

// 分页数据
const currentPage = ref(1)
const pageSize = ref(12)
const totalVideos = ref(0)

// 视频列表数据
const videoList = ref<Course[]>([])
const loading = ref(false)

// 初始化
onMounted(async () => {
  await fetchVideoList()
  await fetchStatistics()
})

// 获取视频列表
const fetchVideoList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      category: filterCategory.value,
      status: filterStatus.value
    }
    const response = await learningService.getCourses(params)
    if (response.data) {
      videoList.value = response.data
      totalVideos.value = response.data.length
    }
  } catch (error) {
    console.error('Failed to fetch video list:', error)
    ElMessage.error('获取视频列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const response = await learningService.getLearningProgress(0) // 获取总体学习进度
    if (response.data && response.data.length > 0) {
      const stats = response.data[0]

      // 更新统计数据
      statisticsData.value[0].value = `${stats.progress || 0}%`
      statisticsData.value[0].description = stats.status === 'completed' ? '已完成' : '学习中'

      statisticsData.value[1].value = `${stats.progress < 100 ? 1 : 0} 个`
      statisticsData.value[1].description = stats.status === 'in_progress' ? '继续学习' : '暂无数据'

      statisticsData.value[2].value = `${stats.progress || 0}%`
      statisticsData.value[2].description = stats.lastPosition ? `上次学习位置: ${stats.lastPosition}` : '暂无数据'

      if (stats.status === 'in_progress') {
        statisticsData.value[3].value = '继续学习'
        statisticsData.value[3].description = `进度: ${stats.progress}%`
      }
    }
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchVideoList()
}

// 处理重置
const handleReset = () => {
  searchKeyword.value = ''
  filterCategory.value = ''
  filterStatus.value = ''
  handleSearch()
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchVideoList()
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchVideoList()
}

// 格式化视频时长
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const result = []
  
  if (hours > 0) {
    result.push(`${hours}时`)
  }
  
  result.push(`${minutes}分`)
  
  return result.join('')
}

// 获取分类标签
const getCategoryLabel = (value: string) => {
  const category = categories.find(c => c.value === value)
  return category ? category.label : value
}

// 获取状态标签样式
const getStatusType = (status: number) => {
  switch (status) {
    case 1:
      return 'success' // 已完成
    case 2:
      return 'warning' // 学习中
    case 0:
      return 'info'    // 未开始
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 1:
      return '已完成'
    case 2:
      return '学习中'
    case 0:
      return '未开始'
    default:
      return '未知'
  }
}

// 跳转到视频详情
const goToVideoDetail = (id: number) => {
  router.push(`/video/${id}`)
}
</script>

<style scoped>
.home-container {
  width: 100%;
}

/* 统计轮播样式 */
.stats-carousel-card {
  margin-bottom: 24px;
  background-color: transparent;
}

.stats-carousel-card :deep(.el-card__body) {
  padding: 0;
}

.stat-card {
  height: 100%;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  margin-right: 20px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  width: 70px;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 16px;
  margin: 0 0 8px 0;
  font-weight: normal;
  color: rgba(0, 0, 0, 0.65);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.85);
}

.stat-desc {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}

/* 学习平台样式 */
.learning-platform-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  margin-right: 20px;
}

.search-input {
  width: 250px;
}

.filter-section {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-select {
  width: 180px;
}

/* 视频卡片样式 */
.video-list {
  margin-bottom: 24px;
}

.video-column {
  margin-bottom: 20px;
}

.video-card {
  height: 100%;
  transition: transform 0.3s;
}

.video-card:hover {
  transform: translateY(-5px);
}

.video-thumbnail {
  position: relative;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 比例 */
}

.video-thumbnail :deep(.el-image) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.video-info {
  padding: 12px 0 0 0;
}

.video-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  line-height: 1.4;
  height: 44.8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;

  -webkit-box-orient: vertical;
  cursor: pointer;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

.video-description {
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.45);
}

.video-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-header h2 {
    margin-bottom: 16px;
  }
  
  .search-input {
    width: 100%;
    margin-bottom: 16px;
  }
  
  .filter-section {
    flex-direction: column;
  }
  
  .filter-select {
    width: 100%;
  }
}
</style> 