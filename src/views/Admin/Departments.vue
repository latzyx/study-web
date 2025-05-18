<template>
  <AdminLayout title="部门管理">
    <template #actions>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增部门
      </el-button>
      <el-button @click="handleRefresh">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
    </template>
    
    <!-- 搜索区域 -->
    <el-card class="filter-container">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="部门名称">
          <el-input v-model="searchForm.name" placeholder="请输入部门名称" clearable />
        </el-form-item>
        <el-form-item label="部门编码">
          <el-input v-model="searchForm.code" placeholder="请输入部门编码" clearable />
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
        :data="departmentList"
        border
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children' }"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="部门名称" width="180" />
        <el-table-column prop="code" label="部门编码" width="120" />
        <el-table-column prop="manager" label="负责人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="order" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="primary" size="small" @click="handleAddChild(scope.row)">添加子部门</el-button>
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
    </el-card>
    
    <!-- 部门表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formType === 'add' ? '新增部门' : formType === 'addChild' ? '新增子部门' : '编辑部门'"
      width="600px"
    >
      <el-form
        ref="deptFormRef"
        :model="deptForm"
        :rules="deptRules"
        label-width="100px"
      >
        <el-form-item label="上级部门">
          <el-tree-select
            v-model="deptForm.parentId"
            :data="departmentTree"
            placeholder="请选择上级部门"
            :props="{ label: 'name', value: 'id' }"
            check-strictly
            :disabled="formType === 'addChild'"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="deptForm.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="部门编码" prop="code">
          <el-input v-model="deptForm.code" placeholder="请输入部门编码" />
        </el-form-item>
        <el-form-item label="负责人" prop="manager">
          <el-input v-model="deptForm.manager" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="deptForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="排序" prop="order">
          <el-input-number v-model="deptForm.order" :min="1" :max="999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="deptForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="deptForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
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
const departmentList = ref([
  {
    id: 1,
    name: '总公司',
    code: 'HQ',
    manager: '张总',
    phone: '13800138000',
    order: 1,
    status: 'active',
    createTime: '2023-01-01 10:00:00',
    remark: '总部',
    children: [
      {
        id: 2,
        parentId: 1,
        name: '技术部',
        code: 'TECH',
        manager: '李经理',
        phone: '13900139000',
        order: 1,
        status: 'active',
        createTime: '2023-01-02 10:00:00',
        remark: '技术研发部门'
      },
      {
        id: 3,
        parentId: 1,
        name: '市场部',
        code: 'MKT',
        manager: '王经理',
        phone: '13700137000',
        order: 2,
        status: 'active',
        createTime: '2023-01-03 10:00:00',
        remark: '市场营销部门'
      }
    ]
  },
  {
    id: 4,
    name: '分公司',
    code: 'BRANCH',
    manager: '赵总',
    phone: '13600136000',
    order: 2,
    status: 'active',
    createTime: '2023-01-04 10:00:00',
    remark: '分公司',
    children: [
      {
        id: 5,
        parentId: 4,
        name: '销售部',
        code: 'SALES',
        manager: '刘经理',
        phone: '13500135000',
        order: 1,
        status: 'active',
        createTime: '2023-01-05 10:00:00',
        remark: '销售部门'
      }
    ]
  }
])

// 部门树形数据（用于选择上级部门）
const departmentTree = ref([
  {
    id: 0,
    name: '顶级部门',
    children: []
  }
])

// 部门表单
const formType = ref('add') // add, edit, addChild
const dialogVisible = ref(false)
const deptFormRef = ref<FormInstance>()
const deptForm = reactive({
  id: null,
  parentId: 0,
  name: '',
  code: '',
  manager: '',
  phone: '',
  order: 1,
  status: 'active',
  remark: ''
})

// 表单验证规则
const deptRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入部门编码', trigger: 'blur' }
  ],
  manager: [
    { required: true, message: '请输入负责人姓名', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ]
})

// 初始化
onMounted(() => {
  fetchDepartmentList()
  buildDepartmentTree()
})

// 获取部门列表
const fetchDepartmentList = () => {
  loading.value = true
  // 这里应该调用API获取部门列表
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 构建部门树
const buildDepartmentTree = () => {
  // 实际应用中应该调用API获取完整的部门树
  // 这里简化处理，使用列表数据构建树形结构
  const cloneData = JSON.parse(JSON.stringify(departmentList.value))
  departmentTree.value = [
    {
      id: 0,
      name: '顶级部门',
      children: cloneData
    }
  ]
}

// 处理查询
const handleSearch = () => {
  fetchDepartmentList()
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
  fetchDepartmentList()
}

// 新增部门
const handleAdd = () => {
  formType.value = 'add'
  resetDeptForm()
  dialogVisible.value = true
}

// 新增子部门
const handleAddChild = (row: any) => {
  formType.value = 'addChild'
  resetDeptForm()
  deptForm.parentId = row.id
  dialogVisible.value = true
}

// 编辑部门
const handleEdit = (row: any) => {
  formType.value = 'edit'
  resetDeptForm()
  Object.assign(deptForm, row)
  dialogVisible.value = true
}

// 重置部门表单
const resetDeptForm = () => {
  deptForm.id = null
  deptForm.parentId = 0
  deptForm.name = ''
  deptForm.code = ''
  deptForm.manager = ''
  deptForm.phone = ''
  deptForm.order = 1
  deptForm.status = 'active'
  deptForm.remark = ''
}

// 提交表单
const submitForm = async () => {
  if (!deptFormRef.value) return
  
  await deptFormRef.value.validate(async (valid) => {
    if (valid) {
      // 这里应该调用API保存部门
      console.log('保存部门:', deptForm)
      
      let message = ''
      if (formType.value === 'add') {
        message = '部门创建成功'
      } else if (formType.value === 'addChild') {
        message = '子部门创建成功'
      } else {
        message = '部门信息更新成功'
      }
      
      ElMessage.success(message)
      dialogVisible.value = false
      fetchDepartmentList()
      buildDepartmentTree()
    }
  })
}

// 切换部门状态
const handleToggleStatus = (row: any) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  
  ElMessageBox.confirm(
    `确定要${action}部门"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API更新部门状态
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

.dialog-footer {
  text-align: right;
}
</style> 