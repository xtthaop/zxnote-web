<template>
  <div class="notebook-wrapper">
    <Sidebar></Sidebar>
    <NoteList></NoteList>
  </div>
</template>

<script setup>
import { Sidebar, NoteList } from './components'

defineOptions({
  name: 'NotebookPage',
})
</script>

<style lang="scss" scoped>
.notebook-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
}
</style>
