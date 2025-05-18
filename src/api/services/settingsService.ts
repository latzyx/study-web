import { BaseService } from '../baseService'
import { API_PREFIX } from '../constants'
import type { ApiResponse } from '@/types/api'
import type { BaseEntity } from '@/types/common'

export interface SystemConfig extends BaseEntity {
  key: string
  value: string
  description: string
  type: 'string' | 'number' | 'boolean' | 'json'
  group: string
}

export interface Notification extends BaseEntity {
  title: string
  content: string
  type: 'system' | 'user' | 'course' | 'video'
  status: 'unread' | 'read'
  userId?: number
  targetId?: number
  targetType?: string
}

export class SettingsService extends BaseService {
  private readonly baseUrl = `${API_PREFIX}/settings`

  // 获取系统配置
  async getSystemConfigs(): Promise<ApiResponse<SystemConfig[]>> {
    return this.get<ApiResponse<SystemConfig[]>>(`${this.baseUrl}/system`)
  }

  // 更新系统配置
  async updateSystemConfig(key: string, value: any): Promise<ApiResponse<void>> {
    return this.put<ApiResponse<void>>(`${this.baseUrl}/system/${key}`, { value })
  }

  // 获取用户配置
  async getUserSettings(): Promise<ApiResponse<Record<string, any>>> {
    return this.get<ApiResponse<Record<string, any>>>(`${this.baseUrl}/user`)
  }

  // 更新用户配置
  async updateUserSettings(settings: Record<string, any>): Promise<ApiResponse<void>> {
    return this.put<ApiResponse<void>>(`${this.baseUrl}/user`, settings)
  }

  // 获取通知列表
  async getNotifications(params: any): Promise<ApiResponse<Notification[]>> {
    return this.get<ApiResponse<Notification[]>>(`${this.baseUrl}/notifications`, params)
  }

  // 标记通知为已读
  async markNotificationAsRead(id: number): Promise<ApiResponse<void>> {
    return this.put<ApiResponse<void>>(`${this.baseUrl}/notifications/${id}/read`)
  }

  // 标记所有通知为已读
  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return this.put<ApiResponse<void>>(`${this.baseUrl}/notifications/read-all`)
  }

  // 删除通知
  async deleteNotification(id: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`${this.baseUrl}/notifications/${id}`)
  }

  // 获取未读通知数量
  async getUnreadNotificationCount(): Promise<ApiResponse<number>> {
    return this.get<ApiResponse<number>>(`${this.baseUrl}/notifications/unread-count`)
  }

  // 获取系统日志
  async getSystemLogs(params: any): Promise<ApiResponse<any[]>> {
    return this.get<ApiResponse<any[]>>(`${this.baseUrl}/logs`, params)
  }

  // 清除系统日志
  async clearSystemLogs(): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`${this.baseUrl}/logs`)
  }
}

export const settingsService = new SettingsService() 