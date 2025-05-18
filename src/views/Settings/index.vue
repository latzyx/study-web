<template>
  <div class="settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <h2>系统设置</h2>
        </div>
      </template>
      
      <el-form :model="settingsForm" label-width="120px">
        <!-- 主题颜色设置 -->
        <el-form-item label="主题颜色">
          <div class="color-picker-container">
            <div 
              v-for="(color, index) in themeColors" 
              :key="index" 
              class="color-block"
              :class="{ active: settingsForm.themeColor === color.value }"
              :style="{ backgroundColor: color.value }"
              @click="settingsForm.themeColor = color.value"
            ></div>
          </div>
        </el-form-item>
        
        <!-- 主要颜色设置 -->
        <el-form-item label="主要颜色">
          <el-color-picker v-model="settingsForm.primaryColor" show-alpha />
          <span class="color-value">{{ settingsForm.primaryColor }}</span>
        </el-form-item>

        <!-- 字体设置 -->
        <el-form-item label="系统字体">
          <el-select v-model="settingsForm.fontFamily" placeholder="请选择字体">
            <el-option
              v-for="font in fontOptions"
              :key="font.value"
              :label="font.label"
              :value="font.value"
              :style="{ fontFamily: font.value }"
            ></el-option>
          </el-select>
        </el-form-item>

        <!-- 字体大小设置 -->
        <el-form-item label="字体大小">
          <el-slider
            v-model="settingsForm.fontSize"
            :min="12"
            :max="24"
            :step="1"
            show-stops
            show-input
          ></el-slider>
        </el-form-item>

        <!-- 布局设置 -->
        <el-form-item label="布局方式">
          <el-radio-group v-model="settingsForm.layout">
            <el-radio-button label="side">侧边菜单</el-radio-button>
            <el-radio-button label="top">顶部菜单</el-radio-button>
            <el-radio-button label="mix">混合布局</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 导航模式 -->
        <el-form-item label="导航模式">
          <el-switch
            v-model="settingsForm.darkMode"
            active-text="暗黑模式"
            inactive-text="明亮模式"
          ></el-switch>
        </el-form-item>

        <!-- 固定头部 -->
        <el-form-item label="固定头部">
          <el-switch v-model="settingsForm.fixedHeader"></el-switch>
        </el-form-item>

        <!-- 显示标签栏 -->
        <el-form-item label="显示标签栏">
          <el-switch v-model="settingsForm.showTabs"></el-switch>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="applySettings">应用设置</el-button>
          <el-button @click="resetSettings">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 预览区域 -->
    <el-card class="preview-card">
      <template #header>
        <div class="card-header">
          <h2>预览效果</h2>
        </div>
      </template>
      <div 
        class="preview-container"
        :style="{
          fontFamily: settingsForm.fontFamily,
          fontSize: `${settingsForm.fontSize}px`,
          backgroundColor: settingsForm.darkMode ? '#1f1f1f' : '#f0f2f5',
          color: settingsForm.darkMode ? '#fff' : '#000'
        }"
      >
        <div class="preview-header" :style="{ backgroundColor: settingsForm.themeColor }">
          <div class="preview-title">管理系统</div>
          <div class="preview-menu">
            <div class="preview-menu-item">首页</div>
            <div class="preview-menu-item">用户</div>
            <div class="preview-menu-item">设置</div>
          </div>
        </div>
        <div class="preview-content">
          <div class="preview-sidebar" v-if="settingsForm.layout !== 'top'">
            <div class="preview-menu-item">菜单项 1</div>
            <div class="preview-menu-item">菜单项 2</div>
            <div class="preview-menu-item">菜单项 3</div>
          </div>
          <div class="preview-main">
            <div class="preview-tabs" v-if="settingsForm.showTabs">
              <div class="preview-tab">标签1</div>
              <div class="preview-tab active">标签2</div>
              <div class="preview-tab">标签3</div>
            </div>
            <div class="preview-page">
              <h3>页面内容</h3>
              <p>当前字体: {{ settingsForm.fontFamily }}</p>
              <p>当前字体大小: {{ settingsForm.fontSize }}px</p>
              <p>当前主题颜色: {{ settingsForm.themeColor }}</p>
              <p>当前布局: {{ settingsForm.layout }}</p>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

