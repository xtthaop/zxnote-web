<template>
  <div class="notebook-wrapper">
    <Sidebar></Sidebar>
    <NoteList v-model:title-focus="titleFocus"></NoteList>
    <Editor v-model:title-focus="titleFocus"></Editor>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Sidebar, NoteList, Editor } from './components'

defineOptions({
  name: 'NotebookPage',
})

const titleFocus = ref(false)
</script>

<style lang="scss" scoped>
.notebook-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
}
</style>
