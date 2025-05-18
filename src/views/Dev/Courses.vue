<template>
  <div class="dev-courses-container">
    <el-card class="page-header">
      <div class="header-content">
        <h2>开发课程</h2>
        <el-button type="primary" @click="handleCreateCourse">创建新课程</el-button>
      </div>
    </el-card>

    <el-card class="course-tools">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="我的课程开发" name="my">
          <el-empty v-if="myCourses.length === 0" description="暂无开发中的课程" />
          <div v-else class="course-list">
            <el-card v-for="course in myCourses" :key="course.id" class="course-card">
              <div class="course-info">
                <h3>{{ course.title }}</h3>
                <p class="course-desc">{{ course.description }}</p>
                <div class="course-meta">
                  <span>开发进度: {{ course.progress }}%</span>
                  <span>最后更新: {{ course.lastUpdate }}</span>
                </div>
                <div class="course-actions">
                  <el-button type="primary" size="small" @click="handleEditCourse(course)">继续编辑</el-button>
                  <el-button type="success" size="small" @click="handlePreviewCourse(course)">预览</el-button>
                  <el-button type="danger" size="small" @click="handleDeleteCourse(course)">删除</el-button>
                </div>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
        <el-tab-pane label="课程模板" name="templates">
          <div class="templates-grid">
            <el-card v-for="template in courseTemplates" :key="template.id" class="template-card">
              <div class="template-info">
                <h3>{{ template.name }}</h3>
                <p>{{ template.description }}</p>
                <div class="template-meta">
                  <span>适用对象: {{ template.target }}</span>
                  <span>推荐级别: {{ template.level }}</span>
                </div>
                <div class="template-actions">
                  <el-button type="primary" size="small" @click="handleUseTemplate(template)">使用此模板</el-button>
                  <el-button size="small" @click="handlePreviewTemplate(template)">查看详情</el-button>
                </div>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 创建课程对话框 -->
    <el-dialog v-model="createDialogVisible" title="创建新课程" width="600px">
      <el-form :model="courseForm" :rules="courseRules" ref="courseFormRef" label-width="100px">
        <el-form-item label="课程名称" prop="title">
          <el-input v-model="courseForm.title" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="课程简介" prop="description">
          <el-input v-model="courseForm.description" type="textarea" :rows="3" placeholder="请输入课程简介" />
        </el-form-item>
        <el-form-item label="课程类型" prop="type">
          <el-select v-model="courseForm.type" placeholder="请选择课程类型">
            <el-option label="视频课程" value="video" />
            <el-option label="文档课程" value="document" />
            <el-option label="混合课程" value="mixed" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度级别" prop="level">
          <el-select v-model="courseForm.level" placeholder="请选择难度级别">
            <el-option label="入门" value="beginner" />
            <el-option label="初级" value="elementary" />
            <el-option label="中级" value="intermediate" />
            <el-option label="高级" value="advanced" />
            <el-option label="专家" value="expert" />
          </el-select>
        </el-form-item>
        <el-form-item label="预计学时" prop="estimatedHours">
          <el-input-number v-model="courseForm.estimatedHours" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="是否使用模板">
          <el-switch v-model="courseForm.useTemplate" />
        </el-form-item>
        <el-form-item label="选择模板" v-if="courseForm.useTemplate">
          <el-select v-model="courseForm.templateId" placeholder="请选择模板">
            <el-option 
              v-for="template in courseTemplates" 
              :key="template.id" 
              :label="template.name" 
              :value="template.id" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCreateCourse">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 活动标签页
const activeTab = ref('my')

// 我的课程
const myCourses = ref([
  {
    id: 1,
    title: 'Vue3 入门到精通',
    description: '从零开始学习Vue3，包含Composition API、TypeScript集成等内容',
    progress: 75,
    lastUpdate: '2023-05-15',
    type: 'video',
    level: 'intermediate'
  },
  {
    id: 2,
    title: 'React基础教程',
    description: 'React框架入门，包含Hooks、组件开发、状态管理等内容',
    progress: 40,
    lastUpdate: '2023-05-20',
    type: 'mixed',
    level: 'beginner'
  }
])

