<template>
  <div class="notes-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>学习笔记</h2>
          <div class="header-actions">
            <el-select v-model="filterValue" placeholder="筛选" class="filter-select">
              <el-option label="全部笔记" value="all" />
              <el-option label="最近添加" value="recent" />
              <el-option label="按视频分组" value="byVideo" />
            </el-select>
            <el-input
              v-model="searchQuery"
              placeholder="搜索笔记内容"
              prefix-icon="Search"
              clearable
              @input="handleSearch"
              class="search-input"
            />
          </div>
        </div>
      </template>
      
      <div v-if="notes.length === 0" class="empty-state">
        <el-empty description="暂无学习笔记">
          <el-button type="primary" @click="goToHome">去学习并记笔记</el-button>
        </el-empty>
      </div>
      
      <div v-else class="notes-list">
        <el-collapse v-if="filterValue === 'byVideo'" v-model="activeNames">
          <el-collapse-item v-for="(group, index) in notesByVideo" :key="index" :title="group.videoTitle" :name="index">
            <div v-for="(note, noteIndex) in group.notes" :key="noteIndex" class="note-item">
              <div class="note-content">
                <div class="note-text">{{ note.content }}</div>
                <div class="note-timestamp">{{ formatTimestamp(note.timestamp) }}</div>
              </div>
              <div class="note-actions">
                <el-button type="primary" text size="small" @click="editNote(note)">编辑</el-button>
                <el-button type="danger" text size="small" @click="deleteNote(note)">删除</el-button>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
        
        <template v-else>
          <div v-for="(note, index) in filteredNotes" :key="index" class="note-item">
            <div class="note-header">
              <span class="note-video-title" @click="goToVideo(note.videoId)">{{ note.videoTitle }}</span>
              <span class="note-time">{{ note.createdAt }}</span>
            </div>
            <div class="note-content">
              <div class="note-text">{{ note.content }}</div>
              <div class="note-timestamp">{{ formatTimestamp(note.timestamp) }}</div>
            </div>
            <div class="note-actions">
              <el-button type="primary" text size="small" @click="editNote(note)">编辑</el-button>
              <el-button type="danger" text size="small" @click="deleteNote(note)">删除</el-button>
            </div>
          </div>
        </template>
      </div>
    </el-card>
    
    <!-- 编辑笔记对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑笔记" width="500px">
      <el-form :model="editingNote">
        <el-form-item label="笔记内容">
          <el-input
            type="textarea"
            v-model="editingNote.content"
            :rows="4"
            placeholder="请输入笔记内容"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveNote">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const searchQuery = ref('')
const filterValue = ref('all')
const activeNames = ref([0]) // 默认展开第一个
const dialogVisible = ref(false)
const editingNote = ref({
  id: 0,
  content: '',
  videoId: 0,
  videoTitle: '',
  timestamp: 0,
  createdAt: ''
})

// 模拟数据
const notes = ref([
  {
    id: 1,
    videoId: 1,
    videoTitle: 'Vue3 组件化开发实战',
    content: 'Composition API 比 Options API 更灵活，可以更好地组织逻辑和复用代码。',
    timestamp: 120, // 视频时间点，单位：秒
    createdAt: '2023-10-15 14:30'
  },
  {
    id: 2,
    videoId: 1,
    videoTitle: 'Vue3 组件化开发实战',
    content: 'ref 用于基本类型，reactive 用于对象类型。注意 reactive 对象的解构会失去响应性。',
    timestamp: 350,
    createdAt: '2023-10-15 14:45'
  },
  {
    id: 3,
    videoId: 2,
    videoTitle: 'React Hooks 最佳实践',
    content: 'useEffect 的依赖数组很重要，空数组表示只在组件挂载和卸载时执行。',
    timestamp: 180,
    createdAt: '2023-10-12 09:20'
  },
  {
    id: 4,
    videoId: 3,
    videoTitle: 'TypeScript 高级教程',
    content: '泛型可以帮助我们创建可复用的组件，同时保持类型安全。',
    timestamp: 240,
    createdAt: '2023-10-10 16:15'
  }
])

// 按视频分组的笔记
const notesByVideo = computed(() => {
  const groups: Record<number, { videoTitle: string, notes: any[] }> = {}
  
  notes.value.forEach(note => {
    if (!groups[note.videoId]) {
      groups[note.videoId] = {
        videoTitle: note.videoTitle,
        notes: []
      }
    }
    groups[note.videoId].notes.push(note)
  })
  
  return Object.values(groups)
})

// 过滤笔记
const filteredNotes = computed(() => {
  let result = [...notes.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    result = result.filter(note => 
      note.content.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      note.videoTitle.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // 按时间筛选
  if (filterValue.value === 'recent') {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  
  return result
})

// 格式化时间戳
const formatTimestamp = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 搜索
const handleSearch = () => {
  // 实际应用中应该调用API搜索
  console.log('搜索:', searchQuery.value)
}

// 跳转到视频
const goToVideo = (videoId: number) => {
  router.push(`/video/${videoId}?timestamp=${findNoteTimestamp(videoId)}`)
}

// 查找该视频的第一个笔记时间点
const findNoteTimestamp = (videoId: number) => {
  const note = notes.value.find(n => n.videoId === videoId)
  return note ? note.timestamp : 0
}

// 编辑笔记
const editNote = (note: any) => {
  editingNote.value = { ...note }
  dialogVisible.value = true
}

// 保存笔记
const saveNote = () => {
  // 实际应用中应该调用API保存
  const index = notes.value.findIndex(n => n.id === editingNote.value.id)
  if (index !== -1) {
    notes.value[index].content = editingNote.value.content
  }
  
  dialogVisible.value = false
  ElMessage.success('笔记已更新')
}

// 删除笔记
const deleteNote = (note: any) => {
  ElMessageBox.confirm(
    '确定要删除这条笔记吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实际应用中应该调用API删除
    notes.value = notes.value.filter(n => n.id !== note.id)
    ElMessage.success('笔记已删除')
  }).catch(() => {})
}

// 跳转到首页
const goToHome = () => {
  router.push('/home')
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-input {
  width: 220px;
}

.filter-select {
  width: 140px;
}

.empty-state {
  padding: 40px 0;
}

.notes-list {
  margin-top: 16px;
}

.note-item {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s;
}

.note-item:last-child {
  border-bottom: none;
}

.note-item:hover {
  background-color: #f9f9f9;
}

.note-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.note-video-title {
  font-weight: 500;
  color: #409eff;
  cursor: pointer;
}

.note-video-title:hover {
  text-decoration: underline;
}

.note-time {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

.note-content {
  margin-bottom: 8px;
}

.note-text {
  line-height: 1.6;
  margin-bottom: 8px;
}

.note-timestamp {
  font-size: 14px;
  color: #909399;
}

.note-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    margin-top: 12px;
    flex-direction: column;
    gap: 8px;
  }
  
  .search-input, .filter-select {
    width: 100%;
  }
}
</style> 