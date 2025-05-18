<template>
  <div class="learning-history">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>学习记录</h2>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="最近学习" name="recent">
          <el-empty v-if="recentVideos.length === 0" description="暂无学习记录" />
          <div v-else class="history-list">
            <div v-for="(video, index) in recentVideos" :key="index" class="history-item">
              <div class="history-thumbnail" @click="handleVideoClick(video)">
                <el-image :src="video.thumbnail" fit="cover"></el-image>
                <div class="history-progress">
                  <el-progress 
                    :percentage="video.progress" 
                    :status="video.progress >= 100 ? 'success' : ''"
                    :stroke-width="4"
                    :show-text="false"
                  ></el-progress>
                </div>
              </div>
              <div class="history-info">
                <h3 class="history-title" @click="handleVideoClick(video)">{{ video.title }}</h3>
                <div class="history-meta">
                  <span class="history-category">{{ video.category }}</span>
                  <span class="history-time">{{ video.lastWatched }}</span>
                </div>
                <div class="history-progress-text">
                  <span v-if="video.progress >= 100">已完成</span>
                  <span v-else>已学习 {{ video.progress }}%</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="已完成" name="completed">
          <el-empty v-if="completedVideos.length === 0" description="暂无已完成课程" />
          <div v-else class="history-list">
            <!-- 已完成课程列表 -->
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="学习中" name="inProgress">
          <el-empty v-if="inProgressVideos.length === 0" description="暂无学习中课程" />
          <div v-else class="history-list">
            <!-- 学习中课程列表 -->
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('recent')

// 模拟数据
const recentVideos = ref([
  {
    id: 1,
    title: 'Vue3 组件化开发实战',
    thumbnail: 'https://via.placeholder.com/300x180?text=Vue3',
    category: '前端开发',
    progress: 85,
    lastWatched: '昨天 14:30'
  },
  {
    id: 2,
    title: 'React Hooks 最佳实践',
    thumbnail: 'https://via.placeholder.com/300x180?text=React',
    category: '前端开发',
    progress: 100,
    lastWatched: '3天前'
  },
  {
    id: 3,
    title: 'Node.js 服务端开发',
    thumbnail: 'https://via.placeholder.com/300x180?text=Node.js',
    category: '后端开发',
    progress: 30,
    lastWatched: '上周'
  }
])

const completedVideos = ref([])
const inProgressVideos = ref([])

// 处理视频点击
const handleVideoClick = (video: any) => {
  router.push(`/video/${video.id}`)
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  display: flex;
  padding: 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
  border-bottom: 1px solid #f0f0f0;
}

.history-item:hover {
  background-color: #f9f9f9;
}

.history-thumbnail {
  position: relative;
  width: 160px;
  height: 90px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
}

.history-thumbnail :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.history-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

.history-info {
  margin-left: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.history-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  cursor: pointer;
}

.history-title:hover {
  color: #409eff;
}

.history-meta {
  display: flex;
  justify-content: space-between;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  margin-bottom: 8px;
}

.history-progress-text {
  color: #409eff;
  font-size: 14px;
}

@media (max-width: 768px) {
  .history-item {
    flex-direction: column;
  }
  
  .history-thumbnail {
    width: 100%;
    height: 0;
    padding-bottom: 56.25%;
  }
  
  .history-info {
    margin-left: 0;
    margin-top: 12px;
  }
}
</style> 