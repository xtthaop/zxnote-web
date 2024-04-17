<template>
  <div class="notebook-wrapper">
    <Sidebar :note-list-loading="noteListLoading" :editor-loading="editorLoading"></Sidebar>
    <NoteList
      ref="noteListRef"
      :editor-loading="editorLoading"
      v-model:title-focus="titleFocus"
      v-model:note-list-Loading="noteListLoading"
    ></NoteList>
    <Editor
      :note-list-loading="noteListLoading"
      v-model:title-focus="titleFocus"
      v-model:editor-loading="editorLoading"
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

const titleFocus = ref(false)
const noteListLoading = ref(false)
const editorLoading = ref(false)
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
