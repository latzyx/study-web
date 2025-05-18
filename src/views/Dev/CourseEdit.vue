<template>
  <div class="course-edit">
    <el-card class="edit-card">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑课程' : '创建新课程' }}</span>
          <el-button type="primary" @click="saveCourse">保存</el-button>
        </div>
      </template>

      <el-form :model="courseForm" :rules="rules" ref="courseFormRef" label-width="100px">
        <el-form-item label="课程名称" prop="title">
          <el-input v-model="courseForm.title" placeholder="请输入课程名称" />
        </el-form-item>

        <el-form-item label="课程分类" prop="category">
          <el-select v-model="courseForm.category" placeholder="请选择课程分类">
            <el-option label="前端开发" value="frontend" />
            <el-option label="后端开发" value="backend" />
            <el-option label="移动开发" value="mobile" />
            <el-option label="数据库" value="database" />
          </el-select>
        </el-form-item>

        <el-form-item label="课程简介" prop="description">
          <el-input
            v-model="courseForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入课程简介"
          />
        </el-form-item>

        <el-form-item label="课程封面">
          <el-upload
            class="cover-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload"
          >
            <img v-if="courseForm.coverUrl" :src="courseForm.coverUrl" class="cover-image" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="课程资料">
          <div class="materials-section">
            <el-upload
              class="material-uploader"
              :action="uploadUrl"
              :on-success="handleMaterialSuccess"
              :on-remove="handleMaterialRemove"
              multiple
            >
              <el-button type="primary">上传课程资料</el-button>
              <template #tip>
                <div class="el-upload__tip">支持PDF、Word、PPT等格式文件</div>
              </template>
            </el-upload>
            
            <div class="materials-list" v-if="courseForm.materials.length">
              <el-table :data="courseForm.materials" style="width: 100%">
                <el-table-column prop="name" label="文件名" />
                <el-table-column prop="size" label="大小" width="120" />
                <el-table-column label="操作" width="150">
                  <template #default="{ row }">
                    <el-button type="text" @click="previewMaterial(row)">预览</el-button>
                    <el-button type="text" @click="downloadMaterial(row)">下载</el-button>
                    <el-button type="text" class="delete-btn" @click="deleteMaterial(row)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="课程大纲">
          <div class="outline-section">
            <el-button type="primary" @click="addChapter">添加章节</el-button>
            <el-tree
              :data="courseForm.outline"
              node-key="id"
              default-expand-all
              :allow-drop="allowDrop"
              :allow-drag="allowDrag"
              draggable
            >
              <template #default="{ node, data }">
                <div class="outline-node">
                  <span>{{ data.title }}</span>
                  <span class="outline-actions">
                    <el-button type="text" @click="editNode(data)">编辑</el-button>
                    <el-button type="text" @click="addChild(data)">添加小节</el-button>
                    <el-button type="text" class="delete-btn" @click="deleteNode(node, data)">
                      删除
                    </el-button>
                  </span>
                </div>
              </template>
            </el-tree>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 章节编辑对话框 -->
    <el-dialog
      v-model="chapterDialogVisible"
      :title="editingNode ? '编辑章节' : '添加章节'"
      width="500px"
    >
      <el-form :model="chapterForm" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="chapterForm.title" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="chapterForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="chapterDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveChapter">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { UploadProps } from 'element-plus'
import type {
  CourseForm,
  CourseMaterial,
  CourseOutlineNode,
  UploadResponse,
  TreeNode
} from '@/types/course'

const isEdit = ref(false)
const courseFormRef = ref<FormInstance>()
const uploadUrl = '/api/upload' // 替换为实际的上传接口

const courseForm = reactive<CourseForm>({
  title: '',
  category: '',
  description: '',
  coverUrl: '',
  materials: [],
  outline: []
})

const rules = reactive<FormRules>({
  title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择课程分类', trigger: 'change' }],
  description: [{ required: true, message: '请输入课程简介', trigger: 'blur' }]
})

// 封面上传相关方法
const handleCoverSuccess: UploadProps['onSuccess'] = (response: UploadResponse) => {
  courseForm.coverUrl = response.url
  ElMessage.success('封面上传成功')
}

const beforeCoverUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('封面图片只能是图片格式!')
  }
  if (!isLt2M) {
    ElMessage.error('封面图片大小不能超过 2MB!')
  }

  return isImage && isLt2M
}

// 课程资料相关方法
const handleMaterialSuccess = (response: UploadResponse, file: File) => {
  const material: CourseMaterial = {
    name: file.name,
    url: response.url,
    size: file.size
  }
  courseForm.materials.push(material)
  ElMessage.success('资料上传成功')
}

const handleMaterialRemove = (material: CourseMaterial) => {
  const index = courseForm.materials.findIndex((item: CourseMaterial) => item.url === material.url)
  if (index !== -1) {
    courseForm.materials.splice(index, 1)
  }
}

const previewMaterial = (material: CourseMaterial) => {
  window.open(material.url, '_blank')
}

const downloadMaterial = (material: CourseMaterial) => {
  const link = document.createElement('a')
  link.href = material.url
  link.download = material.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const deleteMaterial = (material: CourseMaterial) => {
  const index = courseForm.materials.findIndex((item: CourseMaterial) => item.url === material.url)
  if (index !== -1) {
    courseForm.materials.splice(index, 1)
    ElMessage.success('删除成功')
  }
}

// 课程大纲相关方法
const chapterDialogVisible = ref(false)
const editingNode = ref<CourseOutlineNode | null>(null)
const chapterForm = reactive({
  title: '',
  description: ''
})

const addChapter = () => {
  editingNode.value = null
  chapterForm.title = ''
  chapterForm.description = ''
  chapterDialogVisible.value = true
}

const editNode = (node: CourseOutlineNode) => {
  editingNode.value = node
  chapterForm.title = node.title
  chapterForm.description = node.description
  chapterDialogVisible.value = true
}

const addChild = (parentNode: CourseOutlineNode) => {
  editingNode.value = {
    id: 0,
    title: '',
    description: '',
    parentId: parentNode.id
  }
  chapterForm.title = ''
  chapterForm.description = ''
  chapterDialogVisible.value = true
}

const saveChapter = () => {
  if (!chapterForm.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }

  const newNode: CourseOutlineNode = {
    id: Date.now(),
    title: chapterForm.title,
    description: chapterForm.description,
    children: []
  }

  if (editingNode.value) {
    if (editingNode.value.parentId) {
      // 添加子节点
      const parent = findNode(courseForm.outline, editingNode.value.parentId)
      if (parent && parent.children) {
        parent.children.push(newNode)
      }
    } else {
      // 编辑现有节点
      Object.assign(editingNode.value, {
        title: chapterForm.title,
        description: chapterForm.description
      })
    }
  } else {
    // 添加新章节
    courseForm.outline.push(newNode)
  }

  chapterDialogVisible.value = false
  ElMessage.success('保存成功')
}

const deleteNode = (node: TreeNode, data: CourseOutlineNode) => {
  const parent = node.parent
  const children = (parent.data.children || []) as CourseOutlineNode[]
  const index = children.findIndex(d => d.id === data.id)
  if (index !== -1) {
    children.splice(index, 1)
  }
}

const findNode = (nodes: CourseOutlineNode[], id: number): CourseOutlineNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

// 拖拽相关方法
const allowDrop = (draggingNode: TreeNode, dropNode: TreeNode, type: string) => {
  return type !== 'inner' || Boolean(dropNode.data.children)
}

const allowDrag = (draggingNode: TreeNode) => {
  return true
}

// 保存课程
const saveCourse = async () => {
  if (!courseFormRef.value) return
  
  await courseFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 调用保存接口
      ElMessage.success('保存成功')
    }
  })
}
</script>

<style scoped>
.course-edit {
  padding: 20px;
}

.edit-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.cover-uploader:hover {
  border-color: #409EFF;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cover-image {
  width: 178px;
  height: 178px;
  display: block;
}

.materials-section {
  margin-top: 10px;
}

.materials-list {
  margin-top: 20px;
}

.outline-section {
  margin-top: 10px;
}

.outline-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 8px;
}

.outline-actions {
  opacity: 0;
  transition: opacity 0.3s;
}

.outline-node:hover .outline-actions {
  opacity: 1;
}

.delete-btn {
  color: #F56C6C;
}

.delete-btn:hover {
  color: #f78989;
}
</style> 