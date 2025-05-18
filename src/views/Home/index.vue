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
              <div class="video-thumbnail" @click="handleVideoClick(video)">
                <el-image :src="video.thumbnail" fit="cover"></el-image>
                <div class="video-duration">{{ formatDuration(video.duration) }}</div>
                <div v-if="video.status !== 'not-started'" class="video-progress">
                  <el-progress 
                    :percentage="video.progress" 
                    :status="video.status === 'completed' ? 'success' : ''"
                    :stroke-width="6"
                    :show-text="false"
                  ></el-progress>
                </div>
              </div>
              <div class="video-info">
                <h3 class="video-title" @click="handleVideoClick(video)">{{ video.title }}</h3>
                <div class="video-meta">
                  <span class="video-category">{{ getCategoryLabel(video.category) }}</span>
                  <span class="video-credits">{{ video.credits }} 学分</span>
                </div>
                <div class="video-status">
                  <el-tag 
                    :type="getStatusType(video.status)" 
                    size="small"
                  >
                    {{ getStatusText(video) }}
                  </el-tag>
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
import { ref,  onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 统计数据
const statisticsData = [
  {
    title: '本月观看视频',
    value: '48 个',
    description: '比上月增长 12%',
    icon: 'VideoPlay',
    bgColor: '#e6f7ff',
    iconColor: '#1890ff'
  },
  {
    title: '待完成学习',
    value: '15 个',
    description: '剩余约 8 小时',
    icon: 'Clock',
    bgColor: '#fff7e6',
    iconColor: '#fa8c16'
  },
  {
    title: '总学习时长',
    value: '124 小时',
    description: '持续学习 45 天',
    icon: 'Clock',
    bgColor: '#f6ffed',
    iconColor: '#52c41a'
  },
  {
    title: '最近观看',
    value: 'Vue3 深入浅出',
    description: '3 天前继续学习',
    icon: 'View',
    bgColor: '#f9f0ff',
    iconColor: '#722ed1'
  }
]

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
const totalVideos = ref(100) // 假设总共有100个视频

// 视频列表数据（模拟后端分页数据）
const videoList = ref([
  {
    id: 1,
    title: 'Vue3 组件化开发实战',
    thumbnail: 'https://via.placeholder.com/300x180?text=Vue3',
    duration: 5400, // 秒
    progress: 85,
    status: 'in-progress',
    category: 'frontend',
    credits: 5
  },
  {
    id: 2,
    title: 'React Hooks 最佳实践',
    thumbnail: 'https://via.placeholder.com/300x180?text=React',
    duration: 4200,
    progress: 100,
    status: 'completed',
    category: 'frontend',
    credits: 4
  },
  {
    id: 3,
    title: 'Node.js 服务端开发',
    thumbnail: 'https://via.placeholder.com/300x180?text=Node.js',
    duration: 7200,
    progress: 0,
    status: 'not-started',
    category: 'backend',
    credits: 6
  },
  {
    id: 4,
    title: 'MySQL 数据库优化',
    thumbnail: 'https://via.placeholder.com/300x180?text=MySQL',
    duration: 3600,
    progress: 30,
    status: 'in-progress',
    category: 'database',
    credits: 3
  },
  {
    id: 5,
    title: 'Flutter 跨平台开发',
    thumbnail: 'https://via.placeholder.com/300x180?text=Flutter',
    duration: 6300,
    progress: 0,
    status: 'not-started',
    category: 'mobile',
    credits: 5
  },
  {
    id: 6,
    title: 'Python 数据分析',
    thumbnail: 'https://via.placeholder.com/300x180?text=Python',
    duration: 5100,
    progress: 100,
    status: 'completed',
    category: 'ai',
    credits: 4
  },
  {
    id: 7,
    title: 'Docker 容器化部署',
    thumbnail: 'https://via.placeholder.com/300x180?text=Docker',
    duration: 4500,
    progress: 0,
    status: 'not-started',
    category: 'cloud',
    credits: 4
  },
  {
    id: 8,
    title: 'TypeScript 高级教程',
    thumbnail: 'https://via.placeholder.com/300x180?text=TypeScript',
    duration: 4800,
    progress: 50,
    status: 'in-progress',
    category: 'frontend',
    credits: 5
  },
  {
    id: 9,
    title: 'Spring Boot 实战',
    thumbnail: 'https://via.placeholder.com/300x180?text=Spring',
    duration: 7800,
    progress: 100,
    status: 'completed',
    category: 'backend',
    credits: 6
  },
  {
    id: 10,
    title: 'MongoDB 从入门到精通',
    thumbnail: 'https://via.placeholder.com/300x180?text=MongoDB',
    duration: 5400,
    progress: 0,
    status: 'not-started',
    category: 'database',
    credits: 5
  },
  {
    id: 11,
    title: 'React Native 移动应用开发',
    thumbnail: 'https://via.placeholder.com/300x180?text=React+Native',
    duration: 6600,
    progress: 20,
    status: 'in-progress',
    category: 'mobile',
    credits: 6
  },
  {
    id: 12,
    title: 'AWS 云服务架构',
    thumbnail: 'https://via.placeholder.com/300x180?text=AWS',
    duration: 9000,
    progress: 0,
    status: 'not-started',
    category: 'cloud',
    credits: 8
  },
])

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
const getStatusType = (status: string) => {
  switch (status) {
    case 'completed': return 'success'
    case 'in-progress': return 'warning'
    case 'not-started': return 'info'
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (video: any) => {
  switch (video.status) {
    case 'completed': return '已完成'
    case 'in-progress': return `已学习 ${video.progress}%`
    case 'not-started': return '未学习'
    default: return '未知状态'
  }
}

// 处理视频点击
const handleVideoClick = (video: any) => {
  console.log('点击视频:', video)
  // 跳转到视频播放页面
  router.push(`/video/${video.id}`)
}

// 处理搜索
const handleSearch = () => {
  // 这里应该调用后端API进行搜索和筛选
  console.log('搜索关键词:', searchKeyword.value)
  console.log('筛选分类:', filterCategory.value)
  console.log('筛选状态:', filterStatus.value)
  
  // 重置分页
  currentPage.value = 1
  
  // 模拟API调用
  fetchVideoList()
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

// 模拟从后端获取视频列表
const fetchVideoList = () => {
  // 这里应该根据当前的分页、搜索和筛选条件调用后端API
  console.log('获取视频列表:', {
    page: currentPage.value,
    pageSize: pageSize.value,
    keyword: searchKeyword.value,
    category: filterCategory.value,
    status: filterStatus.value
  })
  
  // 这里只是模拟数据，实际应该从后端获取
  // videoList.value = ...
}

onMounted(() => {
  // 初始加载视频列表
  fetchVideoList()
})
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

.video-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
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

.video-status {
  margin-top: 8px;
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