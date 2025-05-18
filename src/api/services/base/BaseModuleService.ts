import { BaseService } from '@/api/baseService'
import type { ApiResponse, PageResult } from '@/types/api'
import type { BaseQuery } from '@/types/common'

export abstract class BaseModuleService<T> extends BaseService {
  protected abstract readonly baseUrl: string

  // 获取列表
  async getList(params: BaseQuery): Promise<ApiResponse<PageResult<T>>> {
    return this.get<ApiResponse<PageResult<T>>>(this.baseUrl, params)
  }

  // 获取详情
  async getDetail(id: number): Promise<ApiResponse<T>> {
    return this.get<ApiResponse<T>>(`${this.baseUrl}/${id}`)
  }

  // 创建
  async create(data: Partial<T>): Promise<ApiResponse<T>> {
    return this.post<ApiResponse<T>>(this.baseUrl, data)
  }

  // 更新
  async update(id: number, data: Partial<T>): Promise<ApiResponse<T>> {
    return this.put<ApiResponse<T>>(`${this.baseUrl}/${id}`, data)
  }

  // 删除
  async deleteItem(id: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
  }

  // 批量删除
  async batchDelete(ids: number[]): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>(`${this.baseUrl}/batch-delete`, { ids })
  }
} 