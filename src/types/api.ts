// API 响应基础类型
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
    trace_id: string
}

// 分页结果类型
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 分页查询参数
export interface PageQuery {
  page?: number
  pageSize?: number
  sortField?: string
  sortOrder?: 'ascend' | 'descend'
}

// 基础查询参数
export interface BaseQuery extends PageQuery {
  keyword?: string
  status?: number
  [key: string]: any
}

// 基础实体类型
export interface BaseEntity {
  id: number
  createTime: string
  updateTime: string
  createBy?: number
  updateBy?: number
  status: number
} 