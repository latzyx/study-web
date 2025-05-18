<template>
  <div class="video-player-container">
    <el-row :gutter="24">
      <!-- 视频播放区域 -->
      <el-col :span="18">
        <el-card class="video-card">
          <div class="video-wrapper">
            <video
              ref="videoRef"
              class="video-element"
              :src="videoInfo.videoUrl"
              @timeupdate="handleTimeUpdate"
              @ended="handleVideoEnded"
              @loadedmetadata="handleVideoLoaded"
              controls
              controlsList="nodownload"
            ></video>
          </div>
          
          <div class="video-controls">
            <div class="progress-info">
              <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
              <el-progress 
                :percentage="progressPercentage" 
                :stroke-width="8"
                class="progress-bar"
              ></el-progress>
            </div>
            
            <div class="control-actions">
              <el-button 
                type="primary" 
                plain 
                icon="Star" 
                :class="{ 'is-favorited': isFavorited }"
                @click="toggleFavorite"
              >
                {{ isFavorited ? '已收藏' : '收藏' }}
              </el-button>
              
              <el-button 
                type="success" 
                plain 
                icon="Check" 
                :disabled="videoInfo.progress >= 100"
                @click="markAsCompleted"
              >
                标记为已完成
              </el-button>
              
              <el-button 
                type="warning" 
                plain 
                icon="Document" 
                @click="showNotes = true"
              >
                笔记
              </el-button>
            </div>
          </div>
          
          <div class="video-info">
            <h1 class="video-title">{{ videoInfo.title }}</h1>
            <div class="video-meta">
              <el-tag size="small">{{ videoInfo.category }}</el-tag>
              <el-tag type="info" size="small">{{ videoInfo.credits }} 学分</el-tag>
              <el-tag type="warning" size="small">{{ formatDuration(videoInfo.duration) }}</el-tag>
              <span class="view-count">{{ videoInfo.views }} 次观看</span>
            </div>
            <div class="instructor-info">
              <el-avatar :size="32" src="https://via.placeholder.com/32"></el-avatar>
              <span class="instructor-name">{{ videoInfo.instructor }}</span>
            </div>
            <el-divider></el-divider>
            <div class="video-description">
              <p>{{ videoInfo.description }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 推荐视频和学习进度 -->
      <el-col :span="6">
        <el-card class="learning-progress-card">
          <template #header>
            <div class="card-header">
              <h3>学习进度</h3>
            </div>
          </template>
          <div class="progress-circle-wrapper">
            <el-progress
              type="circle"
              :percentage="videoInfo.progress"
              :status="videoInfo.progress >= 100 ? 'success' : ''"
              :stroke-width="10"
            ></el-progress>
          </div>
          <div class="learning-stats">
            <div class="stat-item">
              <div class="stat-label">观看时间</div>
              <div class="stat-value">{{ formatTime(currentTime) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">学习次数</div>
              <div class="stat-value">{{ videoInfo.watchCount }} 次</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">最近观看</div>
              <div class="stat-value">{{ videoInfo.lastWatched }}</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="related-videos-card">
          <template #header>
            <div class="card-header">
              <h3>推荐视频</h3>
            </div>
          </template>
          <div class="related-video-list">
            <div 
              v-for="(video, index) in relatedVideos" 
              :key="index"
              class="related-video-item"
              @click="switchVideo(video)"
            >
              <div class="related-thumbnail">
                <el-image :src="video.thumbnail" fit="cover"></el-image>
                <span class="related-duration">{{ formatDuration(video.duration) }}</span>
              </div>
              <div class="related-info">
                <div class="related-title">{{ video.title }}</div>
                <div class="related-meta">
                  <span>{{ video.category }}</span>
                  <span>{{ formatDuration(video.duration) }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 笔记对话框 -->
    <el-dialog
      v-model="showNotes"
      title="学习笔记"
      width="50%"
    >
      <el-form>
        <el-form-item>
          <el-input
            v-model="notes"
            type="textarea"
            :rows="8"
            placeholder="记录下课程的要点..."
          ></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showNotes = false">取消</el-button>
          <el-button type="primary" @click="saveNotes">保存笔记</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const videoId = route.params.id

// 视频播放器引用
const videoRef = ref<HTMLVideoElement | null>(null)
const currentTime = ref(0)
const duration = ref(0)
const isFavorited = ref(false)
const showNotes = ref(false)
const notes = ref('')

// 进度百分比
const progressPercentage = computed(() => {
  if (duration.value === 0) return 0
  return Math.floor((currentTime.value / duration.value) * 100)
})

// 当前视频信息（模拟后端数据）
const videoInfo = ref({
  id: '1',
  title: 'Vue3 组件化开发实战',
  videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', // 示例视频
  thumbnail: 'https://via.placeholder.com/300x180?text=Vue3',
  duration: 5400, // 秒
  progress: 35,
  status: 'in-progress',
  category: '前端开发',
  credits: 5,
  views: 1250,
  instructor: '张教授',
  description: 'Vue3 组件化开发实战课程将帮助你掌握Vue3的核心概念和最佳实践。课程涵盖了Composition API、TypeScript集成、性能优化、单元测试等核心内容，适合有一定Vue基础的开发者进阶学习。',
  watchCount: 3,
  lastWatched: '2023-8-15'
})

// 推荐视频列表
const relatedVideos = ref([
  {
    id: '2',
    title: 'React Hooks 最佳实践',
    thumbnail: 'https://via.placeholder.com/300x180?text=React',
    duration: 4200,
    category: '前端开发'
  },
  {
    id: '3',
    title: 'TypeScript 高级教程',
    thumbnail: 'https://via.placeholder.com/300x180?text=TypeScript',
    duration: 4800,
    category: '前端开发'
  },
  {
    id: '4',
    title: 'Node.js 服务端开发',
    thumbnail: 'https://via.placeholder.com/300x180?text=Node.js',
    duration: 7200,
    category: '后端开发'
  },
  {
    id: '5',
    title: 'MongoDB 从入门到精通',
    thumbnail: 'https://via.placeholder.com/300x180?text=MongoDB',
    duration: 5400,
    category: '数据库'
  }
])

// 视频加载完成
const handleVideoLoaded = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
    
    // 如果有保存的播放位置，恢复到上次播放位置
    const savedTime = localStorage.getItem(`video_progress_${videoInfo.value.id}`)
    if (savedTime) {
      videoRef.value.currentTime = parseFloat(savedTime)
      currentTime.value = parseFloat(savedTime)
    }
  }
}

// 视频播放时间更新
const handleTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    
    // 保存当前播放进度到localStorage
    localStorage.setItem(`video_progress_${videoInfo.value.id}`, currentTime.value.toString())
    
    // 更新学习进度
    const newProgress = Math.floor((currentTime.value / duration.value) * 100)
    if (newProgress > videoInfo.value.progress) {
      videoInfo.value.progress = newProgress
      
      // 这里应该调用API保存进度到后端
      console.log('保存进度:', videoInfo.value.progress)
    }
  }
}

