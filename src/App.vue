<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="['NotebookPage']">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script setup>
defineOptions({
  name: 'App',
})
</script>
