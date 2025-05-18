import { BaseModuleService } from './base/BaseModuleService'
import { API_PREFIX } from '../constants'
import type { ApiResponse } from '@/types/api'
import type { BaseEntity } from '@/types/common'

export interface Video extends BaseEntity {
  title: string
  description: string
  cover: string
  url: string
  duration: number
  size: number
  format: string
  resolution: string
  category: string
  tags: string[]
  status: number
  views: number
  likes: number
  comments: number
  uploader: {
    id: number
    name: string
    avatar: string
  }
}

export interface Comment extends BaseEntity {
  videoId: number
  userId: number
  content: string
  parentId?: number
  likes: number
  user: {
    id: number
    name: string
    avatar: string
  }
  replies?: Comment[]
}

export class VideoService extends BaseModuleService<Video> {
  protected readonly baseUrl = `${API_PREFIX}/videos`

  // 获取视频列表
  async getVideos(params: any): Promise<ApiResponse<Video[]>> {
    return this.get<ApiResponse<Video[]>>(this.baseUrl, params)
  }

  // 获取视频详情
  async getVideoDetail(id: number): Promise<ApiResponse<Video>> {
    return this.get<ApiResponse<Video>>(`${this.baseUrl}/${id}`)
  }

  // 获取视频评论
  async getVideoComments(videoId: number): Promise<ApiResponse<Comment[]>> {
    return this.get<ApiResponse<Comment[]>>(`${this.baseUrl}/${videoId}/comments`)
  }

  // 添加评论
  async addComment(data: Partial<Comment>): Promise<ApiResponse<Comment>> {
    return this.post<ApiResponse<Comment>>(`${API_PREFIX}/comments`, data)
  }

  // 点赞视频
  async likeVideo(videoId: number): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>(`${this.baseUrl}/${videoId}/like`)
  }

  // 取消点赞
  async unlikeVideo(videoId: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`${this.baseUrl}/${videoId}/like`)
  }

  // 获取推荐视频
  async getRecommendedVideos(): Promise<ApiResponse<Video[]>> {
    return this.get<ApiResponse<Video[]>>(`${this.baseUrl}/recommended`)
  }

  // 获取热门视频
  async getPopularVideos(): Promise<ApiResponse<Video[]>> {
    return this.get<ApiResponse<Video[]>>(`${this.baseUrl}/popular`)
  }

  // 搜索视频
  async searchVideos(keyword: string): Promise<ApiResponse<Video[]>> {
    return this.get<ApiResponse<Video[]>>(`${this.baseUrl}/search`, { keyword })
  }

  // 获取用户上传的视频
  async getUserVideos(userId: number): Promise<ApiResponse<Video[]>> {
    return this.get<ApiResponse<Video[]>>(`${API_PREFIX}/users/${userId}/videos`)
  }

  // 获取用户喜欢的视频
  async getUserLikedVideos(userId: number): Promise<ApiResponse<Video[]>> {
    return this.get<ApiResponse<Video[]>>(`${API_PREFIX}/users/${userId}/liked-videos`)
  }
}

export const videoService = new VideoService() 