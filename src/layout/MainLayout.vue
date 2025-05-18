<template>
  <div class="main-layout" :class="{ 'is-collapsed': isCollapse }">
    <!-- 侧边栏 -->
    <div class="main-aside" :style="sidebarStyle">
      <div class="logo-container">
        <h1 class="logo-text" v-if="!isCollapse">学习系统</h1>
        <h1 class="logo-text logo-small" v-else>学</h1>
      </div>
      
      <div class="menu-content">
        <el-scrollbar>
          <el-menu
            :default-active="activeMenu"
            class="el-menu-vertical"
            :collapse="isCollapse"
            background-color="#001529"
            text-color="#fff"
            active-text-color="#1890ff"
            :collapse-transition="false"
            router
          >
            <el-sub-menu index="/learning">
              <template #title>
                <el-icon><VideoPlay /></el-icon>
                <span>我的学习</span>
              </template>
              <el-menu-item index="/home">学习平台</el-menu-item>
              <el-menu-item index="/learning/history">学习记录</el-menu-item>
              <el-menu-item index="/learning/favorites">我的收藏</el-menu-item>
              <el-menu-item index="/learning/notes">学习笔记</el-menu-item>
            </el-sub-menu>
            
            <el-sub-menu index="/dev">
              <template #title>
                <el-icon><Edit /></el-icon>
                <span>学习开发</span>
              </template>
              <el-menu-item index="/dev/courses">开发课程</el-menu-item>
              <el-menu-item index="/dev/my-courses">我开发的课程</el-menu-item>
              <el-menu-item index="/dev/rankings">课程排行</el-menu-item>
              <el-menu-item index="/dev/course-details">课程详情</el-menu-item>
            </el-sub-menu>
            
            <el-sub-menu index="/system">
              <template #title>
                <el-icon><Monitor /></el-icon>
                <span>系统管理</span>
              </template>
              <el-menu-item index="/system/upload">上传文件</el-menu-item>
              <el-menu-item index="/system/tasks">制定学习任务</el-menu-item>
              <el-menu-item index="/system/progress">学习任务完成情况</el-menu-item>
              <el-menu-item index="/system/export">导出学习记录</el-menu-item>
            </el-sub-menu>
            
            <el-sub-menu index="/admin">
              <template #title>
                <el-icon><Setting /></el-icon>
                <span>系统设置</span>
              </template>
              <el-menu-item index="/admin/users">用户管理</el-menu-item>
              <el-menu-item index="/admin/departments">部门管理</el-menu-item>
              <el-menu-item index="/admin/roles">角色管理</el-menu-item>
              <el-menu-item index="/admin/dictionaries">字典管理</el-menu-item>
              <el-menu-item index="/admin/tasks">定时任务</el-menu-item>
              <el-menu-item index="/admin/sync">数据同步</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-scrollbar>
      </div>

      <div class="menu-toggle" @click="toggleMenu">
        <el-icon v-if="isCollapse"><Expand /></el-icon>
        <el-icon v-else><Fold /></el-icon>
      </div>
    </div>

    <!-- 主容器 -->
    <div class="main-container" :style="contentStyle">
      <!-- 头部 -->
      <el-header class="main-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index">
              {{ item }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <el-avatar :size="32" :icon="User" />
              <span class="username">管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="settings">个性化设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <div class="main-content">
        <el-scrollbar>
          <div class="content-wrapper">
            <router-view />
          </div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  User, 
  Setting, 
  Fold, 
  Expand, 
  VideoPlay,
  Edit,
  Monitor
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 布局配置
const sidebarWidth = 240
const collapsedWidth = 64

// 侧边栏折叠控制
const isCollapse = ref(false)
const isMobile = ref(false)

// 侧边栏样式
const sidebarStyle = computed(() => ({
  width: `${isCollapse.value ? collapsedWidth : sidebarWidth}px`,
  transition: 'width 0.3s'
}))

// 主内容区样式
const contentStyle = computed(() => ({
  marginLeft: `${isCollapse.value ? collapsedWidth : sidebarWidth}px`,
  transition: 'margin-left 0.3s'
}))

// 切换菜单
const toggleMenu = () => {
  isCollapse.value = !isCollapse.value
}

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 面包屑导航
const breadcrumbItems = computed(() => {
  const pathSnippets = route.path.split('/').filter(i => i)
  const result = []
  
  if (route.meta.title) {
    result.push(route.meta.title)
  }
  
  return result
})

// 顶部菜单操作
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

// 响应式处理
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    isCollapse.value = true
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 监听路由变化更新面包屑
watch(() => route.path, (newPath) => {
  // 可以在这里处理其他路由变化的逻辑
}, { immediate: true })
</script>

<style scoped>
.main-layout {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: #f0f2f5;
  overflow: hidden;
}

.main-aside {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background-color: #001529;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.logo-container {
  height: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.logo-text {
  margin: 0;
  font-size: 18px;
  color: #fff;
  text-align: center;
}

.logo-text.logo-small {
  font-size: 24px;
}

.menu-content {
  flex: 1;
  overflow: hidden;
}

.el-menu-vertical {
  border-right: none;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 240px;
}

.menu-toggle {
  height: 48px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-toggle:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.main-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background-color: #f0f2f5;
}

.main-header {
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.main-content {
  height: calc(100vh - 64px);
  overflow: hidden;
}

.content-wrapper {
  padding: 16px;
  box-sizing: border-box;
  min-height: 100%;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  font-size: 14px;
}

/* 响应式样式 */
@media screen and (max-width: 768px) {
  .main-aside {
    transform: translateX(v-bind('isCollapse ? "-100%" : "0"'));
    transition: transform 0.3s;
  }

  .main-container {
    margin-left: 0 !important;
  }

  .main-layout.is-collapsed .main-aside {
    transform: translateX(-100%);
  }
}

:deep(.el-scrollbar__wrap) {
  overflow-x: hidden !important;
}
</style> 