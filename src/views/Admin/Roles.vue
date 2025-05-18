<template>
  <AdminLayout title="角色管理">
    <template #actions>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增角色
      </el-button>
      <el-button @click="handleRefresh">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
    </template>
    
    <!-- 搜索区域 -->
    <el-card class="filter-container">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input v-model="searchForm.code" placeholder="请输入角色编码" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
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
        :data="roleList"
        border
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色编码" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="userCount" label="用户数" width="100" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="primary" size="small" @click="handlePermission(scope.row)">权限设置</el-button>
            <el-button 
              link 
              :type="scope.row.status === 'active' ? 'danger' : 'success'" 
              size="small" 
              @click="handleToggleStatus(scope.row)"
              :disabled="isSystemRole(scope.row)"
            >
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button 
              link 
              type="danger" 
              size="small" 
              @click="handleDelete(scope.row)"
              :disabled="isSystemRole(scope.row)"
            >
              删除
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
    
    <!-- 角色表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formType === 'add' ? '新增角色' : '编辑角色'"
      width="500px"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色编码" :disabled="formType === 'edit' && isSystemRole(roleForm)" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="roleForm.status" :disabled="formType === 'edit' && isSystemRole(roleForm)">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 权限设置对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="权限设置"
      width="600px"
    >
      <el-alert
        :title="`正在为角色 [${currentRole?.name}] 设置权限`"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-tabs v-model="permissionActiveTab">
        <el-tab-pane label="菜单权限" name="menu">
          <el-tree
            ref="menuTreeRef"
            :data="menuTree"
            show-checkbox
            node-key="id"
            :props="{ label: 'name' }"
            :default-checked-keys="checkedMenuKeys"
          />
        </el-tab-pane>
        <el-tab-pane label="操作权限" name="operation">
          <el-checkbox-group v-model="checkedOperations">
            <el-descriptions border>
              <el-descriptions-item v-for="(group, index) in operationGroups" :key="index" :label="group.name" :span="3">
                <el-space wrap>
                  <el-checkbox v-for="op in group.operations" :key="op.id" :label="op.id">{{ op.name }}</el-checkbox>
                </el-space>
              </el-descriptions-item>
            </el-descriptions>
          </el-checkbox-group>
        </el-tab-pane>
        <el-tab-pane label="数据权限" name="data">
          <el-radio-group v-model="dataPermissionType">
            <el-radio label="all">全部数据权限</el-radio>
            <el-radio label="dept">本部门数据权限</el-radio>
            <el-radio label="self">本人数据权限</el-radio>
            <el-radio label="custom">自定义数据权限</el-radio>
          </el-radio-group>
          
          <div v-if="dataPermissionType === 'custom'" class="custom-departments">
            <div class="dept-tree-title">选择部门：</div>
            <el-tree
              ref="deptTreeRef"
              :data="departmentTree"
              show-checkbox
              node-key="id"
              :props="{ label: 'name' }"
              :default-checked-keys="checkedDeptKeys"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePermissions">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import AdminLayout from './Layout.vue'

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  status: ''
})

// 列表数据
const loading = ref(false)
const roleList = ref([
  {
    id: 1,
    name: '系统管理员',
    code: 'admin',
    description: '系统最高权限，可以访问和操作系统的所有功能',
    userCount: 2,
    createTime: '2023-01-01 10:00:00',
    status: 'active',
    isSystem: true
  },
  {
    id: 2,
    name: '部门管理员',
    code: 'dept_admin',
    description: '部门级管理员，可以管理本部门的用户和数据',
    userCount: 5,
    createTime: '2023-01-02 10:00:00',
    status: 'active',
    isSystem: true
  },
  {
    id: 3,
    name: '普通用户',
    code: 'user',
    description: '普通用户，可以访问基本功能',
    userCount: 20,
    createTime: '2023-01-03 10:00:00',
    status: 'active',
    isSystem: true
  },
  {
    id: 4,
    name: '访客',
    code: 'guest',
    description: '访客用户，只有浏览权限，不能操作数据',
    userCount: 8,
    createTime: '2023-01-04 10:00:00',
    status: 'active',
    isSystem: true
  },
  {
    id: 5,
    name: '测试角色',
    code: 'test',
    description: '用于测试的角色',
    userCount: 1,
    createTime: '2023-02-01 10:00:00',
    status: 'inactive',
    isSystem: false
  }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 角色表单
const formType = ref('add') // add 或 edit
const dialogVisible = ref(false)
const roleFormRef = ref<FormInstance>()
const roleForm = reactive({
  id: null,
  name: '',
  code: '',
  description: '',
  status: 'active',
  isSystem: false
})

// 表单验证规则
const roleRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '角色编码只能包含字母、数字和下划线', trigger: 'blur' }
  ]
})

