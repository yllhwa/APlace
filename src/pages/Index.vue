<script setup>
import Header from "../components/Header.vue";
import Canvas from "../components/Canvas.vue";
import Pannel from "../components/Pannel.vue";
</script>

<template>
  <Header />
  <Canvas :drawColor="drawColor" />
  <Pannel class="left-0 right-0 absolute bottom-0" @colorClick="colorClick" />
</template>
<script>
export default {
  data() {
    return {
      drawColor: "rgb(255, 255, 255)",
    };
  },
  methods: {
    colorClick(color) {
      this.drawColor = color;
    },
  },
};
</script>
<style></style>
