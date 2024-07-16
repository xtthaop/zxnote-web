<template>
  <el-dialog
    title="Markdown语法参考"
    v-model="dialogVisible"
    :close-on-click-modal="true"
    :draggable="true"
    :show-close="true"
    width="500px"
  >
    <el-scrollbar style="height: 390px">
      <pre v-html="content"></pre>
    </el-scrollbar>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import file from './file-markdown'

defineOptions({
  name: 'FileMarkdown',
})

const dialogVisible = ref(false)
const content = file.replaceAll(
  /####### (.*)\s/g,
  '<div style="color: var(--base-primary-color);opacity: 0.5;margin-bottom: 5px">$1</div>'
)

function open() {
  dialogVisible.value = true
}

defineExpose({
  open,
})
</script>

<style scoped lang="scss">
pre {
  font-size: 14px;
  line-height: 20px;
  white-space: pre-wrap;
  margin: 0;
  margin-right: 10px;
}
</style>
