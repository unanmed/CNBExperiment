<script lang="ts">
  import RightBar from "./components/rightBar.vue";
  import LeftBar from "./components/leftBar.vue";
  import { defineComponent } from "vue";

  export default defineComponent({
    name: "App",
    data() {
      return {
        rightToolbar: true
      };
    },
    components: { RightBar, LeftBar }
});
</script>

<template>
  <canvas id="objects"></canvas>
  <canvas id="fields"></canvas>
  <RightBar></RightBar>
  <LeftBar></LeftBar>
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
