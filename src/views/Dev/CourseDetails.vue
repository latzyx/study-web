<template>
  <div class="course-details-container">
    <!-- 页面头部 -->
    <el-card class="page-header">
      <div class="header-content">
        <div class="header-left">
          <el-button @click="goBack" link>
            <el-icon><ArrowLeft /></el-icon>返回
          </el-button>
          <h2>课程详情</h2>
        </div>
        <div class="header-actions">
          <el-button 
            :type="isEnrolled ? 'default' : 'primary'"
            @click="isEnrolled ? continueLearning() : enrollCourse()"
          >
            {{ isEnrolled ? '继续学习' : '立即报名' }}
          </el-button>
        </div>
      </div>
    </el-card>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    <div v-else class="course-content">
      <!-- 课程基本信息 -->
      <el-row :gutter="24">
        <el-col :span="16">
          <el-card class="course-main-info">
            <div class="course-header">
              <el-image 
                :src="courseData.coverUrl" 
                :alt="courseData.title"
                class="course-cover"
                fit="cover"
              />
              <div class="course-info">
                <h1>{{ courseData.title }}</h1>
                <div class="course-meta">
                  <el-tag size="small" :type="getTypeTagType(courseData.type)">
                    {{ getTypeText(courseData.type) }}
                  </el-tag>
                  <el-tag size="small" type="info">{{ getLevelText(courseData.level) }}</el-tag>
                  <div class="course-rating">
                    <el-rate
                      v-model="courseData.rating"
                      disabled
                      text-color="#ff9900"
                      score-template="{value}"
                    />
                    <span class="rating-score">{{ courseData.rating.toFixed(1) }}</span>
                  </div>
                </div>
                <div class="course-stats">
                  <div class="stat-item">
                    <el-icon><User /></el-icon>
                    <span>{{ courseData.students }} 名学员</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><View /></el-icon>
                    <span>{{ courseData.views }} 次浏览</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><Clock /></el-icon>
                    <span>{{ courseData.duration }} 学时</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 课程详细内容标签页 -->
          <el-card class="course-tabs-container">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="课程介绍" name="intro">
                <div class="course-description" v-html="courseData.description"></div>
              </el-tab-pane>

              <el-tab-pane label="课程大纲" name="outline">
                <el-collapse v-model="activeChapters">
                  <el-collapse-item v-for="chapter in courseData.chapters" 
                    :key="chapter.id" 
                    :title="chapter.title"
                    :name="chapter.id"
                  >
                    <div class="chapter-lessons">
                      <div v-for="lesson in chapter.lessons" 
                        :key="lesson.id" 
                        class="lesson-item"
                      >
                        <div class="lesson-info">
                          <el-icon><VideoPlay v-if="lesson.type === 'video'" /></el-icon>
                          <el-icon></el-icon>
                          <span>{{ lesson.title }}</span>
                        </div>
                        <div class="lesson-duration">{{ lesson.duration }}</div>
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </el-tab-pane>

              <el-tab-pane label="学习评价" name="reviews">
                <div class="reviews-container">
                  <div class="reviews-summary">
                    <div class="rating-overview">
                      <div class="rating-big">
                        <span class="rating-number">{{ courseData.rating.toFixed(1) }}</span>
                        <el-rate
                          v-model="courseData.rating"
                          disabled
                          text-color="#ff9900"
                        />
                      </div>
                      <div class="rating-distribution">
                        <div v-for="(count, index) in courseData.ratingDistribution" 
                          :key="index"
                          class="rating-bar"
                        >
                          <span class="star-label">{{ 5 - index }}星</span>
                          <el-progress 
                            :percentage="(count / courseData.students) * 100"
                            :stroke-width="12"
                            :show-text="false"
                          />
                          <span class="count-label">{{ count }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="reviews-list">
                    <el-empty v-if="courseData.reviews.length === 0" description="暂无评价" />
                    <div v-else>
                      <div v-for="review in courseData.reviews" 
                        :key="review.id" 
                        class="review-item"
                      >
                        <div class="review-header">
                          <el-avatar :src="review.userAvatar" />
                          <div class="review-user-info">
                            <div class="review-username">{{ review.username }}</div>
                            <div class="review-meta">
                              <el-rate
                                v-model="review.rating"
                                disabled
                                size="small"
                              />
                              <span class="review-time">{{ review.time }}</span>
                            </div>
                          </div>
                        </div>
                        <div class="review-content">{{ review.content }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>

        <!-- 右侧信息栏 -->
        <el-col :span="8">
          <el-card class="course-sidebar">
            <div class="instructor-info">
              <h3>课程讲师</h3>
              <div class="instructor-profile">
                <el-avatar :size="64" :src="courseData.instructor.avatar" />
                <div class="instructor-details">
                  <div class="instructor-name">{{ courseData.instructor.name }}</div>
                  <div class="instructor-title">{{ courseData.instructor.title }}</div>
                </div>
              </div>
              <div class="instructor-description">{{ courseData.instructor.description }}</div>
            </div>

            <el-divider />

            <div class="learning-progress" v-if="isEnrolled">
              <h3>学习进度</h3>
              <el-progress 
                :percentage="courseData.progress.percentage" 
                :format="percentageFormat"
              />
              <div class="progress-stats">
                <div class="progress-item">
                  <div class="label">已学习</div>
                  <div class="value">{{ courseData.progress.completed }}课时</div>
                </div>
                <div class="progress-item">
                  <div class="label">总课时</div>
                  <div class="value">{{ courseData.progress.total }}课时</div>
                </div>
                <div class="progress-item">
                  <div class="label">学习时长</div>
                  <div class="value">{{ courseData.progress.duration }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft,
  User,
  View,
  Clock,
  VideoPlay,
  Document
} from '@element-plus/icons-vue'
import type {
  CourseData,
  CourseType
} from '../../types/course'
import {
  CourseTypeTextMap,
  CourseTagTypeMap,
  CourseLevelTextMap
} from '../../types/course'

const router = useRouter()
const route = useRoute()

// 加载状态
const loading = ref(false)

// 当前激活的标签页
const activeTab = ref('intro')

// 展开的章节
const activeChapters = ref(['1'])

// 是否已报名
const isEnrolled = ref(false)

// 课程数据
const courseData = reactive<CourseData>({
  id: '1',
  title: 'Vue3 实战教程',
  coverUrl: 'https://placehold.co/800x450?text=Vue3',
  type: 'video',
  level: 'intermediate',
  rating: 4.8,
  students: 1289,
  views: 5640,
  duration: '25',
  description: `
    <h3>课程介绍</h3>
    <p>本课程将带你深入学习 Vue 3 的各项特性，从基础概念到高级应用，全面掌握 Vue 3 开发技能。</p>
    <h3>课程特点</h3>
    <ul>
      <li>系统化的 Vue 3 知识体系</li>
      <li>实战驱动的学习方式</li>
      <li>最佳实践和性能优化指南</li>
      <li>企业级项目开发经验</li>
    </ul>
    <h3>适合人群</h3>
    <p>本课程适合具有一定 JavaScript 基础，想要学习 Vue 3 的开发者。</p>
  `,
  chapters: [
    {
      id: '1',
      title: '第1章：Vue 3 基础入门',
      lessons: [
        { id: '1-1', title: '课程介绍', duration: '10:00', type: 'video' },
        { id: '1-2', title: 'Vue 3 新特性概述', duration: '15:00', type: 'video' },
        { id: '1-3', title: '开发环境搭建', duration: '20:00', type: 'video' }
      ]
    },
    {
      id: '2',
      title: '第2章：组合式 API',
      lessons: [
        { id: '2-1', title: 'setup 函数详解', duration: '25:00', type: 'video' },
        { id: '2-2', title: 'reactive 与 ref', duration: '20:00', type: 'video' },
        { id: '2-3', title: '生命周期钩子', duration: '15:00', type: 'video' }
      ]
    }
  ],
  ratingDistribution: [1000, 200, 50, 30, 9],
  reviews: [
    {
      id: 1,
      username: '张三',
      userAvatar: 'https://placehold.co/100x100?text=User',
      rating: 5,
      content: '课程内容非常详细，讲解清晰，很适合入门学习。',
      time: '2023-06-10'
    },
    {
      id: 2,
      username: '李四',
      userAvatar: 'https://placehold.co/100x100?text=User',
      rating: 4,
      content: '实战案例很有帮助，但是希望能有更多的练习题。',
      time: '2023-06-08'
    }
  ],
  instructor: {
    name: '张教授',
    title: '高级前端工程师',
    avatar: 'https://placehold.co/200x200?text=Teacher',
    description: '拥有10年前端开发经验，精通 Vue.js 技术栈，参与过多个大型项目开发。'
  },
  progress: {
    percentage: 35,
    completed: 5,
    total: 15,
    duration: '3小时25分钟'
  }
})

// 页面加载
onMounted(() => {
  loadCourseDetails()
})

// 加载课程详情
const loadCourseDetails = () => {
  loading.value = true
  const courseId = route.query.id

  // 模拟API请求
  setTimeout(() => {
    // 实际应用中这里应该根据courseId获取数据
    loading.value = false
    isEnrolled.value = Math.random() > 0.5 // 随机模拟是否已报名
  }, 800)
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 报名课程
const enrollCourse = () => {
  ElMessage.success('报名成功！')
  isEnrolled.value = true
}

// 继续学习
const continueLearning = () => {
  router.push(`/dev/course-learning?id=${courseData.id}`)
}

// 获取课程类型文本
const getTypeText = (type: CourseType): string => {
  return CourseTypeTextMap[type] || '未知类型'
}

// 获取课程类型标签类型
const getTypeTagType = (type: CourseType): string => {
  return CourseTagTypeMap[type] || 'info'
}

// 获取难度级别文本
const getLevelText = (level: string): string => {
  return CourseLevelTextMap[level as keyof typeof CourseLevelTextMap] || '未知级别'
}

// 进度条格式化
const percentageFormat = (percentage: number): string => {
  return percentage === 100 ? '已完成' : `${percentage}%`
}
</script>

<style scoped>
.course-details-container {
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

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
}

.loading-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.course-content {
  margin-top: 16px;
}

.course-main-info {
  margin-bottom: 24px;
}

.course-header {
  display: flex;
  gap: 24px;
}

.course-cover {
  width: 320px;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
}

.course-info {
  flex: 1;
}

.course-info h1 {
  margin: 0 0 16px 0;
  font-size: 24px;
}

.course-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.course-rating {
  display: flex;
  align-items: center;
}

.rating-score {
  margin-left: 8px;
  color: #ff9900;
  font-weight: bold;
}

.course-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.course-tabs-container {
  margin-bottom: 24px;
}

.course-description {
  line-height: 1.6;
}

.course-description h3 {
  margin: 24px 0 16px 0;
}

.course-description p {
  margin: 16px 0;
}

.course-description ul {
  padding-left: 24px;
}

.chapter-lessons {
  padding: 8px 0;
}

.lesson-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.lesson-item:hover {
  background-color: #f5f7fa;
}

.lesson-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lesson-duration {
  color: #909399;
  font-size: 14px;
}

.reviews-container {
  padding: 16px 0;
}

.reviews-summary {
  margin-bottom: 32px;
}

.rating-overview {
  display: flex;
  gap: 48px;
}

.rating-big {
  text-align: center;
}

.rating-number {
  font-size: 48px;
  font-weight: bold;
  color: #ff9900;
  line-height: 1;
  margin-bottom: 8px;
  display: block;
}

.rating-distribution {
  flex: 1;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.star-label {
  width: 40px;
  text-align: right;
}

.rating-bar :deep(.el-progress) {
  flex: 1;
  margin: 0;
}

.count-label {
  width: 40px;
}

.review-item {
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.review-user-info {
  flex: 1;
}

.review-username {
  font-weight: 500;
  margin-bottom: 4px;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.review-time {
  color: #909399;
  font-size: 14px;
}

.review-content {
  color: #606266;
  line-height: 1.6;
}

.course-sidebar {
  position: sticky;
  top: 16px;
}

.instructor-info h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.instructor-profile {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.instructor-details {
  flex: 1;
}

.instructor-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.instructor-title {
  color: #909399;
  font-size: 14px;
}

.instructor-description {
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
}

.learning-progress h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.progress-item {
  text-align: center;
}

.progress-item .label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 4px;
}

.progress-item .value {
  font-weight: 500;
}
</style> 