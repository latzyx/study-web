<template>
  <div class="base-table">
    <el-table
      v-loading="loading"
      :data="data"
      :border="border"
      :stripe="stripe"
      :height="height"
      @selection-change="handleSelectionChange"
    >
      <template v-if="selection">
        <el-table-column type="selection" width="55" />
      </template>
      <template v-if="index">
        <el-table-column type="index" label="序号" width="60" />
      </template>
      <slot></slot>
      <template v-if="empty">
        <el-table-column v-bind="empty" />
      </template>
    </el-table>
    <div v-if="pagination" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  border: {
    type: Boolean,
    default: true
  },
  stripe: {
    type: Boolean,
    default: true
  },
  height: {
    type: [String, Number],
    default: 'auto'
  },
  selection: {
    type: Boolean,
    default: false
  },
  index: {
    type: Boolean,
    default: true
  },
  empty: {
    type: Object,
    default: () => ({})
  },
  pagination: {
    type: Boolean,
    default: true
  },
  total: {
    type: Number,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits([
  'selection-change',
  'page-change',
  'size-change'
])

const currentPage = ref(props.page)
const pageSize = ref(props.pageSize)

watch(() => props.page, (val) => {
  currentPage.value = val
})

watch(() => props.pageSize, (val) => {
  pageSize.value = val
})

const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}

const handleSizeChange = (val: number) => {
  emit('size-change', val)
}

const handleCurrentChange = (val: number) => {
  emit('page-change', val)
}
</script>

<style scoped>
.base-table {
  width: 100%;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 