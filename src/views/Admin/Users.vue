<template>
  <AdminLayout title="用户管理">
    <template #actions>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增用户
      </el-button>
      <el-button @click="handleRefresh">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
    </template>
    
    <!-- 搜索区域 -->
    <el-card class="filter-container">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="searchForm.department" placeholder="请选择部门" clearable>
            <el-option
              v-for="dept in departmentOptions"
              :key="dept.value"
              :label="dept.label"
              :value="dept.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 表格区域 -->
    <el-card class="table-container">
      <el-table
        v-loading="loading"
        :data="userList"
        border
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="department" label="部门" width="150" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="roles" label="角色" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="primary" size="small" @click="handleResetPassword(scope.row)">重置密码</el-button>
            <el-button 
              link 
              :type="scope.row.status === 'active' ? 'danger' : 'success'" 
              size="small" 
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formType === 'add' ? '新增用户' : '编辑用户'"
      width="600px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="formType === 'edit'" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select v-model="userForm.department" placeholder="请选择部门">
            <el-option
              v-for="dept in departmentOptions"
              :key="dept.value"
              :label="dept.label"
              :value="dept.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="userForm.roles" placeholder="请选择角色" multiple>
            <el-option
              v-for="role in roleOptions"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="formType === 'add'" label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item v-if="formType === 'add'" label="确认密码" prop="confirmPassword">
          <el-input v-model="userForm.confirmPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="userForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPasswordVisible"
      title="重置密码"
      width="500px"
    >
      <el-form
        ref="resetFormRef"
        :model="resetForm"
        :rules="resetRules"
        label-width="100px"
      >
        <p class="reset-tip">您正在为用户 <strong>{{ currentUser?.name }}</strong> 重置密码</p>
        <el-form-item label="新密码" prop="password">
          <el-input v-model="resetForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="resetForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetPasswordVisible = false">取消</el-button>
          <el-button type="primary" @click="submitResetPassword">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import AdminLayout from './Layout.vue'

// 搜索表单
const searchForm = reactive({
  username: '',
  name: '',
  phone: '',
  status: '',
  department: ''
})

// 部门选项
const departmentOptions = [
  { label: '技术部', value: 'tech' },
  { label: '市场部', value: 'marketing' },
  { label: '人事部', value: 'hr' },
  { label: '财务部', value: 'finance' },
  { label: '行政部', value: 'admin' }
]

// 角色选项
const roleOptions = [
  { label: '系统管理员', value: 'admin' },
  { label: '部门管理员', value: 'dept_admin' },
  { label: '普通用户', value: 'user' },
  { label: '访客', value: 'guest' }
]

// 列表数据
const loading = ref(false)
const userList = ref([
  {
    id: 1,
    username: 'admin',
    name: '管理员',
    department: '技术部',
    phone: '13800138000',
    email: 'admin@example.com',
    roles: '系统管理员',
    status: 'active'
  },
  {
    id: 2,
    username: 'zhangsan',
    name: '张三',
    department: '市场部',
    phone: '13900139000',
    email: 'zhangsan@example.com',
    roles: '部门管理员',
    status: 'active'
  },
  {
    id: 3,
    username: 'lisi',
    name: '李四',
    department: '人事部',
    phone: '13700137000',
    email: 'lisi@example.com',
    roles: '普通用户',
    status: 'inactive'
  }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 用户表单
const formType = ref('add') // add 或 edit
const dialogVisible = ref(false)
const userFormRef = ref<FormInstance>()
const userForm = reactive({
  id: null,
  username: '',
  name: '',
  phone: '',
  email: '',
  department: '',
  roles: [],
  password: '',
  confirmPassword: '',
  status: 'active'
})

// 验证密码一致性
const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== userForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const userRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  roles: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass, trigger: 'blur' }
  ]
})

// 重置密码
const resetPasswordVisible = ref(false)
const resetFormRef = ref<FormInstance>()
const currentUser = ref<any>(null)
const resetForm = reactive({
  userId: null,
  password: '',
  confirmPassword: ''
})

// 验证重置密码一致性
const validateResetPass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== resetForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 重置密码验证规则
const resetRules = reactive<FormRules>({
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateResetPass, trigger: 'blur' }
  ]
})

// 初始化
onMounted(() => {
  fetchUserList()
})

// 获取用户列表
const fetchUserList = () => {
  loading.value = true
  // 这里应该调用API获取用户列表
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 处理查询
const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

// 重置查询
const resetSearch = () => {
  searchForm.username = ''
  searchForm.name = ''
  searchForm.phone = ''
  searchForm.status = ''
  searchForm.department = ''
  handleSearch()
}

// 处理刷新
const handleRefresh = () => {
  fetchUserList()
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchUserList()
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchUserList()
}

// 新增用户
const handleAdd = () => {
  formType.value = 'add'
  resetUserForm()
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: any) => {
  formType.value = 'edit'
  resetUserForm()
  Object.assign(userForm, row)
  dialogVisible.value = true
}

// 重置用户表单
const resetUserForm = () => {
  userForm.id = null
  userForm.username = ''
  userForm.name = ''
  userForm.phone = ''
  userForm.email = ''
  userForm.department = ''
  userForm.roles = []
  userForm.password = ''
  userForm.confirmPassword = ''
  userForm.status = 'active'
}

// 提交表单
const submitForm = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      // 这里应该调用API保存用户
      console.log('保存用户:', userForm)
      
      ElMessage.success(formType.value === 'add' ? '用户创建成功' : '用户信息更新成功')
      dialogVisible.value = false
      fetchUserList()
    }
  })
}

// 处理重置密码
const handleResetPassword = (row: any) => {
  currentUser.value = row
  resetForm.userId = row.id
  resetForm.password = ''
  resetForm.confirmPassword = ''
  resetPasswordVisible.value = true
}

// 提交重置密码
const submitResetPassword = async () => {
  if (!resetFormRef.value) return
  
  await resetFormRef.value.validate(async (valid) => {
    if (valid) {
      // 这里应该调用API重置密码
      console.log('重置密码:', resetForm)
      
      ElMessage.success('密码重置成功')
      resetPasswordVisible.value = false
    }
  })
}

// 切换用户状态
const handleToggleStatus = (row: any) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  
  ElMessageBox.confirm(
    `确定要${action}用户 ${row.name} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API更新用户状态
    row.status = row.status === 'active' ? 'inactive' : 'active'
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.table-container {
  margin-bottom: 16px;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.reset-tip {
  margin-bottom: 20px;
  color: #606266;
}
</style> 