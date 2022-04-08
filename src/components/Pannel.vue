<script setup>
import { ref, reactive } from "vue";
const colors = reactive([
  "rgb(0, 0, 0)",
  "rgb(255, 255, 255)",
  "rgb(170, 170, 170)",
  "rgb(85, 85, 85)",
  "rgb(254, 211, 199)",
  "rgb(255, 196, 206)",
  "rgb(250, 172, 142)",
  "rgb(255, 139, 131)",
  "rgb(244, 67, 54)",
  "rgb(233, 30, 99)",
  "rgb(226, 102, 158)",
  "rgb(156, 39, 176)",
  "rgb(103, 58, 183)",
  "rgb(63, 81, 181)",
  "rgb(0, 70, 112)",
  "rgb(5, 113, 151)",
  "rgb(33, 150, 243)",
  "rgb(0, 188, 212)",
  "rgb(59, 229, 219)",
  "rgb(151, 253, 220)",
  "rgb(22, 115, 0)",
  "rgb(55, 169, 60)",
  "rgb(137, 230, 66)",
  "rgb(215, 255, 7)",
  "rgb(255, 246, 209)",
  "rgb(248, 203, 140)",
  "rgb(255, 235, 59)",
  "rgb(255, 193, 7)",
  "rgb(255, 152, 0)",
  "rgb(255, 87, 34)",
  "rgb(184, 63, 39)",
  "rgb(121, 85, 72)",
]);
const props = defineProps({
  drawColor: String,
});
const emits = defineEmits(["colorClick"]);
const handleColorClick = (color) => {
  emits("colorClick", color);
};
</script>

<template>
  <div class="flex flex-row justify-center bg-gray-200 rounded-t-lg">
    <div class="flex flex-row flex-nowrap gap-4 p-5 overflow-x-auto">
      <span
        v-for="color in colors"
        class="w-8 h-8 rounded flex-shrink-0 hover:transform hover:scale-130 cursor-pointer"
        :class="{ choosed: props.drawColor == color }"
        :key="color"
        :style="{ backgroundColor: color }"
        @click="handleColorClick(color)"
      >
      </span>
    </div>
  </div>
</template>
<style scoped>
.choosed {
  @apply ring-3 ring-blue-300 transform scale-130;
}
</style>
