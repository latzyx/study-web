import type { RouteRecordRaw } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";

const routes: Array<RouteRecordRaw> = [
    {
        path: "/login",
        name: "Login",
        component: () => import("../views/Login/index.vue"),
        meta: { 
            requiresAuth: false,
            title: "登录" 
        }
    },
    {
        path: "/",
        redirect: "/home"
    },
    {
        path: "/",
        component: () => import("../layout/MainLayout.vue"),
        meta: { requiresAuth: true },
        children: [
            // 学习平台
            {
                path: "home",
                name: "Home",
                component: () => import("../views/Home/index.vue"),
                meta: { title: "学习平台" }
            },
            {
                path: "video/:id",
                name: "VideoPlayer",
                component: () => import("../views/Video/Player.vue"),
                meta: { title: "视频播放" },
                props: true
            },
            // 学习记录
            {
                path: "learning/history",
                name: "LearningHistory",
                component: () => import("../views/Learning/History.vue"),
                meta: { title: "学习记录" }
            },
            // 我的收藏
            {
                path: "learning/favorites",
                name: "LearningFavorites",
                component: () => import("../views/Learning/Favorites.vue"),
                meta: { title: "我的收藏" }
            },
            // 学习笔记
            {
                path: "learning/notes",
                name: "LearningNotes",
                component: () => import("../views/Learning/Notes.vue"),
                meta: { title: "学习笔记" }
            },
            // 学习开发
            // 开发课程
            {
                path: "dev/courses",
                name: "DevCourses",
                component: () => import("../views/Dev/Courses.vue"),
                meta: { title: "开发课程" }
            },
            // 我开发的课程
            {
                path: "dev/my-courses",
                name: "DevMyCourses",
                component: () => import("../views/Dev/MyCourses.vue"),
                meta: { title: "我开发的课程" }
            },
            // 课程排行
            {
                path: "dev/rankings",
                name: "DevRankings",
                component: () => import("../views/Dev/Rankings.vue"),
                meta: { title: "课程排行" }
            },
            // 课程详情
            {
                path: "dev/course-details/:id?",
                name: "DevCourseDetails",
                component: () => import("../views/Dev/CourseDetails.vue"),
                meta: { title: "课程详情" },
                props: true
            },
            // 课程编辑
            {
                path: "dev/course-edit/:id?",
                name: "DevCourseEdit",
                component: () => import("../views/Dev/CourseEdit.vue"),
                meta: { title: "编辑课程" },
                props: true
            },
            // 课程预览
            {
                path: "dev/course-preview/:id",
                name: "DevCoursePreview",
                component: () => import("../views/Dev/CoursePreview.vue"),
                meta: { title: "课程预览" },
                props: true
            },
            // 系统管理
            // 上传文件
            {
                path: "system/upload",
                name: "SystemUpload",
                component: () => import("../views/System/Upload.vue"),
                meta: { title: "上传文件", roles: ['admin'] }
            },
            // 制定学习任务
            {
                path: "system/tasks",
                name: "SystemTasks",
                component: () => import("../views/System/Tasks.vue"),
                meta: { title: "制定学习任务", roles: ['admin'] }
            },
            // 学习任务完成情况
            {
                path: "system/progress",
                name: "SystemProgress",
                component: () => import("../views/System/Progress.vue"),
                meta: { title: "学习任务完成情况", roles: ['admin'] }
            },
            // 导出学习记录
            {
                path: "system/export",
                name: "SystemExport",
                component: () => import("../views/System/Export.vue"),
                meta: { title: "导出学习记录", roles: ['admin'] }
            },
            // 系统管理
            // 用户管理
            {
                path: "admin/users",
                name: "AdminUsers",
                component: () => import("../views/Admin/Users.vue"),
                meta: { title: "用户管理", roles: ['admin'] }
            },
            // 部门管理
            {
                path: "admin/departments",
                name: "AdminDepartments",
                component: () => import("../views/Admin/Departments.vue"),
                meta: { title: "部门管理", roles: ['admin'] }
            },
            // 角色管理
            {
                path: "admin/roles",
                name: "AdminRoles",
                component: () => import("../views/Admin/Roles.vue"),
                meta: { title: "角色管理", roles: ['admin'] }
            },
            // 字典管理
            {
                path: "admin/dictionaries",
                name: "AdminDictionaries",
                component: () => import("../views/Admin/Dictionaries.vue"),
                meta: { title: "字典管理", roles: ['admin'] }
            },
            // 定时任务
            {
                path: "admin/tasks",
                name: "AdminTasks",
                component: () => import("../views/Admin/Tasks.vue"),
                meta: { title: "定时任务", roles: ['admin'] }
            },
            // 数据同步
            {
                path: "admin/sync",
                name: "AdminSync",
                component: () => import("../views/Admin/Sync.vue"),
                meta: { title: "数据同步", roles: ['admin'] }
            },
            // 个人中心
            {
                path: "profile",
                name: "Profile",
                component: () => import("../views/User/Profile.vue"),
                meta: { title: "个人信息", hideInMenu: true }
            },
            // 个性化设置
            {
                path: "settings",
                name: "Settings",
                component: () => import("../views/Settings/index.vue"),
                meta: { title: "个性化设置", hideInMenu: true }
            }
        ]
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: "/home"
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    
    // 设置页面标题
    const title = to.meta.title
    if (title) {
        document.title = `${title} - 在线学习平台`
    }
    
    // 判断该路由是否需要登录权限
    if (to.matched.some(record => record.meta.requiresAuth)) {
        // 判断当前是否有登录的token
        if (!token) {
            next({
                path: '/login',
                // 将跳转的路由path作为参数，登录成功后跳转到该路由
                query: { redirect: to.fullPath }
            })
        } else {
            // 检查是否有权限访问
            if (to.meta.roles && (to.meta.roles as string[]).length > 0) {
                // 在实际应用中，这里应该检查用户角色是否在允许列表中
                // 这里简化处理，假设有admin角色
                const hasPermission = true
                if (hasPermission) {
                    next()
                } else {
                    next('/home')
                }
            } else {
                next()
            }
        }
    } else {
        // 如果不需要登录权限的页面，但用户已登录，跳转到首页
        if (to.path === '/login' && token) {
            next({ path: '/home' })
        } else {
            next()
        }
    }
})

export default router