interface SettingsForm {
  themeColor: string
  primaryColor: string
  fontFamily: string
  fontSize: number
  layout: 'side' | 'top' | 'mix'
  darkMode: boolean
  fixedHeader: boolean
  showTabs: boolean
}

const settingsForm = reactive<SettingsForm>({
  themeColor: '#1890ff',
  primaryColor: '#1890ff',
  fontFamily: 'Arial',
  fontSize: 14,
  layout: 'side',
  darkMode: false,
  fixedHeader: true,
  showTabs: true
})

const themeColors = [
  { name: '拂晓蓝', value: '#1890ff' },
  { name: '薄暮红', value: '#f5222d' },
  { name: '火山橙', value: '#fa541c' },
  { name: '日暮黄', value: '#faad14' },
  { name: '极光绿', value: '#52c41a' },
  { name: '明青', value: '#13c2c2' },
  { name: '酱紫', value: '#722ed1' }
]

const fontOptions = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
  { label: '微软雅黑', value: 'Microsoft YaHei' },
  { label: '宋体', value: 'SimSun' },
  { label: '黑体', value: 'SimHei' }
]

// 应用设置
const applySettings = () => {
  // 这里可以将设置保存到localStorage或者发送到后端
  localStorage.setItem('appSettings', JSON.stringify(settingsForm))
  ElMessage.success('设置已保存并应用')
  
  // 实际项目中，这里需要将设置应用到整个应用
  document.documentElement.style.setProperty('--primary-color', settingsForm.primaryColor)
  document.documentElement.style.setProperty('--font-family', settingsForm.fontFamily)
  document.documentElement.style.setProperty('--font-size', `${settingsForm.fontSize}px`)
}

// 重置设置
const resetSettings = () => {
  settingsForm.themeColor = '#1890ff'
  settingsForm.primaryColor = '#1890ff'
  settingsForm.fontFamily = 'Arial'
  settingsForm.fontSize = 14
  settingsForm.layout = 'side'
  settingsForm.darkMode = false
  settingsForm.fixedHeader = true
  settingsForm.showTabs = true
  
  ElMessage.success('设置已重置')
}
</script>

<style scoped>
.settings-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.settings-card, .preview-card {
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.color-picker-container {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-block {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.color-block.active {
  border-color: #333;
  transform: scale(1.1);
}

.color-value {
  margin-left: 10px;
}

/* 预览区域样式 */
.preview-container {
  min-height: 300px;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.preview-header {
  height: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  color: white;
}

.preview-title {
  font-weight: bold;
}

.preview-menu {
  display: flex;
  gap: 20px;
}

.preview-menu-item {
  cursor: pointer;
  padding: 4px 0;
}

.preview-content {
  display: flex;
  min-height: 250px;
}

.preview-sidebar {
  width: 150px;
  background-color: #fff;
  border-right: 1px solid #e8e8e8;
  padding: 16px;
}

.preview-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.preview-tabs {
  display: flex;
  height: 40px;
  border-bottom: 1px solid #e8e8e8;
  background-color: #fff;
}

.preview-tab {
  padding: 8px 16px;
  cursor: pointer;
  border-right: 1px solid #e8e8e8;
}

.preview-tab.active {
  border-bottom: 2px solid #1890ff;
  color: #1890ff;
}

.preview-page {
  padding: 16px;
  background-color: #fff;
  flex: 1;
}

@media screen and (max-width: 768px) {
  .settings-container {
    grid-template-columns: 1fr;
  }
}
</style> 