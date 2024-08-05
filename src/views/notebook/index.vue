<template>
  <div class="notebook-wrapper">
    <Sidebar></Sidebar>
    <NoteList
      v-model:title-focus="titleFocus"
      v-model:active-note-index="activeNoteIndex"
    ></NoteList>
    <Editor v-model:title-focus="titleFocus" :active-note-index="activeNoteIndex"></Editor>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Sidebar, NoteList, Editor } from './components'

defineOptions({
  name: 'NotebookPage',
})

const titleFocus = ref(false)
const activeNoteIndex = ref(-1)
</script>

<style lang="scss" scoped>
.notebook-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
}
</style>
