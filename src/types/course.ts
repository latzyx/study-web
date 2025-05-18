// 课程状态类型
export type CourseStatus = 'developing' | 'published' | 'archived'

// 课程类型
export type CourseType = 'video' | 'document' | 'mixed'

// 课程难度级别
export type CourseLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'expert'

// 课程标签类型
export type CourseTagType = 'success' | 'primary' | 'warning' | 'info'

// 课时类型
export interface Lesson {
  id: string
  title: string
  duration?: string
  type: 'video' | 'document'
  description?: string
  videoUrl?: string
  documentUrl?: string
  resources?: Array<{
    name: string
    url: string
    type: string
  }>
}

// 章节类型
export interface Chapter {
  id: string
  title: string
  description?: string
  lessons: Lesson[]
  order?: number
}

// 评价类型
export interface Review {
  id: number
  username: string
  userAvatar?: string
  rating: number
  content: string
  time: string
  likes?: number
  replies?: Review[]
}

// 讲师类型
export interface Instructor {
  id?: number
  name: string
  title?: string
  avatar?: string
  description?: string
  courses?: number
  students?: number
  rating?: number
  tags?: string[]
  socialLinks?: {
    website?: string
    github?: string
    linkedin?: string
  }
}

// 学习进度类型
export interface Progress {
  percentage: number
  completed: number
  total: number
  duration?: string
  lastStudyTime?: string
  nextSection?: {
    id: string
    title: string
  }
}

// 课程数据类型
export interface CourseData {
  id: string
  title: string
  coverUrl: string
  type: CourseType
  level: CourseLevel
  rating: number
  students: number
  views: number
  duration?: string
  price?: number
  originalPrice?: number
  description: string
  objectives?: string[]
  requirements?: string[]
  chapters: Chapter[]
  ratingDistribution?: number[]
  reviews?: Review[]
  instructor: Instructor
  progress?: Progress
  category?: string
  tags?: string[]
  language?: string
  lastUpdated?: string
  certificate?: boolean
  featured?: boolean
}

// 类型映射
export const CourseTypeTextMap: Record<CourseType, string> = {
  'video': '视频课程',
  'document': '文档课程',
  'mixed': '混合课程'
}

export const CourseTagTypeMap: Record<CourseType, CourseTagType> = {
  'video': 'success',
  'document': 'primary',
  'mixed': 'warning'
}

export const CourseLevelTextMap: Record<CourseLevel, string> = {
  'beginner': '入门',
  'elementary': '初级',
  'intermediate': '中级',
  'advanced': '高级',
  'expert': '专家'
}

// 课程基本信息接口
export interface Course {
  id: number
  title: string
  description: string
  coverUrl: string
  status: CourseStatus
  progress: number
  updateTime: string
  type: CourseType
  views: number
  students: number
  category?: string
  level?: CourseLevel
  price?: number
  tags?: string[]
  featured?: boolean
}

// 课程表单接口
export interface CourseForm {
  title: string
  category?: string
  description: string
  coverUrl: string
  type?: CourseType
  level?: CourseLevel
  price?: number
  objectives?: string[]
  requirements?: string[]
  materials: CourseMaterial[]
  outline: CourseOutlineNode[]
  tags?: string[]
  featured?: boolean
}

// 课程资料接口
export interface CourseMaterial {
  id?: number
  name: string
  url: string
  size: number | string
  type?: string
  uploadTime?: string
  description?: string
  downloads?: number
  status?: 'active' | 'archived'
}

// 课程大纲节点接口
export interface CourseOutlineNode {
  id: number
  title: string
  description: string
  children?: CourseOutlineNode[]
  parentId?: number
  order?: number
  duration?: string
  type?: 'chapter' | 'section'
  status?: 'draft' | 'published'
}

// 课程预览数据接口
export interface CoursePreviewData extends Course {
  studentCount: number
  viewCount: number
  rating: number
  ratingCount: number
  outline: CourseOutlineNode[]
  materials: CourseMaterial[]
  feedbacks: CourseFeedback[]
  instructor?: Instructor
  objectives?: string[]
  requirements?: string[]
  category?: string
  language?: string
  lastUpdated?: string
  certificate?: boolean
}

// 课程反馈接口
export interface CourseFeedback {
  id: number
  userName: string
  userAvatar?: string
  rating: number
  content: string
  time: string
  likes?: number
  replies?: CourseFeedback[]
  images?: string[]
  tags?: string[]
}

// 上传响应接口
export interface UploadResponse {
  url: string
  name?: string
  size?: number
  type?: string
  status?: string
  message?: string
  [key: string]: any
}

// 树节点数据接口
export interface TreeNode {
  data: CourseOutlineNode
  parent: TreeNode
  children?: TreeNode[]
  level?: number
  expanded?: boolean
  disabled?: boolean
  visible?: boolean
} 