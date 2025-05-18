// 布局配置类型
export interface LayoutConfig {
  isCollapse: boolean
  sidebarWidth: number
  collapsedWidth: number
}

// 布局状态类型
export interface LayoutState extends LayoutConfig {
  isMobile: boolean
}

// 布局主题配置
export interface LayoutTheme {
  sidebarBg: string
  sidebarTextColor: string
  sidebarActiveTextColor: string
} 