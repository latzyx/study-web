import { BaseService } from '../baseService'
import type { ApiResponse } from '@/types/api'

export interface Menu {
  id: number
  name: string
  path: string
  component?: string
  redirect?: string
  meta?: {
    title: string
    icon?: string
    hidden?: boolean
    roles?: string[]
    keepAlive?: boolean
  }
  parentId?: number
  sort?: number
  children?: Menu[]
}

export class MenuService extends BaseService {
  private readonly baseUrl = '/api/menus'

  // 获取菜单树
  async getMenuTree(): Promise<ApiResponse<Menu[]>> {
    return this.get<ApiResponse<Menu[]>>(`${this.baseUrl}/tree`)
  }

  // 获取用户菜单
  async getUserMenus(): Promise<ApiResponse<Menu[]>> {
    return this.get<ApiResponse<Menu[]>>(`${this.baseUrl}/user`)
  }

  // 创建菜单
  async createMenu(menu: Partial<Menu>): Promise<ApiResponse<Menu>> {
    return this.post<ApiResponse<Menu>>(this.baseUrl, menu)
  }

  // 更新菜单
  async updateMenu(id: number, menu: Partial<Menu>): Promise<ApiResponse<Menu>> {
    return this.put<ApiResponse<Menu>>(`${this.baseUrl}/${id}`, menu)
  }

  // 删除菜单
  async deleteMenu(id: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
  }

  // 获取菜单详情
  async getMenuDetail(id: number): Promise<ApiResponse<Menu>> {
    return this.get<ApiResponse<Menu>>(`${this.baseUrl}/${id}`)
  }

  // 更新菜单排序
  async updateMenuSort(menuIds: number[]): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>(`${this.baseUrl}/sort`, { menuIds })
  }
}

export const menuService = new MenuService() 