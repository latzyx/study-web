// API 基础配置
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
export const API_PREFIX = '/api/v1'

// HTTP 状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const

// 业务状态码
export const BUSINESS_CODE = {
  SUCCESS: 200,
  FAIL: 500,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATE_FAILED: 422
} as const

// 通用状态
export const STATUS = {
  ENABLED: 1,
  DISABLED: 0
} as const

// 文件上传配置
export const UPLOAD_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPT_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
  MAX_COUNT: 9
} as const

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
} as const

// 用户相关接口
export const USER_API = {
  BASE: `${API_PREFIX}/user`,
  LOGIN: `${API_PREFIX}/user/login`,
  ME: `${API_PREFIX}/user/me`,
  BATCH_DELETE: `${API_PREFIX}/user/batch-delete`,
  RESET_PASSWORD: (id: number) => `${API_PREFIX}/user/${id}/reset-password`,
  UPDATE_STATUS: (id: number) => `${API_PREFIX}/user/${id}/status`,
  DETAIL: (id: number) => `${API_PREFIX}/user/${id}`
}

// 角色相关接口
export const ROLE_API = {
  BASE: `${API_PREFIX}/role`,
  ALL: `${API_PREFIX}/role/all`,
  PERMISSIONS: (id: number) => `${API_PREFIX}/role/${id}/permissions`,
  DETAIL: (id: number) => `${API_PREFIX}/role/${id}`
}

// 菜单相关接口
export const MENU_API = {
  BASE: `${API_PREFIX}/menu`,
  TREE: `${API_PREFIX}/menu/tree`,
  USER: `${API_PREFIX}/menu/user`,
  SORT: `${API_PREFIX}/menu/sort`,
  DETAIL: (id: number) => `${API_PREFIX}/menu/${id}`
}

// 权限相关接口
export const PERMISSION_API = {
  BASE: `${API_PREFIX}/permission`,
  ALL: `${API_PREFIX}/permission/all`
}

// 权限类型
export const PERMISSION_TYPE = {
  MENU: 'menu',
  BUTTON: 'button'
} as const

// 用户状态
export const USER_STATUS = {
  ACTIVE: 1,      // 正常
  INACTIVE: 0,    // 禁用
  PENDING: 2,     // 待审核
  LOCKED: 3,      // 锁定
  DELETED: 4      // 已删除
} as const

// 用户状态描述
export const USER_STATUS_TEXT = {
  [USER_STATUS.ACTIVE]: '正常',
  [USER_STATUS.INACTIVE]: '禁用',
  [USER_STATUS.PENDING]: '待审核',
  [USER_STATUS.LOCKED]: '锁定',
  [USER_STATUS.DELETED]: '已删除'
} as const

// 用户状态选项
export const USER_STATUS_OPTIONS = Object.entries(USER_STATUS_TEXT).map(([value, label]) => ({
  value: Number(value),
  label
})) 