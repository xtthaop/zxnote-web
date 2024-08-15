<template>
  <router-view></router-view>
</template>

<script setup>
defineOptions({
  name: 'App',
})

document.addEventListener('keydown', (e) => {
  if (
    (e.ctrlKey || e.metaKey) &&
    e.key === 'z' &&
    !document.activeElement.matches('input, textarea')
  ) {
    e.preventDefault()
  }
})
</script>
