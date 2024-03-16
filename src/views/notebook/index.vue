<template>
  <div class="notebook-wrapper">
    <Sidebar></Sidebar>
    <NoteList ref="noteListRef"></NoteList>
    <Editor
      @sync-title="handleSyncTitle"
      @sync-publish-status="handleSyncPublishStatus"
      @sync-publish-update-status="handleSyncPublishUpdateStatus"
    ></Editor>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Sidebar, NoteList, Editor } from './components'

defineOptions({
  name: 'NotebookPage',
})

const noteListRef = ref()

function handleSyncTitle(title) {
  noteListRef.value.changeNoteTitle(title)
}

function handleSyncPublishStatus(status) {
  noteListRef.value.changeNotePublishStatus(status)
}

function handleSyncPublishUpdateStatus(status) {
  noteListRef.value.changeNotePublishUpdateStatus(status)
}
</script>

<style lang="scss" scoped>
.notebook-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
}
</style>
