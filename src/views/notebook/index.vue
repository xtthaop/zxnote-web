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

function handleSyncTitle({ noteId, noteTitle }) {
  noteListRef.value.changeNoteTitle(noteId, noteTitle)
}

function handleSyncStatus({ noteId, status }) {
  noteListRef.value.changeNoteStatus(noteId, status)
}
</script>

<style lang="scss" scoped>
.notebook-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
}
</style>