// 课程模板
const courseTemplates = ref([
  {
    id: 1,
    name: '编程语言教学模板',
    description: '适用于各类编程语言基础教学的标准模板，包含理论讲解、代码示例、练习和测验等环节',
    target: '初学者',
    level: '入门-中级'
  },
  {
    id: 2,
    name: '框架实战模板',
    description: '面向已有基础的学员，以实战项目为导向的教学模板，包含项目搭建、模块开发、测试和部署等环节',
    target: '有经验的开发者',
    level: '中级-高级'
  },
  {
    id: 3,
    name: '技术专题模板',
    description: '针对特定技术领域的深入讲解模板，适合制作技术专题课程',
    target: '专业开发者',
    level: '高级-专家'
  }
])

// 创建课程相关
const createDialogVisible = ref(false)
const courseFormRef = ref<FormInstance>()
const courseForm = reactive({
  title: '',
  description: '',
  type: 'video',
  level: 'beginner',
  estimatedHours: 10,
  useTemplate: false,
  templateId: null
})

// 表单验证规则
const courseRules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入课程名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入课程简介', trigger: 'blur' },
    { max: 200, message: '最多 200 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择课程类型', trigger: 'change' }
  ],
  level: [
    { required: true, message: '请选择难度级别', trigger: 'change' }
  ],
  estimatedHours: [
    { required: true, message: '请输入预计学时', trigger: 'blur' }
  ]
})

// 处理创建课程
const handleCreateCourse = () => {
  createDialogVisible.value = true
  courseForm.title = ''
  courseForm.description = ''
  courseForm.type = 'video'
  courseForm.level = 'beginner'
  courseForm.estimatedHours = 10
  courseForm.useTemplate = false
  courseForm.templateId = null
}

// 提交创建课程
const submitCreateCourse = async () => {
  if (!courseFormRef.value) return
  
  await courseFormRef.value.validate((valid) => {
    if (valid) {
      // 这里应该调用API创建课程
      ElMessage.success('课程创建成功，即将进入课程编辑页面')
      createDialogVisible.value = false
      
      // 模拟添加新课程
      const newCourse = {
        id: Date.now(),
        title: courseForm.title,
        description: courseForm.description,
        progress: 0,
        lastUpdate: new Date().toISOString().split('T')[0],
        type: courseForm.type,
        level: courseForm.level
      }
      
      myCourses.value.unshift(newCourse)
      
      // 实际项目中，这里应该跳转到课程编辑页面
    }
  })
}

// 处理编辑课程
const handleEditCourse = (course: any) => {
  ElMessage.info(`即将编辑课程: ${course.title}`)
  // 实际项目中，这里应该跳转到课程编辑页面
}

// 处理预览课程
const handlePreviewCourse = (course: any) => {
  ElMessage.info(`预览课程: ${course.title}`)
  // 实际项目中，这里应该打开课程预览
}

// 处理删除课程
const handleDeleteCourse = (course: any) => {
  ElMessageBox.confirm(
    `确定要删除课程"${course.title}"吗？此操作不可恢复。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API删除课程
    myCourses.value = myCourses.value.filter(item => item.id !== course.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 处理使用模板
const handleUseTemplate = (template: any) => {
  courseForm.useTemplate = true
  courseForm.templateId = template.id
  createDialogVisible.value = true
}

// 处理预览模板
const handlePreviewTemplate = (template: any) => {
  ElMessage.info(`查看模板详情: ${template.name}`)
  // 实际项目中，这里应该打开模板详情
}
</script>

<style scoped>
.dev-courses-container {
  padding: 0;
}

.page-header {
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0;
  font-size: 20px;
}

.course-tools {
  margin-bottom: 16px;
}

.course-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.course-card {
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.course-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.course-info h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
}

.course-desc {
  color: #606266;
  margin-bottom: 15px;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;

  -webkit-box-orient: vertical;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 14px;
  margin-bottom: 15px;
}

.course-actions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.template-card {
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.template-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.template-info h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
}

.template-info p {
  color: #606266;
  margin-bottom: 15px;
  height: 60px;
  overflow: hidden;
}

.template-meta {
  display: flex;
  flex-direction: column;
  color: #909399;
  font-size: 14px;
  margin-bottom: 15px;
}

.template-meta span {
  margin-bottom: 5px;
}

.template-actions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 