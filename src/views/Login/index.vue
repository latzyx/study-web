<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <div class="login-logo">
          <el-image :src="imageRef" class="logo-image"></el-image>
        </div>
        <h2 class="login-title">登录</h2>
        <p class="login-desc">欢迎使用系统，请登录您的账号</p>
      </div>
      <div class="login-form">
        <el-form 
          :model="loginForm" 
          ref="loginFormRef" 
          :rules="loginRules" 
          label-position="top"
          class="login-form-inner"
        >
          <el-form-item label="账户" prop="username">
            <el-input 
              v-model="loginForm.username" 
              placeholder="请输入账户"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input 
              type="password" 
              show-password 
              v-model="loginForm.password" 
              placeholder="请输入密码"
              :prefix-icon="Lock"
            />
          </el-form-item>
          <div class="form-footer">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <a href="#" class="forgot-password">忘记密码？</a>
          </div>
          <el-button type="primary" class="login-button" @click="loginSubmit" :loading="loading">
            登录
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import type {FormInstance, FormRules} from "element-plus";
import {ElMessage} from 'element-plus'
import {Lock, User} from '@element-plus/icons-vue'
import {useRoute, useRouter} from 'vue-router'
import type {LoginResult} from "@/api/services/userService";
import {userService} from "@/api/services/userService";

interface LoginForm {
  username: string
  password: string
}

const router = useRouter()
const route = useRoute()
const imageRef = ref('')
const loading = ref(false)
const rememberMe = ref(false)

const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
})

const loginFormRef = ref<FormInstance>()
const loginForm = ref<LoginForm>({
  username: '',
  password: ''
})

const handleLoginSuccess = (response: LoginResult) => {
  // 存储token
  localStorage.setItem('token', response.token)
  
  // 如果选择了记住我，可以存储用户名
  if (rememberMe.value) {
    localStorage.setItem('rememberedUsername', loginForm.value.username)
  }

  // 获取重定向路径
  const redirectPath = route.query.redirect as string
  router.push(redirectPath || '/home')
  
  ElMessage.success('登录成功')
}

const loginSubmit = async () => {
  if (!loginFormRef.value) return
  
  try {
    loading.value = true
    
    // 表单验证
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    // 调用登录接口
    const response = await userService.login(loginForm.value)
    handleLoginSuccess(response)
    
  } catch (error: any) {
    console.error('Login failed:', error)
    ElMessage.error(error.message || '登录失败，请重试')
  } finally {
    loading.value = false
  }
}

// 初始化时检查是否有记住的用户名
const initRememberedUsername = () => {
  const rememberedUsername = localStorage.getItem('rememberedUsername')
  if (rememberedUsername) {
    loginForm.value.username = rememberedUsername
    rememberMe.value = true
  }
}

// 组件挂载时初始化
initRememberedUsername()
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif;
}

* {
  box-sizing: border-box;
}
</style>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #f0f2f5;
  position: absolute;
  top: 0;
  left: 0;
}

.login-content {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-logo {
  margin-bottom: 24px;
}

.logo-image {
  width: 80px;
  height: 80px;
}

.login-title {
  font-size: 24px;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 12px;
}

.login-desc {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 40px;
}

.login-form-inner {
  width: 100%;
}

.login-form :deep(.el-input__wrapper) {
  padding: 8px 11px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.forgot-password {
  color: #1890ff;
  text-decoration: none;
  font-size: 14px;
}

.forgot-password:hover {
  color: #40a9ff;
}

.login-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

:deep(.el-checkbox__label) {
  color: rgba(0, 0, 0, 0.65);
}
</style>