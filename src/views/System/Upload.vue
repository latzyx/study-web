<template>
  <div class="upload-container">
    <el-card class="page-header">
      <div class="header-content">
        <h2>上传文件</h2>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="upload-main">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="课程资料" name="course">
              <div class="tab-content">
                <div class="upload-area">
                  <el-upload
                    class="upload-box"
                    drag
                    action="#"
                    :http-request="handleCourseUpload"
                    :before-upload="beforeCourseUpload"
                    :file-list="courseFileList"
                    multiple
                  >
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">
                      将文件拖到此处，或 <em>点击上传</em>
                    </div>
                    <template #tip>
                      <div class="el-upload__tip">
                        支持上传PDF、PPT、Word、视频等课程资料
                      </div>
                    </template>
                  </el-upload>

                  <div class="form-fields" v-if="courseFileList.length > 0">
                    <el-form :model="courseUploadForm" label-width="120px">
                      <el-form-item label="关联课程">
                        <el-select 
                          v-model="courseUploadForm.courseId" 
                          placeholder="请选择关联课程"
                          style="width: 100%"
                        >
                          <el-option 
                            v-for="course in courseOptions" 
                            :key="course.id" 
                            :label="course.title" 
                            :value="course.id"
                          />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="资料分类">
                        <el-select 
                          v-model="courseUploadForm.category" 
                          placeholder="请选择资料分类"
                          style="width: 100%"
                        >
                          <el-option label="PPT/课件" value="slides" />
                          <el-option label="视频教程" value="video" />
                          <el-option label="参考资料" value="reference" />
                          <el-option label="练习/作业" value="exercise" />
                          <el-option label="考试资源" value="exam" />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="资料描述">
                        <el-input 
                          v-model="courseUploadForm.description" 
                          type="textarea" 
                          :rows="2" 
                          placeholder="请输入资料描述"
                        />
                      </el-form-item>
                      <el-form-item>
                        <el-button type="primary" @click="submitCourseUpload">开始上传</el-button>
                        <el-button @click="cancelCourseUpload">取消</el-button>
                      </el-form-item>
                    </el-form>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="考试资料" name="exam">
              <div class="tab-content">
                <div class="upload-area">
                  <el-upload
                    class="upload-box"
                    drag
                    action="#"
                    :http-request="handleExamUpload"
                    :before-upload="beforeExamUpload"
                    :file-list="examFileList"
                    multiple
                  >
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">
                      将文件拖到此处，或 <em>点击上传</em>
                    </div>
                    <template #tip>
                      <div class="el-upload__tip">
                        支持上传PDF、Word格式的考试试题或答案
                      </div>
                    </template>
                  </el-upload>

                  <div class="form-fields" v-if="examFileList.length > 0">
                    <el-form :model="examUploadForm" label-width="120px">
                      <el-form-item label="考试名称">
                        <el-input 
                          v-model="examUploadForm.name" 
                          placeholder="请输入考试名称"
                        />
                      </el-form-item>
                      <el-form-item label="关联课程">
                        <el-select 
                          v-model="examUploadForm.courseId" 
                          placeholder="请选择关联课程"
                          style="width: 100%"
                        >
                          <el-option 
                            v-for="course in courseOptions" 
                            :key="course.id" 
                            :label="course.title" 
                            :value="course.id"
                          />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="资料类型">
                        <el-radio-group v-model="examUploadForm.type">
                          <el-radio label="question">试题</el-radio>
                          <el-radio label="answer">答案</el-radio>
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item label="备注">
                        <el-input 
                          v-model="examUploadForm.remark" 
                          type="textarea" 
                          :rows="2" 
                          placeholder="请输入备注信息"
                        />
                      </el-form-item>
                      <el-form-item>
                        <el-button type="primary" @click="submitExamUpload">开始上传</el-button>
                        <el-button @click="cancelExamUpload">取消</el-button>
                      </el-form-item>
                    </el-form>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="学习资源" name="resource">
              <div class="tab-content">
                <div class="upload-area">
                  <el-upload
                    class="upload-box"
                    drag
                    action="#"
                    :http-request="handleResourceUpload"
                    :before-upload="beforeResourceUpload"
                    :file-list="resourceFileList"
                    multiple
                  >
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">
                      将文件拖到此处，或 <em>点击上传</em>
                    </div>
                    <template #tip>
                      <div class="el-upload__tip">
                        支持上传各类型学习资源文件
                      </div>
                    </template>
                  </el-upload>

                  <div class="form-fields" v-if="resourceFileList.length > 0">
                    <el-form :model="resourceUploadForm" label-width="120px">
                      <el-form-item label="资源名称">
                        <el-input 
                          v-model="resourceUploadForm.name" 
                          placeholder="请输入资源名称"
                        />
                      </el-form-item>
                      <el-form-item label="资源类型">
                        <el-select 
                          v-model="resourceUploadForm.type" 
                          placeholder="请选择资源类型"
                          style="width: 100%"
                        >
                          <el-option label="技术文档" value="documentation" />
                          <el-option label="案例资料" value="case_study" />
                          <el-option label="学习指南" value="guide" />
                          <el-option label="工具资源" value="tool" />
                          <el-option label="其他资源" value="other" />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="公开权限">
                        <el-radio-group v-model="resourceUploadForm.isPublic">
                          <el-radio :label="true">公开</el-radio>
                          <el-radio :label="false">内部</el-radio>
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item label="资源描述">
                        <el-input 
                          v-model="resourceUploadForm.description" 
                          type="textarea" 
                          :rows="2" 
                          placeholder="请输入资源描述"
                        />
                      </el-form-item>
                      <el-form-item>
                        <el-button type="primary" @click="submitResourceUpload">开始上传</el-button>
                        <el-button @click="cancelResourceUpload">取消</el-button>
                      </el-form-item>
                    </el-form>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="upload-side">
          <template #header>
            <div class="card-header">
              <span>最近上传</span>
              <el-button type="primary" link @click="refreshRecentFiles">刷新</el-button>
            </div>
          </template>
          
          <el-timeline>
            <el-timeline-item
              v-for="(file, index) in recentFiles"
              :key="index"
              :timestamp="file.uploadTime"
              :type="getFileTimelineType(file.type)"
              size="large"
            >
              <div class="timeline-content">
                <h4>{{ file.name }}</h4>
                <p class="file-info">
                  <span class="file-type">{{ getFileTypeName(file.type) }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                </p>
                <div class="file-actions">
                  <el-button type="primary" link @click="previewFile(file)">预览</el-button>
                  <el-button type="danger" link @click="deleteFile(file)">删除</el-button>
                </div>
              </div>
            </el-timeline-item>
            
            <el-empty v-if="recentFiles.length === 0" description="暂无上传记录" />
          </el-timeline>
        </el-card>
        
        <el-card class="upload-stats">
          <template #header>
            <div class="card-header">
              <span>上传统计</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="stat-item">
                <div class="stat-value">{{ stats.today }}</div>
                <div class="stat-label">今日上传</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="stat-item">
                <div class="stat-value">{{ stats.week }}</div>
                <div class="stat-label">本周上传</div>
              </div>
            </el-col>
          </el-row>
          
          <el-row :gutter="20" class="stat-row">
            <el-col :span="12">
              <div class="stat-item">
                <div class="stat-value">{{ stats.month }}</div>
                <div class="stat-label">本月上传</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="stat-item">
                <div class="stat-value">{{ formatFileSize(stats.totalSize) }}</div>
                <div class="stat-label">总存储空间</div>
              </div>
            </el-col>
          </el-row>
          
          <div class="storage-progress">
            <div class="progress-label">
              <span>存储空间</span>
              <span>{{ stats.usedPercent }}%</span>
            </div>
            <el-progress 
              :percentage="stats.usedPercent" 
              :color="getStorageProgressColor(stats.usedPercent)"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

// 激活的标签
const activeTab = ref('course')

// 课程文件列表
const courseFileList = ref<any[]>([])
const courseUploadForm = reactive({
  courseId: '',
  category: '',
  description: ''
})

// 考试文件列表
const examFileList = ref<any[]>([])
const examUploadForm = reactive({
  name: '',
  courseId: '',
  type: 'question',
  remark: ''
})

// 学习资源文件列表
const resourceFileList = ref<any[]>([])
const resourceUploadForm = reactive({
  name: '',
  type: 'documentation',
  isPublic: true,
  description: ''
})

// 课程选项
const courseOptions = ref([
  { id: 1, title: 'HTML5基础教程' },
  { id: 2, title: 'CSS3高级应用' },
  { id: 3, title: 'JavaScript核心概念' },
  { id: 4, title: 'Vue3入门到精通' },
  { id: 5, title: 'React基础与实战' },
  { id: 6, title: '前端工程化实践' },
  { id: 7, title: '移动端开发技巧' },
  { id: 8, title: '前端性能优化' },
  { id: 9, title: 'TypeScript实战' },
  { id: 10, title: '前端安全最佳实践' }
])

// 最近上传文件
const recentFiles = ref([
  {
    id: 1,
    name: 'Vue3核心概念.pdf',
    type: 'pdf',
    size: 2541052,
    uploadTime: '2023-06-10 10:30:25',
    category: 'slides'
  },
  {
    id: 2,
    name: 'React组件设计.pptx',
    type: 'ppt',
    size: 4215890,
    uploadTime: '2023-06-09 15:45:12',
    category: 'slides'
  },
  {
    id: 3,
    name: '前端框架对比.docx',
    type: 'word',
    size: 1025420,
    uploadTime: '2023-06-08 09:15:30',
    category: 'reference'
  },
  {
    id: 4,
    name: 'JavaScript高级编程.mp4',
    type: 'video',
    size: 125487510,
    uploadTime: '2023-06-07 14:20:18',
    category: 'video'
  }
])

// 上传统计
const stats = reactive({
  today: 4,
  week: 15,
  month: 42,
  totalSize: 512 * 1024 * 1024, // 512MB
  usedSize: 215 * 1024 * 1024,  // 215MB
  usedPercent: 42
})

// 课程文件上传前检查
const beforeCourseUpload = (file: File) => {
  // 检查文件类型
  const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4', 'video/webm']
  
  const isAllowedType = allowedTypes.includes(file.type)
  
  if (!isAllowedType) {
    ElMessage.error('只能上传PDF、PPT、Word或视频文件!')
    return false
  }
  
  // 检查文件大小，限制为50MB
  const isLt50M = file.size / 1024 / 1024 < 50
  
  if (!isLt50M) {
    ElMessage.error('文件大小不能超过50MB!')
    return false
  }
  
  // 将文件添加到列表中
  courseFileList.value.push(file)
  
  // 阻止自动上传
  return false
}

// 考试文件上传前检查
const beforeExamUpload = (file: File) => {
  // 检查文件类型
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  
  const isAllowedType = allowedTypes.includes(file.type)
  
  if (!isAllowedType) {
    ElMessage.error('只能上传PDF或Word文件!')
    return false
  }
  
  // 检查文件大小，限制为20MB
  const isLt20M = file.size / 1024 / 1024 < 20
  
  if (!isLt20M) {
    ElMessage.error('文件大小不能超过20MB!')
    return false
  }
  
  // 将文件添加到列表中
  examFileList.value.push(file)
  
  // 阻止自动上传
  return false
}

// 学习资源文件上传前检查
const beforeResourceUpload = (file: File) => {
  // 检查文件大小，限制为100MB
  const isLt100M = file.size / 1024 / 1024 < 100
  
  if (!isLt100M) {
    ElMessage.error('文件大小不能超过100MB!')
    return false
  }
  
  // 将文件添加到列表中
  resourceFileList.value.push(file)
  
  // 阻止自动上传
  return false
}

// 课程资料上传处理
const handleCourseUpload = (options: any) => {
  // 这里只是为了保持接口一致，实际上传在submitCourseUpload中处理
}

// 考试资料上传处理
const handleExamUpload = (options: any) => {
  // 这里只是为了保持接口一致，实际上传在submitExamUpload中处理
}

// 学习资源上传处理
const handleResourceUpload = (options: any) => {
  // 这里只是为了保持接口一致，实际上传在submitResourceUpload中处理
}

// 提交课程资料上传
const submitCourseUpload = () => {
  if (!courseUploadForm.courseId) {
    ElMessage.warning('请选择关联课程')
    return
  }
  
  if (!courseUploadForm.category) {
    ElMessage.warning('请选择资料分类')
    return
  }
  
  // 这里应该调用API上传文件
  ElMessage.success(`正在上传${courseFileList.value.length}个文件，请稍候...`)
  
  // 模拟上传过程
  setTimeout(() => {
    ElMessage.success('课程资料上传成功')
    
    // 添加到最近上传列表
    const now = new Date().toLocaleString()
    const newFile = {
      id: Date.now(),
      name: courseFileList.value[0]?.name || '未知文件',
      type: getFileExtension(courseFileList.value[0]?.name || ''),
      size: courseFileList.value[0]?.size || 0,
      uploadTime: now,
      category: courseUploadForm.category
    }
    
    recentFiles.value.unshift(newFile)
    
    // 重置表单
    courseFileList.value = []
    courseUploadForm.courseId = ''
    courseUploadForm.category = ''
    courseUploadForm.description = ''
    
    // 更新统计数据
    stats.today += 1
    stats.week += 1
    stats.month += 1
    stats.usedSize += newFile.size
    stats.usedPercent = Math.round((stats.usedSize / stats.totalSize) * 100)
  }, 1500)
}

// 取消课程资料上传
const cancelCourseUpload = () => {
  courseFileList.value = []
  ElMessage.info('已取消上传')
}

// 提交考试资料上传
const submitExamUpload = () => {
  if (!examUploadForm.name) {
    ElMessage.warning('请输入考试名称')
    return
  }
  
  if (!examUploadForm.courseId) {
    ElMessage.warning('请选择关联课程')
    return
  }
  
  // 这里应该调用API上传文件
  ElMessage.success(`正在上传${examFileList.value.length}个文件，请稍候...`)
  
  // 模拟上传过程
  setTimeout(() => {
    ElMessage.success('考试资料上传成功')
    
    // 添加到最近上传列表
    const now = new Date().toLocaleString()
    const newFile = {
      id: Date.now(),
      name: examFileList.value[0]?.name || '未知文件',
      type: getFileExtension(examFileList.value[0]?.name || ''),
      size: examFileList.value[0]?.size || 0,
      uploadTime: now,
      category: 'exam'
    }
    
    recentFiles.value.unshift(newFile)
    
    // 重置表单
    examFileList.value = []
    examUploadForm.name = ''
    examUploadForm.courseId = ''
    examUploadForm.type = 'question'
    examUploadForm.remark = ''
    
    // 更新统计数据
    stats.today += 1
    stats.week += 1
    stats.month += 1
    stats.usedSize += newFile.size
    stats.usedPercent = Math.round((stats.usedSize / stats.totalSize) * 100)
  }, 1500)
}

// 取消考试资料上传
const cancelExamUpload = () => {
  examFileList.value = []
  ElMessage.info('已取消上传')
}

// 提交学习资源上传
const submitResourceUpload = () => {
  if (!resourceUploadForm.name) {
    ElMessage.warning('请输入资源名称')
    return
  }
  
  if (!resourceUploadForm.type) {
    ElMessage.warning('请选择资源类型')
    return
  }
  
  // 这里应该调用API上传文件
  ElMessage.success(`正在上传${resourceFileList.value.length}个文件，请稍候...`)
  
  // 模拟上传过程
  setTimeout(() => {
    ElMessage.success('学习资源上传成功')
    
    // 添加到最近上传列表
    const now = new Date().toLocaleString()
    const newFile = {
      id: Date.now(),
      name: resourceFileList.value[0]?.name || '未知文件',
      type: getFileExtension(resourceFileList.value[0]?.name || ''),
      size: resourceFileList.value[0]?.size || 0,
      uploadTime: now,
      category: resourceUploadForm.type
    }
    
    recentFiles.value.unshift(newFile)
    
    // 重置表单
    resourceFileList.value = []
    resourceUploadForm.name = ''
    resourceUploadForm.type = 'documentation'
    resourceUploadForm.isPublic = true
    resourceUploadForm.description = ''
    
    // 更新统计数据
    stats.today += 1
    stats.week += 1
    stats.month += 1
    stats.usedSize += newFile.size
    stats.usedPercent = Math.round((stats.usedSize / stats.totalSize) * 100)
  }, 1500)
}

// 取消学习资源上传
const cancelResourceUpload = () => {
  resourceFileList.value = []
  ElMessage.info('已取消上传')
}

// 文件预览
const previewFile = (file: any) => {
  ElMessage.info(`预览文件: ${file.name}`)
  // 实际项目中，这里应该打开文件预览
}

// 删除文件
const deleteFile = (file: any) => {
  ElMessageBox.confirm(
    `确定要删除文件"${file.name}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API删除文件
    recentFiles.value = recentFiles.value.filter(item => item.id !== file.id)
    
    // 更新统计
    stats.usedSize -= file.size
    stats.usedPercent = Math.round((stats.usedSize / stats.totalSize) * 100)
    
    ElMessage.success('文件删除成功')
  }).catch(() => {})
}

// 刷新最近文件
const refreshRecentFiles = () => {
  // 这里应该调用API获取最近上传的文件
  ElMessage.success('已刷新最近上传的文件')
}

// 文件类型的Timeline类型
const getFileTimelineType = (type: string) => {
  const map: Record<string, string> = {
    'pdf': 'primary',
    'ppt': 'success',
    'word': 'info',
    'video': 'warning',
    'audio': 'warning',
    'image': 'success',
    'zip': 'danger'
  }
  
  return map[type] || 'primary'
}

// 文件类型名称
const getFileTypeName = (type: string) => {
  const map: Record<string, string> = {
    'pdf': 'PDF文档',
    'ppt': 'PPT演示文稿',
    'word': 'Word文档',
    'video': '视频文件',
    'audio': '音频文件',
    'image': '图片',
    'zip': '压缩包'
  }
  
  return map[type] || '未知类型'
}

// 文件大小格式化
const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} MB`
  } else {
    return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
  }
}

// 存储进度条颜色
const getStorageProgressColor = (percent: number) => {
  if (percent < 50) {
    return '#67C23A'
  } else if (percent < 80) {
    return '#E6A23C'
  } else {
    return '#F56C6C'
  }
}

// 获取文件扩展名
const getFileExtension = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  
  // 简化文件类型
  if (['pdf'].includes(ext)) {
    return 'pdf'
  } else if (['ppt', 'pptx'].includes(ext)) {
    return 'ppt'
  } else if (['doc', 'docx'].includes(ext)) {
    return 'word'
  } else if (['mp4', 'webm', 'avi', 'mov'].includes(ext)) {
    return 'video'
  } else if (['mp3', 'wav', 'ogg'].includes(ext)) {
    return 'audio'
  } else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) {
    return 'image'
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return 'zip'
  } else {
    return 'other'
  }
}
</script>

<style scoped>
.upload-container {
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

.upload-main {
  margin-bottom: 16px;
}

.tab-content {
  padding: 15px 0;
}

.upload-area {
  display: flex;
  flex-direction: column;
}

.upload-box {
  margin-bottom: 20px;
}

.form-fields {
  margin-top: 20px;
}

.upload-side {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-content h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.file-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #909399;
  font-size: 13px;
}

.file-actions {
  margin-top: 5px;
}

.upload-stats {
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
  padding: 10px 0;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #606266;
}

.stat-row {
  margin-top: 15px;
}

.storage-progress {
  margin-top: 20px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
}
</style> 