// 权限设置
const permissionDialogVisible = ref(false)
const permissionActiveTab = ref('menu')
const currentRole = ref<any>(null)

// 菜单树
const menuTreeRef = ref<any>(null)
const menuTree = ref([
  {
    id: 1,
    name: '系统管理',
    children: [
      { id: 101, name: '用户管理' },
      { id: 102, name: '角色管理' },
      { id: 103, name: '部门管理' },
      { id: 104, name: '菜单管理' },
      { id: 105, name: '字典管理' },
      { id: 106, name: '定时任务' },
      { id: 107, name: '数据同步' }
    ]
  },
  {
    id: 2,
    name: '内容管理',
    children: [
      { id: 201, name: '视频管理' },
      { id: 202, name: '分类管理' },
      { id: 203, name: '标签管理' },
      { id: 204, name: '评论管理' }
    ]
  },
  {
    id: 3,
    name: '学习中心',
    children: [
      { id: 301, name: '学习记录' },
      { id: 302, name: '收藏管理' },
      { id: 303, name: '笔记管理' }
    ]
  }
])
const checkedMenuKeys = ref<number[]>([])

// 操作权限
const checkedOperations = ref<string[]>([])
const operationGroups = ref([
  {
    name: '用户管理',
    operations: [
      { id: 'user:view', name: '查看用户' },
      { id: 'user:add', name: '新增用户' },
      { id: 'user:edit', name: '编辑用户' },
      { id: 'user:delete', name: '删除用户' },
      { id: 'user:export', name: '导出用户' },
      { id: 'user:import', name: '导入用户' },
      { id: 'user:resetPwd', name: '重置密码' }
    ]
  },
  {
    name: '角色管理',
    operations: [
      { id: 'role:view', name: '查看角色' },
      { id: 'role:add', name: '新增角色' },
      { id: 'role:edit', name: '编辑角色' },
      { id: 'role:delete', name: '删除角色' },
      { id: 'role:permission', name: '设置权限' }
    ]
  },
  {
    name: '部门管理',
    operations: [
      { id: 'dept:view', name: '查看部门' },
      { id: 'dept:add', name: '新增部门' },
      { id: 'dept:edit', name: '编辑部门' },
      { id: 'dept:delete', name: '删除部门' }
    ]
  }
])

// 数据权限
const dataPermissionType = ref('all')
const deptTreeRef = ref<any>(null)
const departmentTree = ref([
  {
    id: 1,
    name: '总公司',
    children: [
      { id: 2, name: '技术部' },
      { id: 3, name: '市场部' },
      { id: 4, name: '财务部' }
    ]
  },
  {
    id: 5,
    name: '分公司',
    children: [
      { id: 6, name: '销售部' },
      { id: 7, name: '服务部' }
    ]
  }
])
const checkedDeptKeys = ref<number[]>([])

// 初始化
onMounted(() => {
  fetchRoleList()
})

