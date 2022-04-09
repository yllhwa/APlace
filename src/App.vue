<script setup>
import Index from "./pages/Index.vue";
</script>

<template>
  <Suspense>
    <Index />
  </Suspense>
</template>

<style>
body {
  overflow-y: hidden;
  overflow-x: hidden;
}
</style>
