import type { STATUS_CODE, USER_STATUS, PERMISSION_TYPE } from '@/api/constants'

// 基础实体类型
export interface BaseEntity {
  id: number
  createTime?: string
  updateTime?: string
}

// 状态类型
export type StatusType = typeof USER_STATUS[keyof typeof USER_STATUS]

// 权限类型
export type PermissionType = typeof PERMISSION_TYPE[keyof typeof PERMISSION_TYPE]

// 状态码类型
export type StatusCode = typeof STATUS_CODE[keyof typeof STATUS_CODE]

// 树形结构
export interface TreeNode<T> {
  id: number
  parentId?: number
  children?: TreeNode<T>[]
  [key: string]: any
}

// 分页查询参数
export interface PageQuery {
  page: number
  pageSize: number
  sortField?: string
  sortOrder?: 'ascend' | 'descend'
}

// 时间范围查询
export interface TimeRange {
  startTime?: string
  endTime?: string
}

// 基础查询参数
export interface BaseQuery extends PageQuery, TimeRange {
  keyword?: string
  status?: StatusType
  [key: string]: any
}

// 操作结果
export interface OperationResult {
  success: boolean
  message: string
  data?: any
} 