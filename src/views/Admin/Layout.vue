<template>
  <div class="admin-container">
    <div class="page-header">
      <h1 class="page-title">{{ title }}</h1>
      <div class="page-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <div class="page-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.admin-container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.page-content {
  padding: 24px;
}
</style> 