<template>
  <AdminLayout title="字典管理">
    <template #actions>
      <el-button type="primary" @click="handleAddType">
        <el-icon><Plus /></el-icon>新增字典类型
      </el-button>
      <el-button @click="handleRefresh">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
    </template>
    
    <!-- 搜索区域 -->
    <el-card class="filter-container">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="类型名称">
          <el-input v-model="searchForm.name" placeholder="请输入类型名称" clearable />
        </el-form-item>
        <el-form-item label="类型编码">
          <el-input v-model="searchForm.code" placeholder="请输入类型编码" clearable />
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
    <div class="dict-container">
      <el-card class="dict-types-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>字典类型</span>
          </div>
        </template>
        <el-table
          v-loading="loading"
          :data="dictTypeList"
          border
          highlight-current-row
          @row-click="handleSelectType"
          style="width: 100%"
        >
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="name" label="类型名称" min-width="120" />
          <el-table-column prop="code" label="类型编码" min-width="120" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                {{ scope.row.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="scope">
              <el-button link type="primary" size="small" @click.stop="handleEditType(scope.row)">编辑</el-button>
              <el-button 
                link 
                :type="scope.row.status === 'active' ? 'danger' : 'success'"
                size="small"
                @click.stop="handleToggleTypeStatus(scope.row)"
              >
                {{ scope.row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
              <el-button 
                link 
                type="danger" 
                size="small" 
                @click.stop="handleDeleteType(scope.row)"
                :disabled="scope.row.isSystem"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      
      <el-card class="dict-items-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div>
              <span>字典数据</span>
              <span v-if="currentType" class="dict-type-name">（{{ currentType.name }}）</span>
            </div>
            <div v-if="currentType">
              <el-button type="primary" size="small" @click="handleAddItem">
                <el-icon><Plus /></el-icon>新增字典数据
              </el-button>
            </div>
          </div>
        </template>
        
        <div v-if="!currentType" class="select-type-placeholder">
          <el-empty description="请先选择字典类型" />
        </div>
        
        <el-table
          v-else
          v-loading="itemsLoading"
          :data="dictItemList"
          border
          style="width: 100%"
        >
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="label" label="字典标签" min-width="120" />
          <el-table-column prop="value" label="字典值" min-width="120" />
          <el-table-column prop="order" label="排序" width="60" />
          <el-table-column label="默认值" width="80">
            <template #default="scope">
              <el-tag v-if="scope.row.isDefault" type="success">是</el-tag>
              <span v-else>否</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                {{ scope.row.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="handleEditItem(scope.row)">编辑</el-button>
              <el-button 
                link 
                :type="scope.row.status === 'active' ? 'danger' : 'success'"
                size="small"
                @click="handleToggleItemStatus(scope.row)"
              >
                {{ scope.row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
              <el-button link type="danger" size="small" @click="handleDeleteItem(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    
    <!-- 字典类型表单对话框 -->
    <el-dialog
      v-model="typeDialogVisible"
      :title="typeForm.id ? '编辑字典类型' : '新增字典类型'"
      width="500px"
    >
      <el-form
        ref="typeFormRef"
        :model="typeForm"
        :rules="typeRules"
        label-width="100px"
      >
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="typeForm.name" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="类型编码" prop="code">
          <el-input v-model="typeForm.code" placeholder="请输入类型编码" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="typeForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="typeForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="typeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTypeForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 字典数据表单对话框 -->
    <el-dialog
      v-model="itemDialogVisible"
      :title="itemForm.id ? '编辑字典数据' : '新增字典数据'"
      width="500px"
    >
      <el-form
        ref="itemFormRef"
        :model="itemForm"
        :rules="itemRules"
        label-width="100px"
      >
        <el-form-item label="字典标签" prop="label">
          <el-input v-model="itemForm.label" placeholder="请输入字典标签" />
        </el-form-item>
        <el-form-item label="字典值" prop="value">
          <el-input v-model="itemForm.value" placeholder="请输入字典值" />
        </el-form-item>
        <el-form-item label="排序" prop="order">
          <el-input-number v-model="itemForm.order" :min="0" />
        </el-form-item>
        <el-form-item label="是否默认">
          <el-switch v-model="itemForm.isDefault" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="itemForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="itemForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="itemDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitItemForm">确定</el-button>
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

// 字典类型列表
const loading = ref(false)
const dictTypeList = ref([
  {
    id: 1,
    name: '用户状态',
    code: 'user_status',
    remark: '用户状态字典',
    status: 'active',
    isSystem: true
  },
  {
    id: 2,
    name: '性别',
    code: 'gender',
    remark: '性别字典',
    status: 'active',
    isSystem: true
  },
  {
    id: 3,
    name: '通知类型',
    code: 'notice_type',
    remark: '通知类型字典',
    status: 'active',
    isSystem: false
  },
  {
    id: 4,
    name: '操作类型',
    code: 'operation_type',
    remark: '操作类型字典',
    status: 'active',
    isSystem: false
  },
  {
    id: 5,
    name: '系统参数',
    code: 'sys_config',
    remark: '系统参数字典',
    status: 'inactive',
    isSystem: false
  }
])

// 字典数据列表
const itemsLoading = ref(false)
const dictItemList = ref<any[]>([])
const currentType = ref<any>(null)

// 字典类型表单
const typeDialogVisible = ref(false)
const typeFormRef = ref<FormInstance>()
const typeForm = reactive({
  id: null,
  name: '',
  code: '',
  remark: '',
  status: 'active'
})

// 字典类型验证规则
const typeRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入类型名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入类型编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '类型编码只能包含字母、数字和下划线', trigger: 'blur' }
  ]
})

// 字典数据表单
const itemDialogVisible = ref(false)
const itemFormRef = ref<FormInstance>()
const itemForm = reactive({
  id: null,
  typeId: null,
  label: '',
  value: '',
  order: 0,
  isDefault: false,
  remark: '',
  status: 'active'
})

// 字典数据验证规则
const itemRules = reactive<FormRules>({
  label: [
    { required: true, message: '请输入字典标签', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入字典值', trigger: 'blur' }
  ]
})

// 初始化
onMounted(() => {
  fetchDictTypeList()
})

// 获取字典类型列表
const fetchDictTypeList = () => {
  loading.value = true
  // 这里应该调用API获取字典类型列表
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 获取字典数据列表
const fetchDictItemList = (typeId: number) => {
  if (!typeId) return
  
  itemsLoading.value = true
  // 这里应该调用API获取字典数据列表
  
  // 模拟数据
  let items: any[] = []
  if (typeId === 1) {
    // 用户状态
    items = [
      { id: 101, typeId: 1, label: '正常', value: '0', order: 1, isDefault: true, status: 'active', remark: '正常状态' },
      { id: 102, typeId: 1, label: '禁用', value: '1', order: 2, isDefault: false, status: 'active', remark: '禁用状态' },
      { id: 103, typeId: 1, label: '锁定', value: '2', order: 3, isDefault: false, status: 'active', remark: '锁定状态' }
    ]
  } else if (typeId === 2) {
    // 性别
    items = [
      { id: 201, typeId: 2, label: '男', value: 'male', order: 1, isDefault: true, status: 'active', remark: '' },
      { id: 202, typeId: 2, label: '女', value: 'female', order: 2, isDefault: false, status: 'active', remark: '' },
      { id: 203, typeId: 2, label: '未知', value: 'unknown', order: 3, isDefault: false, status: 'active', remark: '' }
    ]
  } else if (typeId === 3) {
    // 通知类型
    items = [
      { id: 301, typeId: 3, label: '系统通知', value: 'system', order: 1, isDefault: true, status: 'active', remark: '' },
      { id: 302, typeId: 3, label: '活动通知', value: 'activity', order: 2, isDefault: false, status: 'active', remark: '' },
      { id: 303, typeId: 3, label: '课程更新', value: 'course', order: 3, isDefault: false, status: 'active', remark: '' }
    ]
  } else if (typeId === 4) {
    // 操作类型
    items = [
      { id: 401, typeId: 4, label: '新增', value: 'create', order: 1, isDefault: false, status: 'active', remark: '' },
      { id: 402, typeId: 4, label: '修改', value: 'update', order: 2, isDefault: false, status: 'active', remark: '' },
      { id: 403, typeId: 4, label: '删除', value: 'delete', order: 3, isDefault: false, status: 'active', remark: '' },
      { id: 404, typeId: 4, label: '查询', value: 'query', order: 4, isDefault: true, status: 'active', remark: '' },
      { id: 405, typeId: 4, label: '导出', value: 'export', order: 5, isDefault: false, status: 'active', remark: '' }
    ]
  } else {
    items = []
  }
  
  setTimeout(() => {
    dictItemList.value = items
    itemsLoading.value = false
  }, 500)
}

// 处理查询
const handleSearch = () => {
  fetchDictTypeList()
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
  fetchDictTypeList()
  if (currentType.value) {
    fetchDictItemList(currentType.value.id)
  }
}

// 选择字典类型
const handleSelectType = (row: any) => {
  currentType.value = row
  fetchDictItemList(row.id)
}

// 新增字典类型
const handleAddType = () => {
  typeForm.id = null
  typeForm.name = ''
  typeForm.code = ''
  typeForm.remark = ''
  typeForm.status = 'active'
  typeDialogVisible.value = true
}

// 编辑字典类型
const handleEditType = (row: any) => {
  Object.assign(typeForm, row)
  typeDialogVisible.value = true
}

// 提交字典类型表单
const submitTypeForm = async () => {
  if (!typeFormRef.value) return
  
  await typeFormRef.value.validate(async (valid) => {
    if (valid) {
      // 这里应该调用API保存字典类型
      console.log('保存字典类型:', typeForm)
      
      if (!typeForm.id) {
        // 新增
        const newType = { ...typeForm, id: Date.now(), isSystem: false }
        dictTypeList.value.unshift(newType)
        ElMessage.success('字典类型创建成功')
      } else {
        // 编辑
        const index = dictTypeList.value.findIndex(item => item.id === typeForm.id)
        if (index !== -1) {
          dictTypeList.value[index] = { ...dictTypeList.value[index], ...typeForm }
        }
        
        // 如果正在编辑当前选中的类型，更新currentType
        if (currentType.value && currentType.value.id === typeForm.id) {
          currentType.value = { ...currentType.value, ...typeForm }
        }
        
        ElMessage.success('字典类型更新成功')
      }
      
      typeDialogVisible.value = false
    }
  })
}

// 删除字典类型
const handleDeleteType = (row: any) => {
  if (row.isSystem) {
    ElMessage.warning('系统字典类型不能删除')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除字典类型"${row.name}"吗？删除后将无法恢复，其下所有字典数据也将被删除！`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API删除字典类型
    dictTypeList.value = dictTypeList.value.filter(item => item.id !== row.id)
    
    // 如果删除的是当前选中的类型，清空选中状态
    if (currentType.value && currentType.value.id === row.id) {
      currentType.value = null
      dictItemList.value = []
    }
    
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 切换字典类型状态
const handleToggleTypeStatus = (row: any) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  
  ElMessageBox.confirm(
    `确定要${action}字典类型"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API更新状态
    row.status = row.status === 'active' ? 'inactive' : 'active'
    
    // 如果是当前选中的类型，更新currentType
    if (currentType.value && currentType.value.id === row.id) {
      currentType.value = { ...row }
    }
    
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

// 新增字典数据
const handleAddItem = () => {
  if (!currentType.value) return
  
  itemForm.id = null
  itemForm.typeId = currentType.value.id
  itemForm.label = ''
  itemForm.value = ''
  itemForm.order = getMaxOrder() + 1
  itemForm.isDefault = false
  itemForm.remark = ''
  itemForm.status = 'active'
  itemDialogVisible.value = true
}

// 获取当前最大排序值
const getMaxOrder = () => {
  if (dictItemList.value.length === 0) return 0
  return Math.max(...dictItemList.value.map(item => item.order))
}

// 编辑字典数据
const handleEditItem = (row: any) => {
  Object.assign(itemForm, row)
  itemDialogVisible.value = true
}

// 提交字典数据表单
const submitItemForm = async () => {
  if (!itemFormRef.value) return
  
  await itemFormRef.value.validate(async (valid) => {
    if (valid) {
      // 处理默认值
      if (itemForm.isDefault) {
        // 将其他项的默认值设为false
        dictItemList.value.forEach(item => {
          if (item.id !== itemForm.id) {
            item.isDefault = false
          }
        })
      }
      
      // 这里应该调用API保存字典数据
      console.log('保存字典数据:', itemForm)
      
      if (!itemForm.id) {
        // 新增
        const newItem = { ...itemForm, id: Date.now() }
        dictItemList.value.push(newItem)
        ElMessage.success('字典数据创建成功')
      } else {
        // 编辑
        const index = dictItemList.value.findIndex(item => item.id === itemForm.id)
        if (index !== -1) {
          dictItemList.value[index] = { ...dictItemList.value[index], ...itemForm }
        }
        ElMessage.success('字典数据更新成功')
      }
      
      // 排序
      dictItemList.value.sort((a, b) => a.order - b.order)
      
      itemDialogVisible.value = false
    }
  })
}

// 删除字典数据
const handleDeleteItem = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除字典数据"${row.label}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API删除字典数据
    dictItemList.value = dictItemList.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 切换字典数据状态
const handleToggleItemStatus = (row: any) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  
  ElMessageBox.confirm(
    `确定要${action}字典数据"${row.label}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API更新状态
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

.dict-container {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.dict-types-card {
  width: 35%;
  min-width: 300px;
}

.dict-items-card {
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dict-type-name {
  font-size: 14px;
  color: #606266;
  margin-left: 10px;
}

.select-type-placeholder {
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .dict-container {
    flex-direction: column;
  }
  
  .dict-types-card {
    width: 100%;
  }
}
</style> 