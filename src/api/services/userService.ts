import { BaseService } from '@/api/baseService'
import { USER_API,USER_STATUS } from '@/api/constants'
import type { ApiResponse, PageResult } from '@/types/api'
import type { BaseEntity, BaseQuery, StatusType } from '@/types/common'

export interface User extends BaseEntity {
  username: string
  email: string
  avatar?: string
  roles?: string[]
  status?: StatusType
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  user: User
}

export class UserService extends BaseService {
  // 登录
  async login(params: LoginParams): Promise<ApiResponse<LoginResult>> {
    return this.post<ApiResponse<LoginResult>>(USER_API.LOGIN, params)
  }

  // 获取当前用户信息
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.get<ApiResponse<User>>(USER_API.ME)
  }

  // 获取用户列表
  async getUserList(params: BaseQuery): Promise<ApiResponse<PageResult<User>>> {
    return this.get<ApiResponse<PageResult<User>>>(USER_API.BASE, params)
  }

  // 创建用户
  async createUser(user: Partial<User>): Promise<ApiResponse<User>> {
    return this.post<ApiResponse<User>>(USER_API.BASE, user)
  }

  // 更新用户
  async updateUser(id: number, user: Partial<User>): Promise<ApiResponse<User>> {
    return this.put<ApiResponse<User>>(USER_API.DETAIL(id), user)
  }

  // 删除用户
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(USER_API.DETAIL(id))
  }

  // 批量删除用户
  async batchDeleteUsers(ids: number[]): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>(USER_API.BATCH_DELETE, { ids })
  }

  // 更新用户状态
  async updateUserStatus(id: number, status: StatusType): Promise<ApiResponse<void>> {
    return this.patch<ApiResponse<void>>(USER_API.UPDATE_STATUS(id), { status })
  }

  // 重置用户密码
  async resetUserPassword(id: number): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>(USER_API.RESET_PASSWORD(id))
  }

  // 启用用户
  async enableUser(id: number): Promise<ApiResponse<void>> {
    return this.updateUserStatus(id, USER_STATUS.ACTIVE)
  }

  // 禁用用户
  async disableUser(id: number): Promise<ApiResponse<void>> {
    return this.updateUserStatus(id, USER_STATUS.LOCKED)
  }
}

export const userService = new UserService() 