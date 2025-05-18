<template>
  <div class="app-container">
    <router-view/>
  </div>
</template>

<script setup lang="ts">
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

* {
  box-sizing: border-box;
}
</style>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
}
</style>
