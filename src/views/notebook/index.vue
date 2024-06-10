<template>
  <div class="notebook-wrapper">
    <Sidebar></Sidebar>
    <NoteList ref="noteListRef" v-model:title-focus="titleFocus"></NoteList>
    <Editor
      v-model:title-focus="titleFocus"
      @sync-title="handleSyncTitle"
      @sync-status="handleSyncStatus"
    ></Editor>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Sidebar, NoteList, Editor } from './components'

defineOptions({
  name: 'NotebookPage',
})

const titleFocus = ref(false)
const noteListRef = ref()

function handleSyncTitle(title) {
  noteListRef.value.changeNoteTitle(title)
}

function handleSyncStatus(status) {
  noteListRef.value.changeNoteStatus(status)
}
</script>

<style lang="scss" scoped>
.notebook-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
}
</style>
