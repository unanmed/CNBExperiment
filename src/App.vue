<script setup lang="ts">

</script>

<template>
  <canvas id="objects"></canvas>
  <canvas id="fields"></canvas>
</template>

<style lang="less">
#app {
  background-color: black;
  margin: 0;
}

html, body {
  margin: 0;
}

canvas {
  position: absolute;
  width: 100%;
  height: 100%;
}

#objects {
  z-index: 100;
}

#fields {
  z-index: 50;
}

</style>
