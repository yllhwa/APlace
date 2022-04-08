<script setup>
import Header from "../components/Header.vue";
import Canvas from "../components/Canvas.vue";
import Pannel from "../components/Pannel.vue";
import { ref } from "vue";

let drawColor = ref("rgb(255, 255, 255)");

let colorClick = (color) => {
  drawColor.value = color;
};
</script>

<template>
  <Header />
  <Canvas :drawColor="drawColor" />
  <Pannel
    :drawColor="drawColor"
    class="left-0 right-0 absolute bottom-0"
    @colorClick="colorClick"
  />
</template>
<style></style>
