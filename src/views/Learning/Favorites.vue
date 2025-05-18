<template>
  <div class="favorites-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>我的收藏</h2>
          <el-input
            v-model="searchQuery"
            placeholder="搜索收藏"
            prefix-icon="Search"
            clearable
            @input="handleSearch"
            class="search-input"
          />
        </div>
      </template>
      
      <div v-if="favoriteVideos.length === 0" class="empty-state">
        <el-empty description="暂无收藏内容">
          <el-button type="primary" @click="goToHome">去学习平台探索</el-button>
        </el-empty>
      </div>
      
      <div v-else class="favorites-grid">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="(video, index) in favoriteVideos" :key="index" class="favorite-col">
            <el-card class="favorite-card" shadow="hover">
              <div class="favorite-thumbnail" @click="handleVideoClick(video)">
                <el-image :src="video.thumbnail" fit="cover"></el-image>
                <div class="favorite-duration">{{ formatDuration(video.duration) }}</div>
                <div class="favorite-progress">
                  <el-progress 
                    :percentage="video.progress" 
                    :status="video.progress >= 100 ? 'success' : ''"
                    :stroke-width="6"
                    :show-text="false"
                  ></el-progress>
                </div>
              </div>
              <div class="favorite-info">
                <h3 class="favorite-title" @click="handleVideoClick(video)">{{ video.title }}</h3>
                <div class="favorite-meta">
                  <span class="favorite-category">{{ video.category }}</span>
                  <el-button 
                    type="danger" 
                    :icon="Delete" 
                    circle 
                    size="small"
                    class="remove-button"
                    @click="removeFavorite(video)"
                  ></el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const searchQuery = ref('')

// 模拟数据
const favoriteVideos = ref([
  {
    id: 1,
    title: 'Vue3 组件化开发实战',
    thumbnail: 'https://via.placeholder.com/300x180?text=Vue3',
    duration: 5400,
    progress: 85,
    category: '前端开发'
  },
  {
    id: 2,
    title: 'React Hooks 最佳实践',
    thumbnail: 'https://via.placeholder.com/300x180?text=React',
    duration: 4200,
    progress: 100,
    category: '前端开发'
  },
  {
    id: 6,
    title: 'Python 数据分析',
    thumbnail: 'https://via.placeholder.com/300x180?text=Python',
    duration: 5100,
    progress: 100,
    category: '人工智能'
  },
  {
    id: 8,
    title: 'TypeScript 高级教程',
    thumbnail: 'https://via.placeholder.com/300x180?text=TypeScript',
    duration: 4800,
    progress: 50,
    category: '前端开发'
  }
])

// 格式化时长
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

// 搜索
const handleSearch = () => {
  // 实际应用中应该调用API搜索
  console.log('搜索:', searchQuery.value)
}

// 处理视频点击
const handleVideoClick = (video: any) => {
  router.push(`/video/${video.id}`)
}

// 移除收藏
const removeFavorite = (video: any) => {
  ElMessageBox.confirm(
    `确定要移除《${video.title}》吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实际应用中应该调用API移除收藏
    favoriteVideos.value = favoriteVideos.value.filter(item => item.id !== video.id)
    ElMessage.success('已从收藏中移除')
  }).catch(() => {})
}

// 跳转到首页
const goToHome = () => {
  router.push('/home')
}
</script>

<style scoped>
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
}

.search-input {
  width: 250px;
}

.empty-state {
  padding: 40px 0;
}

.favorites-grid {
  margin-top: 16px;
}

.favorite-col {
  margin-bottom: 20px;
}

.favorite-card {
  height: 100%;
  transition: transform 0.3s;
}

.favorite-card:hover {
  transform: translateY(-5px);
}

.favorite-thumbnail {
  position: relative;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 比例 */
}

.favorite-thumbnail :deep(.el-image) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.favorite-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.favorite-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

.favorite-info {
  padding: 12px 0 0 0;
}

.favorite-title {
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

.favorite-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.favorite-category {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

.remove-button {
  opacity: 0.6;
  transition: opacity 0.3s;
}

.remove-button:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-input {
    width: 100%;
    margin-top: 12px;
  }
}
</style> 