// 视频播放结束
const handleVideoEnded = () => {
  videoInfo.value.progress = 100
  ElMessage.success('恭喜你完成了本视频的学习！')
  
  // 这里应该调用API保存完成状态到后端
  console.log('视频播放完成')
}

// 格式化时间 (秒 -> HH:MM:SS)
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  const parts = []
  if (hours > 0) {
    parts.push(hours.toString().padStart(2, '0'))
  }
  parts.push(minutes.toString().padStart(2, '0'))
  parts.push(secs.toString().padStart(2, '0'))
  
  return parts.join(':')
}

// 格式化时长（用于显示）
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

// 切换收藏状态
const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
  
  // 这里应该调用API保存收藏状态到后端
  ElMessage.success(isFavorited.value ? '已添加到收藏' : '已取消收藏')
}

// 标记为已完成
const markAsCompleted = () => {
  videoInfo.value.progress = 100
  
  // 这里应该调用API保存完成状态到后端
  ElMessage.success('已标记为已完成')
}

// 保存笔记
const saveNotes = () => {
  // 这里应该调用API保存笔记到后端
  localStorage.setItem(`video_notes_${videoInfo.value.id}`, notes.value)
  ElMessage.success('笔记已保存')
  showNotes.value = false
}

// 切换视频
const switchVideo = (video: any) => {
  // 实际应用中应该跳转到对应视频的播放页
  ElMessage.info(`切换到视频: ${video.title}`)
  router.push({ path: `/video/${video.id}` })
}

// 组件加载时获取视频信息
onMounted(() => {
  // 这里应该调用API获取视频信息
  console.log('获取视频信息:', videoId)
  
  // 载入保存的笔记
  const savedNotes = localStorage.getItem(`video_notes_${videoInfo.value.id}`)
  if (savedNotes) {
    notes.value = savedNotes
  }
  
  // 检查收藏状态
  const favorites = localStorage.getItem('video_favorites')
  if (favorites) {
    const favoritesList = JSON.parse(favorites)
    isFavorited.value = favoritesList.includes(videoInfo.value.id)
  }
})

// 组件卸载前保存播放进度
onBeforeUnmount(() => {
  if (videoRef.value) {
    localStorage.setItem(`video_progress_${videoInfo.value.id}`, videoRef.value.currentTime.toString())
  }
})
</script>

<style scoped>
.video-player-container {
  width: 100%;
}

.video-card {
  margin-bottom: 24px;
}

.video-wrapper {
  position: relative;
  width: 100%;
  background-color: #000;
  overflow: hidden;
  border-radius: 4px;
}

.video-element {
  width: 100%;
  display: block;
}

.video-controls {
  margin: 16px 0;
}

.progress-info {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.progress-bar {
  margin-top: 8px;
}

.control-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.is-favorited {
  background-color: #fff7e6;
  color: #fa8c16;
  border-color: #fa8c16;
}

.video-info {
  margin-top: 24px;
}

.video-title {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 500;
}

.video-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.view-count {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

.instructor-info {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.instructor-name {
  margin-left: 12px;
  font-weight: 500;
}

.video-description {
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.6;
}

/* 右侧卡片样式 */
.learning-progress-card,
.related-videos-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.progress-circle-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.learning-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 500;
}

/* 推荐视频 */
.related-video-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.related-video-item {
  display: flex;
  cursor: pointer;
}

.related-thumbnail {
  position: relative;
  width: 120px;
  height: 68px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.related-duration {
  position: absolute;
  right: 4px;
  bottom: 4px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 12px;
}

.related-info {
  margin-left: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.related-title {
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.related-meta {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: space-between;
}

@media (max-width: 768px) {
  .learning-stats {
    grid-template-columns: repeat(1, 1fr);
  }
}

@media (max-width: 992px) {
  .video-player-container :deep(.el-row) {
    flex-direction: column;
  }
  
  .video-player-container :deep(.el-col) {
    width: 100%;
    max-width: 100%;
  }
}
</style> 