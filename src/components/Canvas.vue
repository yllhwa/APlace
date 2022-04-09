<script setup>
import axios from "axios";
import io from "socket.io-client";
import Utils from "../utils/utils.js";
import canvasController from "../utils/canvasController.js";
import { ref, unref, onMounted } from "@vue/runtime-core";

const props = defineProps({
  drawColor: String,
});

// 地图大小
const size = { width: 1000, height: 1000 };
// canvas DOM元素
const canvas = ref(null);
// 控制缩放、移动
let _canvasController = ref(new canvasController());
const ctx = ref(null);
// websocket
const socket = ref(null);

const drawPoint = (ctx, x, y, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
};

onMounted(() => {
  const initCanvas = (canvas) => {
    let ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    return ctx;
  };
  const initCanvasController = (canvas) => {
    unref(_canvasController).registerCanvas(canvas);
  };
  const initMap = (ctx, width, height) => {
    axios.get("/api/current_map", { responseType: "blob" }).then((response) => {
      let img_url = window.URL.createObjectURL(response.data);
      let img = new Image();
      img.src = img_url;
      img.onload = () => {
        console.log("image loaded");
        ctx.drawImage(img, 0, 0, width, height);
      };
    });
  };
  const initSocket = () => {
    let socket = io("/draw");
    socket.on("draw_operation", (data) => {
      drawPoint(unref(ctx), data.x, data.y, Utils.uint32ToRgba(data.color));
    });
    return socket;
  };
  ctx.value = initCanvas(unref(canvas));
  initCanvasController(unref(canvas));
  initMap(unref(ctx), unref(canvas).width, unref(canvas).height);
  socket.value = initSocket();
});

const handleClick = (e) => {
  if (unref(_canvasController).mouse.move) {
    return;
  }
  // 根据缩放获取相对位置
  let position = unref(_canvasController).getEventRelativePosition(e);
  let rect = unref(canvas).getBoundingClientRect();
  let map_scale_ratio = rect.width / size.width;
  position.x = Math.floor(position.x / map_scale_ratio);
  position.y = Math.floor(position.y / map_scale_ratio);
  unref(socket).emit("draw", {
    x: position.x,
    y: position.y,
    color: Utils.rgbaToUint32(unref(props.drawColor)),
  });
};
</script>

<template>
  <div
    id="canvasDiv"
    class="flex flex-row w-full h-full mx-auto overflow-hidden"
  >
    <div
      ref="canvasContainer"
      class="absolute overflow-hidden w-full h-full bg-gray-100 shadow-2xl"
    >
      <!-- 控制canvas缩放 -->
      <!-- 缩放比例和中心由canvasController控制 -->
      <div
        ref="zoomController"
        :style="{
          transform:
            'scale(' +
            _canvasController.ratio.current +
            ') ' +
            'translate(' +
            _canvasController.ratio.position.x +
            'px,' +
            _canvasController.ratio.position.y +
            'px)',
          transformOrigin:
            _canvasController.ratio.position.x +
            'px ' +
            _canvasController.ratio.position.y +
            'px',
        }"
      >
        <canvas
          ref="canvas"
          id="canvasMap"
          :width="size.width"
          :height="size.height"
          class="w-full"
          style="image-rendering: pixelated"
          @wheel="_canvasController.handleWheel"
          @mousedown="_canvasController.handleMouseDown"
          @mousemove="_canvasController.handleMouseMove"
          @mouseup="_canvasController.handleMouseUp"
          @touchstart="_canvasController.handleTouchStart"
          @touchmove="_canvasController.handleTouchMove"
          @touchcancel="_canvasController.handleTouchCancel"
          @touchend="_canvasController.handleTouchEnd"
          @click="handleClick"
        ></canvas>
      </div>
    </div>
  </div>
</template>
