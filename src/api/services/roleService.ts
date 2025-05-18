import { BaseService } from '../baseService'
import { ROLE_API, PERMISSION_API, PERMISSION_TYPE } from '../constants'
import type { ApiResponse, PageResult } from '@/types/api'
import type { BaseEntity, BaseQuery, PermissionType } from '@/types/common'

export interface Role extends BaseEntity {
  name: string
  code: string
  description?: string
  status?: number
  permissions?: Permission[]
}

export interface Permission extends BaseEntity {
  name: string
  code: string
  type: PermissionType
  parentId?: number
  path?: string
  icon?: string
  sort?: number
}

export class RoleService extends BaseService {
  // 获取角色列表
  async getRoleList(params: BaseQuery): Promise<ApiResponse<PageResult<Role>>> {
    return this.get<ApiResponse<PageResult<Role>>>(ROLE_API.BASE, params)
  }

  // 获取所有角色
  async getAllRoles(): Promise<ApiResponse<Role[]>> {
    return this.get<ApiResponse<Role[]>>(ROLE_API.ALL)
  }

  // 创建角色
  async createRole(role: Partial<Role>): Promise<ApiResponse<Role>> {
    return this.post<ApiResponse<Role>>(ROLE_API.BASE, role)
  }

  // 更新角色
  async updateRole(id: number, role: Partial<Role>): Promise<ApiResponse<Role>> {
    return this.put<ApiResponse<Role>>(ROLE_API.DETAIL(id), role)
  }

  // 删除角色
  async deleteRole(id: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(ROLE_API.DETAIL(id))
  }

  // 获取角色权限
  async getRolePermissions(roleId: number): Promise<ApiResponse<Permission[]>> {
    return this.get<ApiResponse<Permission[]>>(ROLE_API.PERMISSIONS(roleId))
  }

  // 更新角色权限
  async updateRolePermissions(roleId: number, permissionIds: number[]): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>(ROLE_API.PERMISSIONS(roleId), { permissionIds })
  }

  // 获取所有权限
  async getAllPermissions(): Promise<ApiResponse<Permission[]>> {
    return this.get<ApiResponse<Permission[]>>(PERMISSION_API.ALL)
  }

  // 获取菜单权限
  async getMenuPermissions(): Promise<ApiResponse<Permission[]>> {
    const allPermissions = await this.getAllPermissions()
    return {
      ...allPermissions,
      data: allPermissions.data.filter(p => p.type === PERMISSION_TYPE.MENU)
    }
  }

  // 获取按钮权限
  async getButtonPermissions(): Promise<ApiResponse<Permission[]>> {
    const allPermissions = await this.getAllPermissions()
    return {
      ...allPermissions,
      data: allPermissions.data.filter(p => p.type === PERMISSION_TYPE.BUTTON)
    }
  }
}

export const roleService = new RoleService() 