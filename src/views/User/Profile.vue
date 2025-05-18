<template>
  <div class="profile-container">
    <el-tabs v-model="activeTab" class="profile-tabs">
      <el-tab-pane label="基础信息" name="basic">
        <el-card class="profile-card">
          <el-form 
            :model="userForm" 
            :rules="userRules" 
            ref="userFormRef" 
            label-width="100px"
          >
            <el-form-item label="头像">
              <el-avatar :size="80" :icon="User" />
              <el-button type="primary" text class="upload-btn">更换头像</el-button>
            </el-form-item>

            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" />
            </el-form-item>

            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="userForm.nickname" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" />
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userForm.phone" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveUserInfo">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="修改密码" name="password">
        <el-card class="profile-card">
          <el-form 
            :model="passwordForm" 
            :rules="passwordRules" 
            ref="passwordFormRef" 
            label-width="120px"
          >
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input 
                v-model="passwordForm.currentPassword" 
                type="password" 
                show-password 
                placeholder="请输入当前密码"
              />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input 
                v-model="passwordForm.newPassword" 
                type="password" 
                show-password 
                placeholder="请输入新密码"
              />
            </el-form-item>

            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input 
                v-model="passwordForm.confirmPassword" 
                type="password" 
                show-password 
                placeholder="请再次输入新密码"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="changePassword">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Tab控制
const activeTab = ref('basic')

// 基础信息表单
interface UserForm {
  username: string
  nickname: string
  email: string
  phone: string
}

const userFormRef = ref<FormInstance>()
const userForm = reactive<UserForm>({
  username: 'admin',
  nickname: '管理员',
  email: 'admin@example.com',
  phone: '13800138000'
})

const userRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ]
})

const saveUserInfo = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate((valid) => {
    if (valid) {
      // 这里添加保存用户信息的API调用
      ElMessage.success('用户信息保存成功')
    }
  })
}

// 修改密码表单
interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const passwordFormRef = ref<FormInstance>()
const passwordForm = reactive<PasswordForm>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = reactive<FormRules>({
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, message: '密码长度最少6个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度最少6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass, trigger: 'blur' }
  ]
})

const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate((valid) => {
    if (valid) {
      // 这里添加修改密码的API调用
      ElMessage.success('密码修改成功')
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    }
  })
}
</script>

<style scoped>
.profile-container {
  padding: 0;
}

.profile-tabs {
  background-color: white;
  border-radius: 4px;
}

.profile-card {
  margin: 16px 0;
  border: none;
}

.upload-btn {
  margin-left: 16px;
}

:deep(.el-tabs__header) {
  margin-bottom: 0;
  padding: 0 20px;
}

:deep(.el-tabs__content) {
  padding: 0;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}
</style> 