// 获取角色列表
const fetchRoleList = () => {
  loading.value = true
  // 这里应该调用API获取角色列表
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 处理查询
const handleSearch = () => {
  currentPage.value = 1
  fetchRoleList()
}

// 重置查询
const resetSearch = () => {
  searchForm.name = ''
  searchForm.code = ''
  searchForm.status = ''
  handleSearch()
}

// 处理刷新
const handleRefresh = () => {
  fetchRoleList()
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchRoleList()
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchRoleList()
}

// 新增角色
const handleAdd = () => {
  formType.value = 'add'
  resetRoleForm()
  dialogVisible.value = true
}

// 编辑角色
const handleEdit = (row: any) => {
  formType.value = 'edit'
  resetRoleForm()
  Object.assign(roleForm, row)
  dialogVisible.value = true
}

// 重置角色表单
const resetRoleForm = () => {
  roleForm.id = null
  roleForm.name = ''
  roleForm.code = ''
  roleForm.description = ''
  roleForm.status = 'active'
  roleForm.isSystem = false
}

// 提交表单
const submitForm = async () => {
  if (!roleFormRef.value) return
  
  await roleFormRef.value.validate(async (valid) => {
    if (valid) {
      // 这里应该调用API保存角色
      console.log('保存角色:', roleForm)
      
      ElMessage.success(formType.value === 'add' ? '角色创建成功' : '角色信息更新成功')
      dialogVisible.value = false
      fetchRoleList()
    }
  })
}

// 设置权限
const handlePermission = (row: any) => {
  currentRole.value = row
  
  // 加载该角色的权限数据
  // 这里应该调用API获取角色的权限数据
  // 模拟数据
  if (row.code === 'admin') {
    // 系统管理员拥有所有权限
    checkedMenuKeys.value = [1, 101, 102, 103, 104, 105, 106, 107, 2, 201, 202, 203, 204, 3, 301, 302, 303]
    checkedOperations.value = ['user:view', 'user:add', 'user:edit', 'user:delete', 'user:export', 'user:import', 
      'user:resetPwd', 'role:view', 'role:add', 'role:edit', 'role:delete', 'role:permission', 
      'dept:view', 'dept:add', 'dept:edit', 'dept:delete']
    dataPermissionType.value = 'all'
    checkedDeptKeys.value = []
  } else if (row.code === 'dept_admin') {
    // 部门管理员有部分权限
    checkedMenuKeys.value = [1, 101, 103, 3, 301, 302, 303]
    checkedOperations.value = ['user:view', 'user:add', 'user:edit', 'user:resetPwd', 'dept:view']
    dataPermissionType.value = 'dept'
    checkedDeptKeys.value = []
  } else if (row.code === 'user') {
    // 普通用户只有基本权限
    checkedMenuKeys.value = [3, 301, 302, 303]
    checkedOperations.value = ['user:view']
    dataPermissionType.value = 'self'
    checkedDeptKeys.value = []
  } else if (row.code === 'guest') {
    // 访客只有查看权限
    checkedMenuKeys.value = [3, 301]
    checkedOperations.value = []
    dataPermissionType.value = 'self'
    checkedDeptKeys.value = []
  } else {
    // 自定义角色
    checkedMenuKeys.value = [3, 301, 302]
    checkedOperations.value = ['user:view']
    dataPermissionType.value = 'custom'
    checkedDeptKeys.value = [2, 3]
  }
  
  permissionDialogVisible.value = true
  permissionActiveTab.value = 'menu'
}

// 保存权限
const savePermissions = () => {
  // 获取选中的菜单权限
  const menuKeys = menuTreeRef.value ? menuTreeRef.value.getCheckedKeys(true) : []
  
  // 获取选中的部门
  const deptKeys = dataPermissionType.value === 'custom' && deptTreeRef.value
    ? deptTreeRef.value.getCheckedKeys(true)
    : []
  
  // 这里应该调用API保存角色权限
  console.log('保存权限:', {
    roleId: currentRole.value?.id,
    menuKeys,
    operationIds: checkedOperations.value,
    dataPermission: {
      type: dataPermissionType.value,
      deptIds: deptKeys
    }
  })
  
  ElMessage.success('权限设置成功')
  permissionDialogVisible.value = false
}

// 切换角色状态
const handleToggleStatus = (row: any) => {
  if (isSystemRole(row)) {
    ElMessage.warning('系统角色不允许修改状态')
    return
  }
  
  const action = row.status === 'active' ? '禁用' : '启用'
  
  ElMessageBox.confirm(
    `确定要${action}角色"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API更新角色状态
    row.status = row.status === 'active' ? 'inactive' : 'active'
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

// 删除角色
const handleDelete = (row: any) => {
  if (isSystemRole(row)) {
    ElMessage.warning('系统角色不允许删除')
    return
  }
  
  if (row.userCount > 0) {
    ElMessage.warning(`该角色下还有${row.userCount}个用户，不能删除`)
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除角色"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API删除角色
    roleList.value = roleList.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 判断是否为系统角色
const isSystemRole = (role: any) => {
  return role && role.isSystem === true
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

.dialog-footer {
  text-align: right;
}

.custom-departments {
  margin-top: 16px;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  padding: 16px;
}

.dept-tree-title {
  margin-bottom: 10px;
  font-weight: bold;
}
</style> 