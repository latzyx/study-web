import { BaseModuleService } from './base/BaseModuleService'
import { API_PREFIX } from '../constants'
import type { ApiResponse } from '@/types/api'
import type { BaseEntity } from '@/types/common'

export interface Course extends BaseEntity {
  title: string
  description: string
  cover: string
  duration: number
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  tags: string[]
  price: number
  status: number
  instructor: {
    id: number
    name: string
    avatar: string
  }
}

export interface Lesson extends BaseEntity {
  courseId: number
  title: string
  description: string
  videoUrl: string
  duration: number
  sort: number
  status: number
}

export interface Progress extends BaseEntity {
  userId: number
  courseId: number
  lessonId: number
  status: 'not_started' | 'in_progress' | 'completed'
  progress: number
  lastPosition: number
}

export class LearningService extends BaseModuleService<Course> {
  protected readonly baseUrl = `${API_PREFIX}/courses`

  // 获取课程列表
  async getCourses(params: any): Promise<ApiResponse<Course[]>> {
    return this.get<ApiResponse<Course[]>>(this.baseUrl, params)
  }

  // 获取课程详情
  async getCourseDetail(id: number): Promise<ApiResponse<Course>> {
    return this.get<ApiResponse<Course>>(`${this.baseUrl}/${id}`)
  }

  // 获取课程章节
  async getCourseLessons(courseId: number): Promise<ApiResponse<Lesson[]>> {
    return this.get<ApiResponse<Lesson[]>>(`${this.baseUrl}/${courseId}/lessons`)
  }

  // 获取学习进度
  async getLearningProgress(courseId: number): Promise<ApiResponse<Progress[]>> {
    return this.get<ApiResponse<Progress[]>>(`${this.baseUrl}/${courseId}/progress`)
  }

  // 更新学习进度
  async updateProgress(data: Partial<Progress>): Promise<ApiResponse<Progress>> {
    return this.post<ApiResponse<Progress>>(`${API_PREFIX}/progress`, data)
  }

  // 获取推荐课程
  async getRecommendedCourses(): Promise<ApiResponse<Course[]>> {
    return this.get<ApiResponse<Course[]>>(`${this.baseUrl}/recommended`)
  }

  // 获取热门课程
  async getPopularCourses(): Promise<ApiResponse<Course[]>> {
    return this.get<ApiResponse<Course[]>>(`${this.baseUrl}/popular`)
  }

  // 搜索课程
  async searchCourses(keyword: string): Promise<ApiResponse<Course[]>> {
    return this.get<ApiResponse<Course[]>>(`${this.baseUrl}/search`, { keyword })
  }
}

export const learningService = new LearningService() 