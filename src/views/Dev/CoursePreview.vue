<template>
  <div class="course-preview">
    <el-card class="preview-card">
      <template #header>
        <div class="card-header">
          <span>课程预览</span>
          <div class="header-actions">
            <el-button type="primary" @click="editCourse">编辑课程</el-button>
            <el-button @click="$router.go(-1)">返回</el-button>
          </div>
        </div>
      </template>

      <div class="course-info">
        <div class="course-header">
          <div class="course-cover">
            <img :src="courseData.coverUrl" alt="课程封面" />
          </div>
          <div class="course-meta">
            <h1 class="course-title">{{ courseData.title }}</h1>
            <div class="course-category">
              <el-tag>{{ courseData.category }}</el-tag>
            </div>
            <div class="course-stats">
              <span class="stat-item">
                <el-icon><User /></el-icon>
                {{ courseData.studentCount }} 名学员
              </span>
              <span class="stat-item">
                <el-icon><View /></el-icon>
                {{ courseData.viewCount }} 次浏览
              </span>
              <span class="stat-item">
                <el-icon><Star /></el-icon>
                {{ courseData.rating }} 分
              </span>
            </div>
            <p class="course-description">{{ courseData.description }}</p>
          </div>
        </div>

        <el-tabs class="course-tabs">
          <el-tab-pane label="课程大纲">
            <div class="course-outline">
              <el-tree
                :data="courseData.outline"
                node-key="id"
                default-expand-all
              >
                <template #default="{ node, data }">
                  <div class="outline-node">
                    <span class="node-title">{{ data.title }}</span>
                    <span class="node-description">{{ data.description }}</span>
                  </div>
                </template>
              </el-tree>
            </div>
          </el-tab-pane>

          <el-tab-pane label="课程资料">
            <div class="course-materials">
              <el-table :data="courseData.materials" style="width: 100%">
                <el-table-column prop="name" label="文件名" />
                <el-table-column prop="size" label="大小" width="120" />
                <el-table-column prop="uploadTime" label="上传时间" width="180" />
                <el-table-column label="操作" width="150">
                  <template #default="{ row }">
                    <el-button type="text" @click="previewMaterial(row)">预览</el-button>
                    <el-button type="text" @click="downloadMaterial(row)">下载</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <el-tab-pane label="评价反馈">
            <div class="course-feedback">
              <div class="rating-overview">
                <div class="rating-score">
                  <h2>{{ courseData.rating }}</h2>
                  <el-rate
                    v-model="courseData.rating"
                    disabled
                    show-score
                    text-color="#ff9900"
                  />
                  <p>{{ courseData.ratingCount }} 人评分</p>
                </div>
                <div class="rating-distribution">
                  <div v-for="(item, index) in ratingDistribution" :key="index" class="rating-bar">
                    <span class="star-label">{{ 5 - index }} 星</span>
                    <el-progress
                      :percentage="item"
                      :stroke-width="12"
                      :show-text="false"
                    />
                    <span class="percentage">{{ item }}%</span>
                  </div>
                </div>
              </div>

              <div class="feedback-list">
                <el-timeline>
                  <el-timeline-item
                    v-for="feedback in courseData.feedbacks"
                    :key="feedback.id"
                    :timestamp="feedback.time"
                  >
                    <div class="feedback-item">
                      <div class="feedback-header">
                        <span class="user-name">{{ feedback.userName }}</span>
                        <el-rate
                          v-model="feedback.rating"
                          disabled
                          size="small"
                        />
                      </div>
                      <p class="feedback-content">{{ feedback.content }}</p>
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, View, Star } from '@element-plus/icons-vue'
import type { CoursePreviewData, CourseMaterial } from '@/types/course'

const router = useRouter()

// 模拟数据，实际应该从API获取
const courseData = ref<CoursePreviewData>({
  id: 1,
  title: '前端开发实战课程',
  category: '前端开发',
  description: '这是一个综合性的前端开发课程，涵盖HTML、CSS、JavaScript等核心技术...',
  coverUrl: 'https://example.com/course-cover.jpg',
  studentCount: 1234,
  viewCount: 5678,
  rating: 4.5,
  ratingCount: 328,
  status: 'published',
  progress: 100,
  updateTime: '2024-03-15',
  type: 'video',
  views: 5678,
  students: 1234,
  outline: [
    {
      id: 1,
      title: '第一章：课程介绍',
      description: '课程概述和学习目标',
      children: [
        {
          id: 11,
          title: '1.1 课程概述',
          description: '介绍课程内容和学习路线'
        }
      ]
    }
  ],
  materials: [
    {
      name: '课程大纲.pdf',
      size: '2.5MB',
      uploadTime: '2024-03-15 10:30:00',
      url: 'https://example.com/materials/outline.pdf'
    }
  ],
  feedbacks: [
    {
      id: 1,
      userName: '张三',
      rating: 5,
      content: '课程内容很充实，讲解清晰，非常满意！',
      time: '2024-03-14 15:30:00'
    }
  ]
})

// 评分分布数据
const ratingDistribution = ref([60, 25, 10, 4, 1])

// 编辑课程
const editCourse = () => {
  router.push(`/dev/course-edit/${courseData.value.id}`)
}

// 预览课程资料
const previewMaterial = (material: CourseMaterial) => {
  window.open(material.url, '_blank')
}

// 下载课程资料
const downloadMaterial = (material: CourseMaterial) => {
  const link = document.createElement('a')
  link.href = material.url
  link.download = material.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  // TODO: 从API获取课程数据
})
</script>

<style scoped>
.course-preview {
  padding: 20px;
}

.preview-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.course-header {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.course-cover {
  width: 300px;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-meta {
  flex: 1;
}

.course-title {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.course-category {
  margin-bottom: 15px;
}

.course-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
}

.course-description {
  color: #666;
  line-height: 1.6;
}

.course-tabs {
  margin-top: 20px;
}

.outline-node {
  display: flex;
  flex-direction: column;
}

.node-title {
  font-weight: bold;
}

.node-description {
  color: #666;
  font-size: 14px;
  margin-top: 4px;
}

.rating-overview {
  display: flex;
  gap: 40px;
  margin-bottom: 30px;
}

.rating-score {
  text-align: center;
}

.rating-score h2 {
  font-size: 36px;
  margin: 0 0 10px 0;
  color: #ff9900;
}

.rating-distribution {
  flex: 1;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.star-label {
  width: 40px;
}

.percentage {
  width: 40px;
  text-align: right;
}

.feedback-list {
  margin-top: 20px;
}

.feedback-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-name {
  font-weight: bold;
}

.feedback-content {
  margin: 0;
  color: #666;
  line-height: 1.6;
}
</style> 