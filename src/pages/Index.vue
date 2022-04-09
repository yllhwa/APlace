<script setup>
import Header from "../components/Header.vue";
import Canvas from "../components/Canvas.vue";
import Pannel from "../components/Pannel.vue";
import RequestLogin from "../components/RequestLogin.vue";
import accessController from "../utils/accessController";
import { ref, unref } from "vue";
import { getUserState } from "../utils/oauth.js";

let userData = await getUserState();
let _accessController = ref(new accessController());
if (userData.login) {
  unref(_accessController).updateUserState(userData);
}

let drawColor = ref("rgb(255, 255, 255)");
let colorClick = (color) => {
  drawColor.value = color;
};
</script>

<template>
  <Header />
  <Canvas :drawColor="drawColor" :_accessController="_accessController" />
  <Pannel
    :drawColor="drawColor"
    v-show="_accessController.login"
    class="left-0 right-0 absolute bottom-0"
    @colorClick="colorClick"
  />
  <RequestLogin
    v-show="!_accessController.login"
    class="left-0 right-0 absolute bottom-0"
  />
</template>
<style></style>
