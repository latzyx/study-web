import { defineStore } from 'pinia'
import type { LayoutState, LayoutTheme } from '../types/layout'

export const useLayoutStore = defineStore('layout', {
  state: (): LayoutState & { theme: LayoutTheme } => ({
    isCollapse: false,
    sidebarWidth: 240,
    collapsedWidth: 64,
    isMobile: false,
    theme: {
      sidebarBg: '#304156',
      sidebarTextColor: '#bfcbd9',
      sidebarActiveTextColor: '#409EFF'
    }
  }),

  actions: {
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },

    setMobile(isMobile: boolean) {
      this.isMobile = isMobile
      if (isMobile) {
        this.isCollapse = true
      }
    },

    updateTheme(theme: Partial<LayoutTheme>) {
      this.theme = { ...this.theme, ...theme }
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'layout',
        storage: localStorage,
        paths: ['isCollapse', 'theme']
      }
    ]
  }
}) 